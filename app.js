const Discord = require('discord.js');
const axios = require('axios');
const client = new Discord.Client();

// TEMP URL AND OPTIONS

let options = {
    method: "GET",
    headers: {
        Authorization: `Bearer xxxx`, // Replace with your own token
        Accept: 'application/json'
    }
}

//BOT READY STATE SETUP
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  client.user.setActivity("with API")
  
  client.guilds.forEach((guild) => {
      console.log(guild.name)
      guild.channels.forEach((channel) => {
          console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
      })
  })
  
});

//BOT ERROR HANDLING
client.on('error', (err) => {
   console.log(err.message)
});

//BOT MESSAGES
client.on('message', msg => {
    if (msg.author == client.user) { // Prevent bot from responding to its own messages
        return
    }
    if (msg.content.startsWith("!")) {
        processCommand(msg)
    }
});

  async function processCommand(msg) {
    let fullCommand = msg.content.substr(1) // Remove the leading exclamation mark
    let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
    let primaryCommand = splitCommand[0] // The first word directly after the exclamation is the command
    let args = splitCommand.slice(1) // All other words are arguments/parameters/options for the command

    console.log("Command received: " + primaryCommand)
    console.log("Arguments: " + args) // There may not be any arguments
    
    if (primaryCommand == "pubg") {
        getStats(args, msg);
    } else if(primaryCommand == "help"){
        helpCommand(args, msg);
    }
    else {
        msg.channel.send("I don't understand the command. Try `!help`")
    }
  }

  function helpCommand(args, msg) {
    if (args[0] == "pubg") {
        msg.channel.send(
        `
In order to search for PUBG stats use the following command e.g. \"**!pubg Amirei duo-fpp\"**.
First argument being player name,
Second argument queue type. Viable queue types are: solo-tpp, solo-fpp, duo-tpp, duo-fpp, squad-tpp, squad-fpp.
        
        `
        )
    } else {
        msg.channel.send("I'm not sure what you need help with. Try `!help [topic]`")
    }
  }
  
  async function getStats(args, msg){
    if (args.length === 2) {
        let urlBase ="https://api.playbattlegrounds.com/shards/pc-eu";
        
        //ARGUMENTS TO VARIABLES
        let name = args[0];
        let gameType = args[1];
        let opgg = `https://pubg.op.gg/user/${name}`
        
        //GET ID
        let urlName = `${urlBase}/players?filter[playerNames]=${name}`;
        try {
            let response = await axios.get(urlName, options)
            let playerID = response.data.data[0].id;
             
            
            //GET SEASON
            let urlSeason = `${urlBase}/seasons`
            let response2 = await axios.get(urlSeason, options);
            let season = response2.data.data;
            let currentSeason = season[season.length-1].id
            
            //GET STATS
            let urlStats = `${urlBase}/players/${playerID}/seasons/${currentSeason}`;
            let response3 = await axios.get(urlStats, options);
            let stats = response3.data.data.attributes.gameModeStats[gameType];
            
            //PARSE STATS
            let bestRankPoint = stats.rankPoints.toFixed(0);
            let winPerc = ((stats.wins/(stats.wins + stats.losses))*100).toFixed(3);
            let top10 = stats.top10s;
            let kd = (stats.kills / (stats.wins + stats.losses)).toFixed(2);
            let avgDmg = (stats.damageDealt /(stats.wins + stats.losses)).toFixed(2)
            let headshotPerc = ((stats.headshotKills/stats.kills)*100).toFixed(2);
            
            console.log(`
            Ranking: ${bestRankPoint}
            Win %: ${winPerc}
            Number of top 10s: ${top10}
            K/D: ${kd}
            Average Damage: ${avgDmg}
            Headshot %: ${headshotPerc}
            `
            );
            msg.channel.send({embed: {
                color: 3447003,
                title: "Stats for player "+ name +" in the current season:",
                description: `
                Ranking: ${bestRankPoint}
                Win %: ${winPerc}
                Number of top 10s: ${top10}
                K/D: ${kd}
                Average Damage: ${avgDmg}
                Headshot %: ${headshotPerc}
                `
                }
            });
        } catch(err) {
            console.log("Player not found");
            msg.channel.send("Player not found!");
        }
    } else {
        msg.channel.send("Please provide two arguments! E.g. \"!pubg Amirei duo-fpp\"");
    }
  }

client.login('xxx'); // Login to Discord with your app's token
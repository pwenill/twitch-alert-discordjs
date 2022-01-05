const express = require('express');
const app = express()

// Default module import
const fs = require('fs');
const TwitchApi = require("node-twitch").default;
const discord = require('discord.js')

// Get Configurations server
const config = require('./storage/config.json');
const port = 3000

// Connected to twitch API
const twitch = new TwitchApi({
    client_id: config.twitch.client_id,
    client_secret: config.twitch.client_secret
});

// Get User Id With API Twitch
async function getUserId(loginName) {
    const users = await twitch.getUsers(loginName);
    const user = users.data[0];
    return user
}

module.exports.start = (bot) => {

    app.get('/', (req, res) => {
        res.send("welcome")
    })

    app.get('/add-streams-channel', (req, res) => {
        let twitch_db = JSON.parse(fs.readFileSync("./storage/twitch.json"))
        var get = req.query;
        var twitch_streamer = twitch_db.twitch_channel.find(element => element.name == get.name)

        if (get.token == undefined && get.token != config.web_token) {
            res.send({
                "data": "Erreur token not found",
                "status": "error"
            })
            return;
        }

        if (get.name == undefined) {
            res.send({
                "data": "Name not defined",
                "status": "error"
            })
            return;
        }

        if (twitch_streamer != undefined) {
            res.send({
                "data": "User existing in db",
                "status": "error"
            })
            return;
        }

        getUserId(get.name).then(val => {
            if (val == undefined) {
                res.send({
                    "data": "Users not existing in twitch",
                    "status": "error"
                })
                return;
            }

            const embed2 = new discord.MessageEmbed();
            var date_channel = new Date(val.created_at)

            const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"
            ];

            // Embed for tiwtch card user
            embed2.setTitle(val.display_name)
            embed2.setURL("https://twitch.tv/" + val.login)
            embed2.setDescription(val.description)
            embed2.addField("Total vue", "``" + val.view_count + "``", true)
            embed2.addField("Chaine crée le", `\`\`${date_channel.getDate()} ${monthNames[date_channel.getMonth()]} ${date_channel.getFullYear()}\`\``, true)
            embed2.setThumbnail(val.profile_image_url)

            bot.guilds.cache.get(config.twitch.channel_user).channels.cache.get(config.twitch.channel_user).send(embed2).then((message) => {
                twitch_db.twitch_channel.push({
                    name: get.name,
                    message: message.id,
                    channel: message.channel.id
                })

                fs.writeFileSync("./storage/twitch.json", JSON.stringify(twitch_db, null, 4), (err) => {
                    if (err) {
                        console.log(err);
                    }
                });

                res.send({
                    "data": "Users adding in db",
                    "status": "success"
                })
            })
        })
    })

    app.get('/remove-streams-channel', (req, res) => {
        let twitch_db = JSON.parse(fs.readFileSync("./storage/twitch.json"))
        var get = req.query;
        var twitch_streamer = twitch_db.twitch_channel.find(element => element.name == get.name)

        if (get.token == undefined && get.token != config.web_token) {
            res.send({
                "data": "Erreur token not found",
                "status": "error"
            })
            return;
        }

        if (get.name == undefined) {
            res.send({
                "data": "Name not defined",
                "status": "error"
            })
            return;
        }

        if (twitch_streamer == undefined) {
            res.send({
                "data": "User not existing in db",
                "status": "error"
            })
            return;
        }

        var searchUser = twitch_db.twitch_channel.indexOf(twitch_streamer)
        twitch_db.twitch_channel.splice(searchUser, 1)

        bot.guilds.cache.get(config.twitch.channel_user).channels.cache.get(twitch_streamer.channel).messages.fetch(twitch_streamer.message).then(message => {
            message.delete()
        })

        fs.writeFileSync("./storage/twitch.json", JSON.stringify(twitch_db, null, 4), (err) => {
            if (err) {
                console.log(err);
            }
        });

        res.send({
            "data": "Users sucefull deleted",
            "status": "success"
        })
        return;
    })

    app.get('/list-streams-channel', (req, res) => {
        let twitch_db = JSON.parse(fs.readFileSync("./storage/twitch.json"))
        var get = req.query;

        if (get.token == undefined && get.token != config.web_token) {
            res.send({
                "data": "Erreur token not found",
                "status": "error"
            })
            return;
        }

        var streamer = []
        twitch_db.twitch_channel.forEach(element => {
            streamer.push(element.name)
        });
        res.send({
            "data": streamer,
            "status": "success"
        })
    })

    app.listen(port, () => {
        console.log(`[SERVER] => Ready in the port (${port})`)
    })
}
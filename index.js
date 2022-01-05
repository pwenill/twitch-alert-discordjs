//#region Require

const discord = require('discord.js')
const TwitchApi = require("node-twitch").default;
const fs = require('fs');
const web_request = require('https')

Check_RequiredFile()

const config = require('./storage/config.json');
const bot = new discord.Client();

let gbl_commands = new discord.Collection();
let global_streams = []
let events = new discord.Collection();

const twitch = new TwitchApi({
    client_id: config.twitch.client_id,
    client_secret: config.twitch.client_secret
});

getUserId("twitch").then(() => {
    console.log("[TWITCH:e12] => Api ready")
}).catch(err => {
    console.error("[TWITCH] => Error: " + err.message)
    process.exit(1)
})

const server = require('./server')

//#endregion

// Get list command in the files
fs.readdir("./commands/", (err, files) => {
    if (err) console.log(err);

    var jsFiles = files.filter(f => f.split(".").pop() === "js");
    if (jsFiles.length <= 0) {
        console.log("Aucun fichier de commande !")
        return;
    }
    jsFiles.forEach((f, i) => {
        var fileGet = require("./commands/" + f);
        console.log("Fichier de commande " + f + " récupéré avec succès !")
        gbl_commands.set(fileGet.help.name, fileGet)
    });
});

// Recuperer tous les evements actuel dans le dossier /event/
fs.readdir("./events/", (err, files) => {
    if (err) console.log(err);

    var jsFiles = files.filter(f => f.split(".").pop() === "js");
    if (jsFiles.length <= 0) {
        return;
    }
    jsFiles.forEach((f, i) => {
        var fileGet = require("./events/" + f);
        events.set(fileGet.help.name, fileGet)
    });
});

//#region Twitch API
// Recupere les informations du stream
async function getStreams() {
    var uu = []
    JSON.parse(fs.readFileSync("./storage/twitch.json")).twitch_channel.forEach((element) => {
        uu.push(element.name)
    })
    if (uu.length != 0) {
        const streams = await twitch.getStreams({ channels: uu });
        return streams
    } else {
        return null;
    }
}

// Recuperer id de utilisateur via sont pseudo
async function getUserId(loginName) {
    const users = await twitch.getUsers(loginName);
    const user = users.data[0];
    return user
}
//#endregion

bot.on("ready", async() => {
    console.log("[BOT] => Ready")

    // Lance un serveur web (optional)
    server.start(bot) // Commentez le debut de cet si vous souhaitez pas utilisé le serveur web
    bot.guilds.cache.forEach(guild => {
        setInterval(() => {
            StreamsEvents(guild)
        }, config.twitch.interval_ms)
    });
});

bot.on('channelCreate', (channel) => {
    var event = events.get("channelCreate")
    if (event) event.run(bot, channel)
})

bot.on("message", message => {
    if (message.author.bot) return;

    var prefix = config.prefix;
    var messageArray = message.content.split(" ");
    var command = messageArray[0];
    var args = messageArray.slice(1)

    if (!(message.content.indexOf(prefix) != -1)) {
        return;
    }

    var commands = gbl_commands.get(command.slice(prefix.length))
    if (commands) commands.run(bot, message, args);
});

bot.on('error', (err) => {
    console.error(err)
    process.exit(1)
})

bot.login(config['token']).catch(err => {
    console.error(`[BOT] => [${err.code}]: ${err.message}`)
    process.exit(1)
});

//#region Twitch Functions
function StreamsEvents(guild) {
    var twitchData = JSON.parse(fs.readFileSync("./storage/twitch.json"))
    var cfg = JSON.parse(fs.readFileSync("./storage/config.json"));

    // Execute la fonction getStreams
    getStreams().then(val => {
        if (val == null) { return; }
        // Verifie la liste des utilisateur enregistré pour voir si il sont actuellement en live
        global_streams.forEach(element => {
            var el = val.data.find(stream => stream.user_login == element.username)
            if (el == undefined) {
                var index = global_streams.indexOf(element)
                if (index != -1) {
                    guild.channels.cache.get(element.channel).messages.fetch(element.message).then(message => {
                        message.delete()
                    })
                    global_streams.splice(index, 1)
                }
            }
        })

        if (val.length != 0) {
            val.data.forEach(element => {

                var user_channel = twitchData.twitch_channel.find(e => e.name == element.user_login)
                if (user_channel == undefined) return;

                var userData = global_streams.find(el => el.username == element.user_login)
                if (userData == undefined) {

                    getUserId(element.user_login).then((a) => {
                        const embed = new discord.MessageEmbed();
                        embed.setAuthor(element.user_name, a.profile_image_url, `https://www.twitch.tv/${element.user_login}`)
                        embed.setTitle(element.title)
                        embed.setDescription(`**${element.user_name}** est en live`)
                        embed.setURL(`https://www.twitch.tv/${element.user_login}`)
                        embed.addField("Jeux", element.game_name, true)
                        embed.addField("Viewver", element.viewer_count, true)

                        embed.setImage(element.getThumbnailUrl({
                            "width": "700",
                            "height": "400",
                        }))
                        guild.channels.cache.get(cfg.twitch.channel_id).send("@everyone https://twitch.tv/" + element.user_login, embed).then(message => {
                            global_streams.push({
                                username: element.user_login,
                                channel: message.channel.id,
                                message: message.id
                            })
                        })
                    }).catch(err => {
                        console.error("[TWITCH] => Error: " + err.message)
                    })
                }
            });
        }
    }).catch(err => {
        console.error("[TWITCH] => Error: " + err.message)
    })
}
//#endregion

// Verifie que tous les fichié important existe sinon creations de ces fichié
function Check_RequiredFile() {
    var whi = true;
    while (whi) {
        if (!fs.existsSync("./storage/")) {
            fs.mkdirSync("./storage/")
            console.log("[APP] => Dir ./storage/ not existing file is creating. (Please restart app)")
            process.exit(1)
        }
        if (!fs.existsSync("./storage/config.json")) {
            fs.writeFileSync("./storage/config.json", JSON.stringify({
                "token": "<BOT_TOKEN>",
                "prefix": "!",
                "twitch": {
                    "client_id": "<CLIENT_ID>",
                    "client_secret": "<CLIENT_SECRET>",
                    "channel_id": "<CHANNEL_SENDING_NEWS>",
                    "channel_user": "<CHANNEL_USER_SEND_INFO>",
                    "interval_ms": 40000
                },
                "web_token": "<WEB_TOKEN_FOR_CONNECTION>"
            }, null, 4))
            console.log("[APP] => File ./storage/config.json not existing, file is creating. (Please restart app)")
        }
        if (!fs.existsSync("./storage/twitch.json")) {
            fs.writeFileSync("./storage/twitch.json", JSON.stringify({
                twitch_channel: []
            }, null, 4))
            console.log("[APP] => File ./storage/twitch.json not existing, file is creating. (Please restart app)")
        }

        if (fs.existsSync("./storage/") && fs.existsSync("./storage/config.json") && fs.existsSync("./storage/twitch.json")) {
            console.log("[APP] => Config is ready")
            whi = false;
        }
    }

}
const discord = require('discord.js');
const fs = require('fs')
const TwitchApi = require("node-twitch").default;

let twitch_db = JSON.parse(fs.readFileSync("./storage/twitch.json"))
const config = require('../storage/config.json');

const twitch = new TwitchApi({
    client_id: config.twitch.client_id,
    client_secret: config.twitch.client_secret
});

async function getUserId(loginName) {
    const users = await twitch.getUsers(loginName);
    const user = users.data[0];
    return user
}

module.exports.run = async(bot, message, args) => {
    message.delete();
    const embed = new discord.MessageEmbed();

    if (args[0] == undefined && args[1] == undefined) {
        embed.setTitle('Synthaxe incorect !')
        embed.setDescription('!twitch (`users` `channels`)')
        embed.setColor("#CC0000")
        message.channel.send(embed)
        return;
    }


    if (!message.member.hasPermission(['ADMINISTRATOR'])) {
        embed.setDescription("Vous n'ete pas autoriser a effectuez cette commande !")
        embed.setColor("#CC0000")
        message.channel.send(embed).then((message) => { setTimeout(() => { message.delete() }, 2500) })
        return;
    }

    switch (args[0]) {
        case "channels":
            var channel_update_id = args[1].replace('<#', '').replace('>', '')
            if (message.guild.channels.cache.get(channel_update_id) != undefined) {
                config.twitch.channel_id = channel_update_id
                fs.writeFile('./storage/config.json', JSON.stringify(config, null, 4), (err) => {
                    if (err) {
                        console.log(err)
                    } else {
                        embed.setDescription("Le salon de modifications a bien ete modifié !")
                        embed.setColor("#CC0000")
                        message.channel.send(embed).then((message) => { setTimeout(() => { message.delete() }, 2500) })
                    }
                })
            } else {
                embed.setDescription("Le salon n'existe pas sur le serveur discord !")
                embed.setColor("#CC0000")
                message.channel.send(embed).then((message) => { setTimeout(() => { message.delete() }, 2500) })
            }
            break;
        case "users":
            switch (args[1]) {
                case "list":
                    embed.setTitle("Liste utilisateur twitch enregistré:")

                    twitch_db.twitch_channel.forEach(element => {
                        embed.addField(element.name, "``https://twitch.tv/" + element.name + "``")
                    })
                    message.channel.send(embed)
                    break;
                case "add":
                    if (args[2] == undefined) {
                        embed.setTitle('Synthaxe incorect !')
                        embed.setDescription('!twitch `users` `add` arguments is empty')
                        embed.setColor("#CC0000")
                        message.channel.send(embed)
                        return;
                    }

                    var tt = twitch_db.twitch_channel.find(element => element.name == args[2])
                    if (tt != undefined) {
                        embed.setDescription(args[2] + " est deja enregistré")
                        embed.setColor("#CC0000")
                        message.channel.send(embed).then((message) => { setTimeout(() => { message.delete() }, 2500) })
                        return;
                    }

                    getUserId(args[2]).then(val => {
                        if (val != undefined) {

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

                            message.guild.channels.cache.get(config.twitch.channel_user).send(embed2).then((message) => {
                                twitch_db.twitch_channel.push({
                                    name: args[2],
                                    message: message.id,
                                    channel: message.channel.id
                                })

                                fs.writeFileSync("./storage/twitch.json", JSON.stringify(twitch_db, null, 4), (err) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                            })

                            // Embed success
                            embed.setDescription(args[2] + " a bien ete enregistré ! \n\n ``L'annonce automatique a ete activé``")
                            embed.setColor("#CC0000")
                            message.channel.send(embed).then((message) => { setTimeout(() => { message.delete() }, 2500) })
                        } else {
                            embed.setDescription(args[2] + " n'existe pas de twitch !")
                            embed.setColor("#CC0000")
                            message.channel.send(embed).then((message) => { setTimeout(() => { message.delete() }, 2500) })
                        }
                    })
                    break;
                case "remove":
                    if (args[2] == undefined) {
                        embed.setTitle('Synthaxe incorect !')
                        embed.setDescription('!twitch `users` `remove` arguments is empty')
                        embed.setColor("#CC0000")
                        message.channel.send(embed)
                        return;
                    }

                    var tt = twitch_db.twitch_channel.find(element => element.name == args[2])
                    if (tt != undefined) {
                        var searchUser = twitch_db.twitch_channel.indexOf(tt)
                        twitch_db.twitch_channel.splice(searchUser, 1)

                        message.guild.channels.cache.get(tt.channel).messages.fetch(tt.message).then(message => {
                            message.delete()
                        })

                        fs.writeFileSync("./storage/twitch.json", JSON.stringify(twitch_db, null, 4), (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });

                        embed.setDescription(args[2] + " a ete suprimez de la configurations !")
                        embed.setColor("#CC0000")
                        message.channel.send(embed).then((message) => { setTimeout(() => { message.delete() }, 3000) })
                    } else {
                        embed.setDescription("**" + args[2] + "** n'est pas enregistré dans la base de données !")
                        embed.setColor("#CC0000")
                        message.channel.send(embed).then((message) => { setTimeout(() => { message.delete() }, 3000) })
                    }
                    break;
                default:
                    embed.setTitle('Synthaxe incorect !')
                    embed.setDescription('!twitch users (`remove` `add` `list`) (args)')
                    embed.setColor("#CC0000")
                    message.channel.send(embed)
                    break;
            }
            break;
        default:
            embed.setTitle('Synthaxe incorect !')
            embed.setDescription('!twitch (`users` `channels`)')
            embed.setColor("#CC0000")
            message.channel.send(embed)
            break;
    }
}

module.exports.help = {
    name: "twitch"
}
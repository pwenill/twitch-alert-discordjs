# Twitch Alert NodeJS

It is an application made in [NodeJS](https://nodejs.org/en/) and uses [Discord.JS](https://discord.js.org/#/) and Node [Node Twitch](https://www.npmjs.com/package/node-twitch).

Its purpose is to notify if a streamer is live, a message is sent on a discord server. It has the distinction of being easy to use. There is a web server access to added, deleted, see the list of registered users.

## Command

### Users
```bash
!twitch users
```
Add a new user via the twitch username
```bash
!twitch users add (pseudo)
```
Deleted the user via twitch username, check if he is registered
```bash
!twitch users remove (pseudo)
```
See the list of the user already registered
```bash
!twitch users list
```

### Channel
Change the default salon of notifications via the id
```bash
!twitch channels (id)
```

## Installation

Install the package via the command below.
Make sure the package.json file is exist in folder

```bash
npm i
```

## Configurations
Link useful

[Discord Developers](https://discord.com/developers/applications)

[Twitch Developers](https://dev.twitch.tv/)
```json
{
    "token": "The token of the discord bot",
    "prefix": "!",
    "twitch": {
        "client_id": "Client ID from api twitch",
        "client_secret": "Client SECRET from api twitch",
        "channel_id": "The channel to sent the message when stream start", 
        "channel_user": "The channel to sent information from user twitch",
        "interval_ms": "The number interval from bot check stream online Nombre interval que le bot verifie pour envoyé le message. Par defaut il est a 40000ms"
    },
    "web_token": "Le token pour securisé la conexions au serveur web"
}
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

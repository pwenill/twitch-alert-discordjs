# Twitch Alert NodeJS

C'est une applications fait en [NodeJS](https://nodejs.org/en/) et utilise api de [Discord.JS](https://discord.js.org/#/) et [Node Twitch](https://www.npmjs.com/package/node-twitch).

Il a pour but de notifié si un streamer est en live pour envoyé un message sur un serveur discord. Il a pour particularité d'être facile a utilisé, juste quelque commande simple. Il y a un accès serveur web pour ajouté, voir la liste des utilisateur enregistré.

## Commande

### Utilisateur
```bash
!twitch users
```

Ajout d'un nouveau utilisateurs via son pseudo twitch
```bash
!twitch users add (pseudo)
```
Suprimé un utilisateur via son pseudo twitch, verifié qu'il est deja enregistré
```bash
!twitch users remove (pseudo)
```
Voir la liste des utilisateurs deja enregistré
```bash
!twitch users list
```

### Channel
Changez le salon notifications par défaut via id du salon
```bash
!twitch channels (id)
```

## Installation

Installé les paquets via la commande ci-dessous et installations seras fait automatique.
Assurez vous bien que le fichier package.json soit bien dans le dossier

```bash
npm i
```

## Configurations
Lien utiles

[Discord Developers](https://discord.com/developers/applications)

[Twitch Developers](https://dev.twitch.tv/)
```json
{
    "token": "<BOT_TOKEN>", // Le token du bot discord
    "prefix": "!",
    "twitch": {
        "client_id": "<CLIENT_ID>", // Le client ID de twitch
        "client_secret": "<CLIENT_SECRET>", Le client SECRET de twitch
        "channel_id": "<CHANNEL_SENDING_NEWS>", // Le channel ou le serveur vas recevoir les streams
        "channel_user": "<CHANNEL_USER_SEND_INFO>", // Channel ou il envoie informations du streameurs
        "interval_ms": 40000 // Le nombre interval que le bot verifie pour envoyé le message
    },
    "web_token": "<WEB_TOKEN_FOR_CONNECTION>" // Le token pour securisé la conexions au serveur web
}
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

const { ActivityType } = require("discord.js")
module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        client.user.setActivity("ARKADAŞLAR ORUSPU COCU OLMAYIN LÜTFEN PAPAZ BURDA KAPSENT KARDEŞİMSİN")
    }
}
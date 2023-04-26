const { Client, Collection, GatewayIntentBits, Partials, ActionRowBuilder } = require("discord.js")
const Discord = require("discord.js")
const client = new Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.MessageContent,
    ]
})

const config = require("./src/config.js")
const { readdirSync } = require("fs")
const moment = require("moment")
const { REST } = require('@discordjs/rest')
const { Routes, TextInputStyle, InteractionType, ButtonStyle } = require('discord-api-types/v10')
const db = require('croxydb')

let token = config.token

client.commands = new Collection()

const rest = new REST({ version: '10' }).setToken(token)


const commands = []
readdirSync('./src/commands').forEach(async file => {
    const command = require(`./src/commands/${file}`)
    commands.push(command.data.toJSON())
    client.commands.set(command.data.name, command)
})

client.on("ready", async () => {
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        )
    } catch (error) {
        console.error(error)
    }
    console.log(`Bot logged in as ${client.user.tag}!`)
})


// Eventleri yüklüyor
readdirSync('./src/events').forEach(async file => {
    const event = require(`./src/events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
})

const modal = new Discord.ModalBuilder()
    .setCustomId('form')
    .setTitle(`Başvuru Formu`)

const bname = new Discord.TextInputBuilder()
    .setCustomId('name')
    .setLabel('İsminiz nedir?')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)

const bage = new Discord.TextInputBuilder()
    .setCustomId('age')
    .setLabel('Yaşınız nedir?')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)


const bwork_with_us = new Discord.TextInputBuilder()
    .setCustomId('work_with_us')
    .setLabel('Neden bizimle çalışmak istiyorsunuz?')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)

const bbefore_admin = new Discord.TextInputBuilder()
    .setCustomId('before_admin')
    .setLabel('Daha önce yetkili olduğunuz sunucular?')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)


const bcomments = new Discord.TextInputBuilder()
    .setCustomId('comments')
    .setLabel('Eklemek isteniğiniz not?')
    .setMinLength(1)
    .setMaxLength(100)
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('En Fazla 100 Karakter')
    .setRequired(false)

const row = new ActionRowBuilder().addComponents(bname);
const row2 = new ActionRowBuilder().addComponents(bage);
const row3 = new ActionRowBuilder().addComponents(bwork_with_us);
const row4 = new ActionRowBuilder().addComponents(bbefore_admin);
const row5 = new ActionRowBuilder().addComponents(bcomments);
modal.addComponents(row, row2, row3, row4, row5)

client.on('interactionCreate', async (intreaction) => {
    if (intreaction.customId === "basvuru") {
        await intreaction.showModal(modal)
    }
})

client.on('interactionCreate', async intreaction => {
    if (intreaction.type !== InteractionType.ModalSubmit) return;
    if (intreaction.customId === "form") {
        let onayk = db.fetch(`onaykanal_${intreaction.guild.id}`)

        const name_get = intreaction.fields.getTextInputValue('name')
        const age_get = intreaction.fields.getTextInputValue('age')
        const work_with_us_get = intreaction.fields.getTextInputValue('work_with_us')
        const before_admin_get = intreaction.fields.getTextInputValue('before_admin')
        const comments_get = intreaction.fields.getTextInputValue('comments') || " "
        const discord_tag = intreaction.user.tag
        const discord_id = intreaction.user.id


        const embed = new Discord.EmbedBuilder()
            .setTitle("Alım Başvurusu")
            .addFields(
                { name: "İsim", value: `${name_get}` },
                { name: "Yaş", value: `${age_get}` },
                { name: "Neden bizimle çalışmak istiyor?", value: `${work_with_us_get}` },
                { name: "Daha önce yetkili olduğu sunucular", value: `${before_admin_get}` },
                { name: "Discord TAG", value: `${discord_tag}`, inline: true },//Tag
                { name: "Discord Etiket", value: `<@${discord_id}>`, inline: true },//ID
                { name: "Eklemek isteniğiniz not?", value: `${comments_get}` },

            )
            .setFooter({ text: "Form'u onaylanan personellerin, mülakkat kanalına geçmeleri önemle rica olunur!." })

        const embedrow = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('onayla')
                    .setLabel('Onayla')
                    .setEmoji('✔️')
                    .setStyle(ButtonStyle.Success),
                new Discord.ButtonBuilder()
                    .setCustomId('reddet')
                    .setLabel('Reddet')
                    .setEmoji('❌')
                    .setStyle(ButtonStyle.Danger)
            )

        await intreaction.reply({ content: 'Başvurunu yetkili ekiplere iletilmiştir lütfen bekleyiniz!', ephemeral: true })
        client.channels.cache.get(onayk).send({ embeds: [embed], components: [embedrow] }).then(async m => {
            db.set(`basvuru_${m.id}`, intreaction.user.id)
        })
    }
})

client.on("interactionCreate", async (intreaction) => {
    if (!intreaction.isButton()) return;
    if (intreaction.customId == "onayla") {
        intreaction.deferUpdate()
        const userdata = await db.get(`basvuru_${intreaction.message.id}`)
        if (!userdata) return await intreaction.channel.send({ content: "Bu başvuru zaten onaylanmış ve ya reddedilmiş!", ephemeral: true})
        let duyuruk = db.fetch(`duyurukanal_${intreaction.guild.id}`)
        moment.locale('tr')
        const onayembed = new Discord.EmbedBuilder()
            .setDescription(`<@${userdata}> başvurun onaylandı. En yakın zamanda <Mülakkat> sesli odalarına giriş yap ve bekle`)
            .setColor(0x00c700)
            .setFields(
                { name: "Onaylayan Yetkili", value: `${intreaction.user}`, inline: true },
                { name: "Onaylama Zamanı", value: `${moment().format('LLL')}`, inline: true }
            )

        client.channels.cache.get(duyuruk).send({ content: `<@${userdata}>`, embeds: [onayembed] })
        db.delete(`basvuru_${intreaction.message.id}`)
    } else if (intreaction.customId == "reddet") {
        intreaction.deferUpdate()
        const userdata = await db.get(`basvuru_${intreaction.message.id}`)
        if (!userdata) return await intreaction.channel.send({ content: "Bu başvuru zaten onaylanmış ve ya reddedilmiş!", ephemeral: true})
        let duyuruk = db.fetch(`duyurukanal_${intreaction.guild.id}`)
        moment.locale('tr')
        const redembed = new Discord.EmbedBuilder()
            .setDescription(`<@${userdata}> başvurun reddedildi. Üzülme, Başka zaman tekrar deneyebilirsin! `)
            .setColor(0xc70000)
            .setFields(
                { name: "Reddeden Yetkili", value: `${intreaction.user}`, inline: true },
                { name: "Reddedilme Zamanı", value: `${moment().format('LLL')}`, inline: true }
            )

        client.channels.cache.get(duyuruk).send({ content: `<@${userdata}>`, embeds: [redembed] })
        db.delete(`basvuru_${intreaction.message.id}`)
    }
})


client.login(token)

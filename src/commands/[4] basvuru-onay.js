const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')
const db = require('croxydb')
module.exports = {
    data: new SlashCommandBuilder()
        .setName("onay-kanal")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setDescription("Başvuru onay kanalını ayarlar!")
        .addChannelOption(option => option.setName("name").setDescription("Onay kanalını etiketleyin!").setRequired(true)),
    run: async (client, intreaction) => {
        let sorgu = db.fetch(`onaykanal_${intreaction.guild.id}`)
        if (sorgu) {
            sorguerr = new EmbedBuilder()
                .setColor('Red')
                .setDescription('**Zaten ayarlı bir onay kanalınız var!**')
                .setFields({ text: "Ayarlı Kanal", value: `<#${sorgu}>`, inline: true }, { text: "Ayarları Sıfırlamak İçin", value: "/ayarları-sıfırla", inline: true })
                .setFooter({ text: 'Detaylı bilgi için "/yardım" yazabilirsiniz!' })
            intreaction.reply({ embeds: [sorguerr], ephemeral: true })
            return
        }
        const okanal = intreaction.options.getChannel("name")
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`Başvuru **onay** kanalı ${okanal} olarak ayarlandı!`)
        db.set(`onaykanal_${intreaction.guild.id}`, okanal.id)
        intreaction.reply({ embeds: [embed], ephemeral: true })
    }
}

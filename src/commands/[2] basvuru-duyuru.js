const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')
const db = require('croxydb')
module.exports = {
    data: new SlashCommandBuilder()
        .setName("duyuru-kanal")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setDescription("Başvuru duyuru kanalını ayarlar!")
        .addChannelOption(option => option.setName("name").setDescription("Duyuru kanalını etiketleyin!").setRequired(true)),
    run: async (client, intreaction) => {
        let sorgu = db.fetch(`duyurukanal_${intreaction.guild.id}`)
        if (sorgu) {
            sorguerr = new EmbedBuilder()
                .setColor('Red')
                .setDescription('**Zaten ayarlı bir duyuru kanalınız var!**')
                .setFields({ text: "Ayarlı Kanal", value: `<#${sorgu}>`, inline: true }, { text: "Ayarları Sıfırlamak İçin", value: "/ayarları-sıfırla", inline: true })
                .setFooter({ text: 'Detaylı bilgi için "/yardım" yazabilirsiniz!' })
            intreaction.reply({ embeds: [sorguerr], ephemeral: true })
            return
        }
        const dkanal = intreaction.options.getChannel("name")
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`Başvuru **duyuru** kanalı ${dkanal} olarak ayarlandı!`)
        db.set(`duyurukanal_${intreaction.guild.id}`, dkanal.id)
        intreaction.reply({ embeds: [embed], ephemeral: true })
    }
}

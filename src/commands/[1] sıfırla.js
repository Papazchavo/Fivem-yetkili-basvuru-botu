const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle , PermissionFlagsBits} = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')
const db = require('croxydb')
module.exports = {
    data: new SlashCommandBuilder()
        .setName("sıfırla")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setDescription("Ayarları Sıfırlar"),
        run: async (client, intreaction) => {
            const sorgu = db.fetch(`duyurukanal_${intreaction.guild.id}`)
            const sorgu2 = db.fetch(`onaykanal_${intreaction.guild.id}`)
            sorguerr = new EmbedBuilder()
                .setColor('Red')
                .setDescription('**Zaten ayarlı bir duyuru/onay kanalınız yok!**')
                .setFooter({ text: 'Detaylı bilgi için "/yardım" yazabilirsiniz!'})
            if (sorgu && sorgu2) return intreaction.reply({embeds: [sorguerr], ephemeral: true})
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`Başvuru **duyuru/onay** kanalları sıfırlandı!`)
            db.delete(`duyurukanal_${intreaction.guild.id}`)
            db.delete(`onaykanal_${intreaction.guild.id}`)
            intreaction.reply({embeds: [embed], ephemeral: true})
        }
}

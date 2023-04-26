const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')
const db = require('croxydb')
module.exports = {
    data: new SlashCommandBuilder()
        .setName("basvuru-kur")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setDescription("Başvuru Sistemini Kurar"),
        run: async (client, intreaction) => {
            let onayk = db.fetch(`onaykanal_${intreaction.guild.id}`)
            let duyuruk = db.fetch(`duyurukanal_${intreaction.guild.id}`)
            onaykerror = new EmbedBuilder()
                .setColor('Red')
                .setDescription('**Başvuru onay/red işlemleri için kanal seçilmemiş lütfen kanalı ayarlayınız!**')
                .setFooter({ text: 'Detaylı bilgi için "/yardım" yazabilirsiniz!'})
            if (!onayk) return intreaction.reply({embeds: [onaykerror], ephemeral: true})
            duyurukerror = new EmbedBuilder()
                .setColor('Red')
                .setDescription('**Başvuru duyuruları için kanal seçilmemiş lütfen kanalı ayarlayınız!**')
                .setFooter({ text: 'Detaylı bilgi için "/yardım" yazabilirsiniz!'})
            if (!duyuruk) return intreaction.reply({embeds: [duyurukerror], ephemeral: true})

            const menu = new EmbedBuilder()
                .setTitle(`${intreaction.guild.name} - Alım Başvuru`)
                .setDescription(`${intreaction.guild.name} yetkili ekibine katılmak için aşağıdaki <Başvur> butonuna tıklayarak başvurabilirsiniz.`)
                .setColor(0x0300BF)

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('basvuru')
                    .setLabel('Yetkili Başvur')
                    .setEmoji('✉️')
                    .setStyle(ButtonStyle.Secondary)
                )
            intreaction.channel.send({ embeds: [menu], components: [row] })
            intreaction.reply({ content: "Yetkili Başvuru sistemi kuruldu!", ephemeral: true})
        }
}

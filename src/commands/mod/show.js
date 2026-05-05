import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('show')
        .setDescription('Menampilkan kembali channel ke role @everyone'),
    
    async execute(interaction, client) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                ViewChannel: null
            });

            const embed = new EmbedBuilder()
                .setTitle('👁️ Channel Visible')
                .setDescription(`Channel ini sekarang dapat dilihat kembali oleh semua member.`)
                .setColor('#2ECC71');

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply({ content: `Gagal menampilkan channel: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

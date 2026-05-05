import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Mengunci channel saat ini'),
    
    async execute(interaction, client) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: false
            });

            const embed = new EmbedBuilder()
                .setTitle('🔒 Channel Locked')
                .setDescription(`Channel ini telah dikunci oleh ${interaction.user.tag}`)
                .setColor('#E74C3C');

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply({ content: `Gagal mengunci channel: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

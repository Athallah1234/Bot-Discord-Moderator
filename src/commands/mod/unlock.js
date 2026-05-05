import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Membuka kunci channel saat ini'),
    
    async execute(interaction, client) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: null
            });

            const embed = new EmbedBuilder()
                .setTitle('🔓 Channel Unlocked')
                .setDescription(`Channel ini telah dibuka kembali oleh ${interaction.user.tag}`)
                .setColor('#2ECC71');

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply({ content: `Gagal membuka channel: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

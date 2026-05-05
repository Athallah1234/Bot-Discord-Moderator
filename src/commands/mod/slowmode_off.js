import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('slowmode_off')
        .setDescription('Mematikan slowmode di channel ini secara instan'),
    
    async execute(interaction, client) {
        try {
            await interaction.channel.setRateLimitPerUser(0);
            
            const embed = new EmbedBuilder()
                .setTitle('⏳ Slowmode Disabled')
                .setDescription(`Slowmode di channel ini telah dimatikan.`)
                .setColor('#2ECC71');

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply({ content: `Gagal mematikan slowmode: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

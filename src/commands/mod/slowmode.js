import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Mengatur slowmode pada channel')
        .addIntegerOption(opt => opt.setName('seconds').setDescription('Detik (0 untuk mematikan)').setRequired(true).setMinValue(0).setMaxValue(21600)),
    
    async execute(interaction, client) {
        const seconds = interaction.options.getInteger('seconds');

        try {
            await interaction.channel.setRateLimitPerUser(seconds);
            
            const embed = new EmbedBuilder()
                .setTitle('⏳ Slowmode Updated')
                .setDescription(`Slowmode di channel ini diatur ke **${seconds}** detik.`)
                .setColor('#3498DB');

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply({ content: `Gagal mengubah slowmode: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import ms from 'ms';

export default {
    data: new SlashCommandBuilder()
        .setName('countdown')
        .setDescription('Membuat pesan hitung mundur dinamis')
        .addStringOption(opt => opt.setName('duration').setDescription('Durasi (misal: 10m, 1h, 30s)').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Tujuan hitung mundur').setRequired(true)),
    
    async execute(interaction, client) {
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason');
        const durationMs = ms(durationStr);

        if (!durationMs || durationMs < 5000) {
            return interaction.reply({ content: 'Durasi minimal 5 detik!', flags: [MessageFlags.Ephemeral] });
        }

        const endTime = Date.now() + durationMs;
        
        const embed = new EmbedBuilder()
            .setTitle('⏳ Countdown Active')
            .setDescription(`**${reason}**\n\nWaktu tersisa: <t:${Math.floor(endTime / 1000)}:R>`)
            .setColor('#E67E22')
            .setTimestamp();

        const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

        // Countdown update logic (Discord automatically handles <t:TIME:R> rendering, 
        // but we want to send a final message when done)
        setTimeout(async () => {
            const finalEmbed = new EmbedBuilder()
                .setTitle('🔔 Time is Up!')
                .setDescription(`**${reason}**\n\nWaktu telah habis!`)
                .setColor('#FF0000')
                .setTimestamp();
            
            await interaction.editReply({ embeds: [finalEmbed] });
            await interaction.followUp({ content: `🔔 ${interaction.user}, waktu untuk **${reason}** telah habis!` });
        }, durationMs);
    }
};

import { SlashCommandBuilder, EmbedBuilder, AuditLogEvent, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('audit')
        .setDescription('Menampilkan 5 log audit terbaru'),
    
    async execute(interaction, client) {
        try {
            const auditLogs = await interaction.guild.fetchAuditLogs({ limit: 5 });
            
            const embed = new EmbedBuilder()
                .setTitle('📋 Recent Audit Logs')
                .setColor('#34495E')
                .setTimestamp();

            const entries = auditLogs.entries.map(entry => {
                const executor = entry.executor ? `<@${entry.executor.id}>` : 'Unknown';
                const target = entry.target ? `${entry.target}` : 'Unknown';
                return `**Action:** \`${entry.actionType}\` | **By:** ${executor}\n**Target:** ${target}\n**Time:** <t:${Math.floor(entry.createdTimestamp / 1000)}:R>`;
            });

            embed.setDescription(entries.join('\n\n') || 'Tidak ada log audit yang ditemukan.');

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply({ content: `Gagal mengambil log audit: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

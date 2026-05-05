import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('eco-leaderboard')
        .setDescription('Melihat daftar member terkaya di server'),
    
    async execute(interaction, client) {
        const guildId = interaction.guildId;
        const top = client.db.db.prepare('SELECT user_id, (balance + bank) as total FROM users WHERE guild_id = ? ORDER BY total DESC LIMIT 10').all(guildId);

        if (top.length === 0) return interaction.reply({ content: 'Belum ada data ekonomi di server ini.' });

        const embed = new EmbedBuilder()
            .setTitle('🏆 Economy Leaderboard')
            .setColor('#F1C40F')
            .setThumbnail(interaction.guild.iconURL())
            .setDescription(top.map((u, i) => `**#${i + 1}** | <@${u.user_id}> - \`$${u.total.toLocaleString()}\``).join('\n'))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Melihat level dan XP Anda saat ini')
        .addUserOption(opt => opt.setName('user').setDescription('User yang ingin dilihat ranknya')),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user') || interaction.user;
        const guildId = interaction.guildId;

        const data = client.db.db.prepare('SELECT * FROM users WHERE guild_id = ? AND user_id = ?').get(guildId, user.id);

        if (!data) {
            return interaction.reply({ content: `${user.tag} belum memiliki riwayat aktivitas (XP).`, flags: [MessageFlags.Ephemeral] });
        }

        const nextLevelXp = (data.level + 1) * 500;
        const progress = (data.xp / nextLevelXp) * 100;
        
        // Menghitung posisi di leaderboard
        const allUsers = client.db.db.prepare('SELECT user_id FROM users WHERE guild_id = ? ORDER BY xp DESC').all(guildId);
        const rank = allUsers.findIndex(u => u.user_id === user.id) + 1;

        const embed = new EmbedBuilder()
            .setTitle(`Rank Card: ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .setColor('#2ECC71')
            .addFields(
                { name: 'Level', value: `\`${data.level}\``, inline: true },
                { name: 'XP', value: `\`${data.xp} / ${nextLevelXp}\``, inline: true },
                { name: 'Server Rank', value: `\`#${rank}\``, inline: true },
                { name: 'Progress', value: this.createProgressBar(progress) }
            )
            .setFooter({ text: 'Teruslah mengobrol untuk meningkatkan level!' });

        await interaction.reply({ embeds: [embed] });
    },

    createProgressBar(percentage) {
        const size = 10;
        const progress = Math.round(size * (percentage / 100));
        const emptyProgress = size - progress;

        const progressText = '🟩'.repeat(progress);
        const emptyProgressText = '⬜'.repeat(emptyProgress);

        return `${progressText}${emptyProgressText} **${Math.round(percentage)}%**`;
    }
};

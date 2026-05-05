import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Melihat profil sosial dan statistik member')
        .addUserOption(opt => opt.setName('user').setDescription('User yang ingin dilihat profilnya')),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user') || interaction.user;
        const guildId = interaction.guildId;

        const data = client.db.db.prepare('SELECT * FROM users WHERE guild_id = ? AND user_id = ?').get(guildId, user.id);

        if (!data) {
            return interaction.reply({ content: 'User ini belum memiliki data aktivitas di server.', flags: [MessageFlags.Ephemeral] });
        }

        const totalMoney = (data.balance || 0) + (data.bank || 0);
        
        // Fetch Badges
        const badges = client.db.db.prepare('SELECT badge_emoji FROM user_badges WHERE guild_id = ? AND user_id = ?').all(guildId, user.id);
        const badgeDisplay = badges.length > 0 ? badges.map(b => b.badge_emoji).join(' ') : '`No badges`';

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Personal Profile`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setColor('#5865F2')
            .setDescription(data.bio || 'No bio set.')
            .addFields(
                { name: '🎖️ Badges', value: badgeDisplay },
                { name: '📊 Statistics', value: `**Level:** ${data.level}\n**XP:** ${data.xp.toLocaleString()}\n**Money:** $${totalMoney.toLocaleString()}`, inline: true },
                { name: '🔗 Social Links', value: `GitHub: ${data.github ? `[Link](${data.github})` : '`None`'}\nTwitter: ${data.twitter ? `[Link](${data.twitter})` : '`None`'}\nYouTube: ${data.youtube ? `[Link](${data.youtube})` : '`None`'}`, inline: true }
            )
            .setFooter({ text: `Joined Server: ${interaction.guild.members.cache.get(user.id).joinedAt.toLocaleDateString()}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

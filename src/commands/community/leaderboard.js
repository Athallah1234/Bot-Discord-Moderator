import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Melihat papan peringkat server')
        .addStringOption(opt => opt
            .setName('type')
            .setDescription('Jenis papan peringkat')
            .setRequired(true)
            .addChoices(
                { name: 'Leveling (XP)', value: 'xp' },
                { name: 'Economy (Money)', value: 'money' }
            )),
    
    async execute(interaction, client) {
        const type = interaction.options.getString('type');
        const guildId = interaction.guildId;

        let top;
        let title;
        let color;

        if (type === 'xp') {
            top = client.db.db.prepare('SELECT user_id, xp, level FROM users WHERE guild_id = ? ORDER BY xp DESC LIMIT 10').all(guildId);
            title = '🏆 Leveling Leaderboard (Top 10)';
            color = '#5865F2';
        } else {
            top = client.db.db.prepare('SELECT user_id, (balance + bank) as total FROM users WHERE guild_id = ? ORDER BY total DESC LIMIT 10').all(guildId);
            title = '💰 Economy Leaderboard (Top 10)';
            color = '#F1C40F';
        }

        if (top.length === 0) return interaction.reply({ content: 'Belum ada data untuk papan peringkat ini.' });

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(color)
            .setThumbnail(interaction.guild.iconURL())
            .setDescription(top.map((u, i) => {
                const value = type === 'xp' ? `Lvl ${u.level} (${u.xp.toLocaleString()} XP)` : `$${u.total.toLocaleString()}`;
                return `**#${i + 1}** | <@${u.user_id}> - \`${value}\``;
            }).join('\n'))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

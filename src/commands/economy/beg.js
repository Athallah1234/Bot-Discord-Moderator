import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('beg')
        .setDescription('Mengemis untuk mendapatkan sedikit uang'),
    
    async execute(interaction, client) {
        const guildId = interaction.guildId;
        const userId = interaction.user.id;
        const reward = Math.floor(Math.random() * 100) + 10;

        const data = client.db.db.prepare('SELECT last_beg FROM users WHERE guild_id = ? AND user_id = ?').get(guildId, userId);

        if (data && data.last_beg) {
            const lastBeg = new Date(data.last_beg).getTime();
            const now = Date.now();
            if (now - lastBeg < 60000) { // 1 Minute
                return interaction.reply({ content: `⏳ Orang-orang sudah kasihan pada Anda. Tunggu sebentar lagi!`, flags: [MessageFlags.Ephemeral] });
            }
        }

        client.db.db.prepare(`
            INSERT INTO users (guild_id, user_id, balance, last_beg) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(guild_id, user_id) DO UPDATE SET 
            balance = balance + ?, 
            last_beg = CURRENT_TIMESTAMP
        `).run(guildId, userId, reward, reward);

        await interaction.reply({ content: `🥺 Anda mengemis dan seseorang memberikan Anda **$${reward.toLocaleString()}**.` });
    }
};

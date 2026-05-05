import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Mengambil hadiah uang harian'),
    
    async execute(interaction, client) {
        const guildId = interaction.guildId;
        const userId = interaction.user.id;
        const reward = 1000;

        const data = client.db.db.prepare('SELECT last_daily FROM users WHERE guild_id = ? AND user_id = ?').get(guildId, userId);

        if (data && data.last_daily) {
            const lastDaily = new Date(data.last_daily).getTime();
            const now = Date.now();
            const diff = now - lastDaily;
            const cooldown = 24 * 60 * 60 * 1000;

            if (diff < cooldown) {
                const timeLeft = cooldown - diff;
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                return interaction.reply({ content: `⏳ Anda sudah mengambil hadiah harian. Coba lagi dalam **${hours} jam ${minutes} menit**.`, flags: [MessageFlags.Ephemeral] });
            }
        }

        client.db.db.prepare(`
            INSERT INTO users (guild_id, user_id, balance, last_daily) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(guild_id, user_id) DO UPDATE SET 
            balance = balance + ?, 
            last_daily = CURRENT_TIMESTAMP
        `).run(guildId, userId, reward, reward);

        await interaction.reply({ content: `🎁 Selamat! Anda telah mengambil hadiah harian sebesar **$${reward.toLocaleString()}**.` });
    }
};

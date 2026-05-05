import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Bekerja untuk mendapatkan uang'),
    
    async execute(interaction, client) {
        const guildId = interaction.guildId;
        const userId = interaction.user.id;
        const reward = Math.floor(Math.random() * 500) + 200;
        const jobs = ['Programmer', 'Koki', 'Supir', 'Dokter', 'Desainer', 'YouTuber', 'Gamer'];
        const job = jobs[Math.floor(Math.random() * jobs.length)];

        const data = client.db.db.prepare('SELECT last_work FROM users WHERE guild_id = ? AND user_id = ?').get(guildId, userId);

        if (data && data.last_work) {
            const lastWork = new Date(data.last_work).getTime();
            const now = Date.now();
            if (now - lastWork < 3600000) { // 1 Hour
                const timeLeft = 3600000 - (now - lastWork);
                const minutes = Math.floor(timeLeft / 60000);
                return interaction.reply({ content: `⏳ Anda lelah. Silakan istirahat dan coba lagi dalam **${minutes} menit**.`, flags: [MessageFlags.Ephemeral] });
            }
        }

        client.db.db.prepare(`
            INSERT INTO users (guild_id, user_id, balance, last_work) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(guild_id, user_id) DO UPDATE SET 
            balance = balance + ?, 
            last_work = CURRENT_TIMESTAMP
        `).run(guildId, userId, reward, reward);

        await interaction.reply({ content: `💼 Anda bekerja sebagai **${job}** dan mendapatkan gaji sebesar **$${reward.toLocaleString()}**.` });
    }
};

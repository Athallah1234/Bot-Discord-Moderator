import { EmbedBuilder } from 'discord.js';

class ReminderManager {
    constructor(client) {
        this.client = client;
    }

    init() {
        // Cek setiap 30 detik untuk pengingat yang jatuh tempo
        setInterval(() => this.checkReminders(), 30000);
    }

    async checkReminders() {
        const now = new Date().toISOString();
        const pending = this.client.db.db.prepare('SELECT * FROM reminders WHERE remind_at <= ?').all(now);

        for (const r of pending) {
            const channel = await this.client.channels.fetch(r.channel_id).catch(() => null);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle('⏰ PENGINGAT!')
                    .setDescription(`Halo <@${r.user_id}>, ini adalah pengingat Anda:\n\n**"${r.message}"**`)
                    .setColor('#F1C40F')
                    .setTimestamp();

                await channel.send({ content: `<@${r.user_id}>`, embeds: [embed] }).catch(() => {});
            }
            this.client.db.db.prepare('DELETE FROM reminders WHERE id = ?').run(r.id);
        }
    }
}

export default ReminderManager;

import { EmbedBuilder } from 'discord.js';

class AnnouncerManager {
    constructor(client) {
        this.client = client;
    }

    init() {
        // Cek setiap 1 menit untuk pengumuman yang harus dikirim
        setInterval(() => this.checkAnnouncements(), 60000);
    }

    async checkAnnouncements() {
        const now = new Date();
        const active = this.client.db.db.prepare('SELECT * FROM announcements').all();

        for (const ann of active) {
            const lastSent = ann.last_sent ? new Date(ann.last_sent) : new Date(0);
            const diff = now.getTime() - lastSent.getTime();

            if (diff >= ann.interval_ms) {
                const channel = await this.client.channels.fetch(ann.channel_id).catch(() => null);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setTitle('📢 Server Announcement')
                        .setDescription(ann.message)
                        .setColor('#5865F2')
                        .setTimestamp();

                    await channel.send({ embeds: [embed] }).catch(() => {});
                    
                    this.client.db.db.prepare('UPDATE announcements SET last_sent = CURRENT_TIMESTAMP WHERE id = ?').run(ann.id);
                }
            }
        }
    }
}

export default AnnouncerManager;

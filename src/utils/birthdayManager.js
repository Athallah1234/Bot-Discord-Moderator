import { EmbedBuilder } from 'discord.js';

class BirthdayManager {
    constructor(client) {
        this.client = client;
    }

    init() {
        // Cek setiap 12 jam agar tidak meleset
        setInterval(() => this.checkBirthdays(), 12 * 60 * 60 * 1000);
        // Jalankan sekali saat startup
        this.checkBirthdays();
    }

    async checkBirthdays() {
        const now = new Date();
        const day = now.getDate();
        const month = now.getMonth() + 1;

        const birthdays = this.client.db.db.prepare('SELECT * FROM birthdays WHERE day = ? AND month = ?').all(day, month);

        for (const bday of birthdays) {
            const settings = this.client.db.getSettings(bday.guild_id);
            if (!settings || !settings.birthday_channel) continue;

            // Hindari double greeting di hari yang sama jika bot restart
            // Kita bisa tambahkan kolom last_greeted di tabel birthdays jika perlu, 
            // tapi untuk sekarang kita asumsikan channelnya cukup.
            
            const guild = await this.client.guilds.fetch(bday.guild_id).catch(() => null);
            if (!guild) continue;

            const channel = await guild.channels.fetch(settings.birthday_channel).catch(() => null);
            if (!channel) continue;

            const embed = new EmbedBuilder()
                .setTitle('🎂 Happy Birthday!')
                .setDescription(`Selamat ulang tahun untuk <@${bday.user_id}>! 🥳🎉\nSemoga hari Anda menyenangkan dan penuh kebahagiaan!`)
                .setColor('#FF69B4')
                .setThumbnail('https://i.imgur.com/wH7z68u.png')
                .setTimestamp();

            await channel.send({ content: `<@${bday.user_id}>`, embeds: [embed] }).catch(() => {});
        }
    }
}

export default BirthdayManager;

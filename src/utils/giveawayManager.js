import { EmbedBuilder } from 'discord.js';

class GiveawayManager {
    constructor(client) {
        this.client = client;
    }

    init() {
        // Cek setiap 15 detik untuk giveaway yang berakhir
        setInterval(() => this.checkGiveaways(), 15000);
    }

    async checkGiveaways() {
        const now = new Date().toISOString();
        const endedGiveaways = this.client.db.db.prepare("SELECT * FROM giveaways WHERE status = 'OPEN' AND ends_at <= ?").all(now);

        for (const gw of endedGiveaways) {
            await this.endGiveaway(gw);
        }
    }

    async endGiveaway(gw) {
        const channel = await this.client.channels.fetch(gw.channel_id).catch(() => null);
        if (!channel) return this.markAsEnded(gw.message_id);

        const message = await channel.messages.fetch(gw.message_id).catch(() => null);
        if (!message) return this.markAsEnded(gw.message_id);

        const entries = this.client.db.db.prepare('SELECT user_id FROM giveaway_entries WHERE message_id = ?').all(gw.message_id);
        
        if (entries.length === 0) {
            const noWinnersEmbed = new EmbedBuilder()
                .setTitle('🎁 Giveaway Ended')
                .setDescription(`Prize: **${gw.prize}**\n\nNo participants, so no winners could be chosen.`)
                .setColor('#7F8C8D')
                .setTimestamp();

            await message.edit({ embeds: [noWinnersEmbed], components: [] });
            return this.markAsEnded(gw.message_id);
        }

        // Pilih pemenang
        const winners = [];
        const shuffled = entries.sort(() => 0.5 - Math.random());
        for (let i = 0; i < Math.min(gw.winner_count, shuffled.length); i++) {
            winners.push(`<@${shuffled[i].user_id}>`);
        }

        const winEmbed = new EmbedBuilder()
            .setTitle('🎁 Giveaway Ended')
            .setDescription(`Prize: **${gw.prize}**\nWinners: ${winners.join(', ')}`)
            .setColor('#2ECC71')
            .setTimestamp();

        await message.edit({ embeds: [winEmbed], components: [] });
        await channel.send(`🎊 Congratulations ${winners.join(', ')}! You won **${gw.prize}**!`);
        
        this.markAsEnded(gw.message_id);
    }

    markAsEnded(messageId) {
        this.client.db.db.prepare("UPDATE giveaways SET status = 'ENDED' WHERE message_id = ?").run(messageId);
    }

    async reroll(messageId, interaction) {
        const gw = this.client.db.db.prepare('SELECT * FROM giveaways WHERE message_id = ?').get(messageId);
        if (!gw) return interaction.reply({ content: 'Giveaway not found.', ephemeral: true });

        const entries = this.client.db.db.prepare('SELECT user_id FROM giveaway_entries WHERE message_id = ?').all(messageId);
        if (entries.length === 0) return interaction.reply({ content: 'No participants to reroll.', ephemeral: true });

        const winner = entries[Math.floor(Math.random() * entries.length)];
        await interaction.reply(`🎊 **Reroll:** The new winner is <@${winner.user_id}>! Congratulations!`);
    }
}

export default GiveawayManager;

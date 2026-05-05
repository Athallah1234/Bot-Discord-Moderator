import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Mencoba merampok dompet member lain')
        .addUserOption(opt => opt.setName('user').setDescription('Target perampokan').setRequired(true)),
    
    async execute(interaction, client) {
        const target = interaction.options.getUser('user');
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        if (target.id === userId) return interaction.reply({ content: 'Anda tidak bisa merampok diri sendiri.', flags: [MessageFlags.Ephemeral] });
        if (target.bot) return interaction.reply({ content: 'Anda tidak bisa merampok Bot.', flags: [MessageFlags.Ephemeral] });

        const targetData = client.db.db.prepare('SELECT balance FROM users WHERE guild_id = ? AND user_id = ?').get(guildId, target.id);
        const senderData = client.db.db.prepare('SELECT balance FROM users WHERE guild_id = ? AND user_id = ?').get(guildId, userId);

        if (!targetData || targetData.balance < 500) {
            return interaction.reply({ content: 'Target terlalu miskin (minimal $500 di dompet) untuk dirampok.', flags: [MessageFlags.Ephemeral] });
        }

        if (!senderData || senderData.balance < 200) {
            return interaction.reply({ content: 'Anda butuh minimal $200 di dompet sebagai modal perampokan (untuk jaga-jaga denda).', flags: [MessageFlags.Ephemeral] });
        }

        const success = Math.random() > 0.6; // 40% chance of success

        if (success) {
            const stolen = Math.floor(Math.random() * (targetData.balance * 0.4)) + 100; // Steal up to 40%
            client.db.db.prepare('UPDATE users SET balance = balance - ? WHERE guild_id = ? AND user_id = ?').run(stolen, guildId, target.id);
            client.db.db.prepare('UPDATE users SET balance = balance + ? WHERE guild_id = ? AND user_id = ?').run(stolen, guildId, userId);
            return interaction.reply({ content: `🕶️ **BERHASIL!** Anda merampok ${target} dan membawa lari **$${stolen.toLocaleString()}**!` });
        } else {
            const fine = 200;
            client.db.db.prepare('UPDATE users SET balance = balance - ? WHERE guild_id = ? AND user_id = ?').run(fine, guildId, userId);
            return interaction.reply({ content: `👮 **TERTANGKAP!** Anda gagal merampok ${target} dan didenda **$${fine.toLocaleString()}** oleh polisi.` });
        }
    }
};

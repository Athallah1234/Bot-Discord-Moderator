import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Mentransfer uang ke member lain')
        .addUserOption(opt => opt.setName('user').setDescription('Target transfer').setRequired(true))
        .addIntegerOption(opt => opt.setName('amount').setDescription('Jumlah uang').setRequired(true).setMinValue(1)),
    
    async execute(interaction, client) {
        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        if (target.bot) return interaction.reply({ content: 'Anda tidak bisa mentransfer uang ke Bot.', flags: [MessageFlags.Ephemeral] });
        if (target.id === userId) return interaction.reply({ content: 'Anda tidak bisa mentransfer uang ke diri sendiri.', flags: [MessageFlags.Ephemeral] });

        const senderData = client.db.db.prepare('SELECT balance FROM users WHERE guild_id = ? AND user_id = ?').get(guildId, userId);

        if (!senderData || senderData.balance < amount) {
            return interaction.reply({ content: 'Saldo dompet Anda tidak cukup.', flags: [MessageFlags.Ephemeral] });
        }

        // Transaction
        client.db.db.prepare('UPDATE users SET balance = balance - ? WHERE guild_id = ? AND user_id = ?').run(amount, guildId, userId);
        
        client.db.db.prepare(`
            INSERT INTO users (guild_id, user_id, balance) 
            VALUES (?, ?, ?)
            ON CONFLICT(guild_id, user_id) DO UPDATE SET 
            balance = balance + ?
        `).run(guildId, target.id, amount, amount);

        await interaction.reply({ content: `💸 Anda berhasil mentransfer **$${amount.toLocaleString()}** ke ${target}.` });
    }
};

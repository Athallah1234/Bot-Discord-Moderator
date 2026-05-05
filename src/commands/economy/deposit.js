import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription('Memasukkan uang ke Bank agar aman dari perampokan')
        .addIntegerOption(opt => opt.setName('amount').setDescription('Jumlah uang (gunakan -1 untuk semua)').setRequired(true)),
    
    async execute(interaction, client) {
        let amount = interaction.options.getInteger('amount');
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        const data = client.db.db.prepare('SELECT balance FROM users WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
        if (!data || data.balance <= 0) return interaction.reply({ content: 'Anda tidak memiliki uang di dompet.', flags: [MessageFlags.Ephemeral] });

        if (amount === -1 || amount > data.balance) amount = data.balance;
        if (amount <= 0) return interaction.reply({ content: 'Jumlah tidak valid.', flags: [MessageFlags.Ephemeral] });

        client.db.db.prepare('UPDATE users SET balance = balance - ?, bank = bank + ? WHERE guild_id = ? AND user_id = ?').run(amount, amount, guildId, userId);

        await interaction.reply({ content: `🏦 Anda telah menyimpan **$${amount.toLocaleString()}** ke dalam Bank.` });
    }
};

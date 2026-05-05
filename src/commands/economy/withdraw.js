import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('Mengambil uang dari Bank ke dompet')
        .addIntegerOption(opt => opt.setName('amount').setDescription('Jumlah uang (gunakan -1 untuk semua)').setRequired(true)),
    
    async execute(interaction, client) {
        let amount = interaction.options.getInteger('amount');
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        const data = client.db.db.prepare('SELECT bank FROM users WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
        if (!data || data.bank <= 0) return interaction.reply({ content: 'Anda tidak memiliki uang di Bank.', flags: [MessageFlags.Ephemeral] });

        if (amount === -1 || amount > data.bank) amount = data.bank;
        if (amount <= 0) return interaction.reply({ content: 'Jumlah tidak valid.', flags: [MessageFlags.Ephemeral] });

        client.db.db.prepare('UPDATE users SET bank = bank - ?, balance = balance + ? WHERE guild_id = ? AND user_id = ?').run(amount, amount, guildId, userId);

        await interaction.reply({ content: `💸 Anda telah mengambil **$${amount.toLocaleString()}** dari Bank ke dompet.` });
    }
};

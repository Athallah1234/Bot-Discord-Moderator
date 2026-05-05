import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('eco-admin')
        .setDescription('Mengelola ekonomi member (Admin Only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('add')
            .setDescription('Tambah uang ke member')
            .addUserOption(opt => opt.setName('user').setDescription('Target').setRequired(true))
            .addIntegerOption(opt => opt.setName('amount').setDescription('Jumlah').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('remove')
            .setDescription('Hapus uang dari member')
            .addUserOption(opt => opt.setName('user').setDescription('Target').setRequired(true))
            .addIntegerOption(opt => opt.setName('amount').setDescription('Jumlah').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('set')
            .setDescription('Set saldo dompet member')
            .addUserOption(opt => opt.setName('user').setDescription('Target').setRequired(true))
            .addIntegerOption(opt => opt.setName('amount').setDescription('Jumlah').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('reset')
            .setDescription('Reset semua uang member (Dompet & Bank)')
            .addUserOption(opt => opt.setName('user').setDescription('Target').setRequired(true))),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const guildId = interaction.guildId;

        if (subcommand === 'add') {
            client.db.db.prepare(`
                INSERT INTO users (guild_id, user_id, balance) 
                VALUES (?, ?, ?)
                ON CONFLICT(guild_id, user_id) DO UPDATE SET balance = balance + ?
            `).run(guildId, target.id, amount, amount);
            return interaction.reply({ content: `✅ Berhasil menambah **$${amount.toLocaleString()}** ke dompet ${target}.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'remove') {
            client.db.db.prepare('UPDATE users SET balance = MAX(0, balance - ?) WHERE guild_id = ? AND user_id = ?').run(amount, guildId, target.id);
            return interaction.reply({ content: `✅ Berhasil menghapus **$${amount.toLocaleString()}** dari dompet ${target}.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'set') {
            client.db.db.prepare(`
                INSERT INTO users (guild_id, user_id, balance) 
                VALUES (?, ?, ?)
                ON CONFLICT(guild_id, user_id) DO UPDATE SET balance = ?
            `).run(guildId, target.id, amount, amount);
            return interaction.reply({ content: `✅ Saldo dompet ${target} telah di-set ke **$${amount.toLocaleString()}**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'reset') {
            client.db.db.prepare('UPDATE users SET balance = 0, bank = 0 WHERE guild_id = ? AND user_id = ?').run(guildId, target.id);
            return interaction.reply({ content: `✅ Seluruh kekayaan ${target} telah di-reset ke 0.`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

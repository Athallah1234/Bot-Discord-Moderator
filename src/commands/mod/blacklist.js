import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Memblokir user agar tidak bisa menggunakan bot ini')
        .addStringOption(opt => opt.setName('action').setDescription('Tambah atau Hapus').addChoices(
            { name: 'Add', value: 'add' },
            { name: 'Remove', value: 'remove' }
        ).setRequired(true))
        .addUserOption(opt => opt.setName('user').setDescription('User yang ingin di-blacklist').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Alasan blacklist')),
    
    async execute(interaction, client) {
        const action = interaction.options.getString('action');
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason';

        if (action === 'add') {
            try {
                client.db.db.prepare('INSERT INTO blacklist (user_id, reason) VALUES (?, ?)').run(user.id, reason);
                const embed = new EmbedBuilder()
                    .setTitle('🚫 User Blacklisted')
                    .setColor('#FF0000')
                    .setDescription(`${user.tag} telah dimasukkan ke daftar hitam bot.`)
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
            } catch {
                interaction.reply({ content: 'User sudah ada di daftar hitam.', flags: [MessageFlags.Ephemeral] });
            }
        } else {
            client.db.db.prepare('DELETE FROM blacklist WHERE user_id = ?').run(user.id);
            const embed = new EmbedBuilder()
                .setTitle('✅ User Whitelisted')
                .setColor('#2ECC71')
                .setDescription(`${user.tag} telah dihapus dari daftar hitam bot.`)
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
    }
};

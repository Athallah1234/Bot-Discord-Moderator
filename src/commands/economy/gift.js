import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('gift')
        .setDescription('Membeli barang untuk diberikan ke orang lain sebagai hadiah')
        .addIntegerOption(opt => opt.setName('id').setDescription('ID Item toko').setRequired(true))
        .addUserOption(opt => opt.setName('user').setDescription('Penerima hadiah').setRequired(true)),
    
    async execute(interaction, client) {
        const itemId = interaction.options.getInteger('id');
        const target = interaction.options.getUser('user');
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        if (target.id === userId) return interaction.reply({ content: 'Gunakan /buy jika ingin membeli untuk diri sendiri.', flags: [MessageFlags.Ephemeral] });
        if (target.bot) return interaction.reply({ content: 'Bot tidak butuh hadiah.', flags: [MessageFlags.Ephemeral] });

        const item = client.db.db.prepare('SELECT * FROM shop_items WHERE id = ? AND guild_id = ?').get(itemId, guildId);
        if (!item) return interaction.reply({ content: 'Barang tidak ditemukan.', flags: [MessageFlags.Ephemeral] });

        const userData = client.db.db.prepare('SELECT balance FROM users WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
        if (!userData || userData.balance < item.price) {
            return interaction.reply({ content: 'Saldo dompet Anda tidak cukup.', flags: [MessageFlags.Ephemeral] });
        }

        // Check if target already owns
        const owned = client.db.db.prepare('SELECT * FROM inventory WHERE guild_id = ? AND user_id = ? AND item_id = ?').get(guildId, target.id, itemId);
        if (owned) return interaction.reply({ content: 'Target sudah memiliki barang ini.', flags: [MessageFlags.Ephemeral] });

        // Process Gift
        client.db.db.prepare('UPDATE users SET balance = balance - ? WHERE guild_id = ? AND user_id = ?').run(item.price, guildId, userId);
        client.db.db.prepare('INSERT INTO inventory (guild_id, user_id, item_id) VALUES (?, ?, ?)').run(guildId, target.id, itemId);

        // Give Role to target
        const targetMember = await interaction.guild.members.fetch(target.id);
        const role = interaction.guild.roles.cache.get(item.role_id);
        if (role) {
            await targetMember.roles.add(role).catch(() => {});
        }

        await interaction.reply({ content: `🎁 **MURAH HATI!** Anda telah membelikan **${item.name}** seharga **$${item.price.toLocaleString()}** untuk ${target}!` });
    }
};

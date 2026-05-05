import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Membeli barang dari toko')
        .addIntegerOption(opt => opt.setName('id').setDescription('ID Item yang ingin dibeli').setRequired(true)),
    
    async execute(interaction, client) {
        const itemId = interaction.options.getInteger('id');
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        const item = client.db.db.prepare('SELECT * FROM shop_items WHERE id = ? AND guild_id = ?').get(itemId, guildId);
        if (!item) return interaction.reply({ content: 'Barang tidak ditemukan.', flags: [MessageFlags.Ephemeral] });

        const userData = client.db.db.prepare('SELECT balance FROM users WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
        if (!userData || userData.balance < item.price) {
            return interaction.reply({ content: `Saldo Anda tidak cukup! Harga barang ini adalah **$${item.price.toLocaleString()}**.`, flags: [MessageFlags.Ephemeral] });
        }

        // Check if already owns
        const owned = client.db.db.prepare('SELECT * FROM inventory WHERE guild_id = ? AND user_id = ? AND item_id = ?').get(guildId, userId, itemId);
        if (owned) return interaction.reply({ content: 'Anda sudah memiliki barang ini.', flags: [MessageFlags.Ephemeral] });

        // Process Purchase
        client.db.db.prepare('UPDATE users SET balance = balance - ? WHERE guild_id = ? AND user_id = ?').run(item.price, guildId, userId);
        client.db.db.prepare('INSERT INTO inventory (guild_id, user_id, item_id) VALUES (?, ?, ?)').run(guildId, userId, itemId);

        // Give Role
        const role = interaction.guild.roles.cache.get(item.role_id);
        if (role) {
            await interaction.member.roles.add(role).catch(err => {
                client.logger.error(`Error giving shop role: ${err.message}`);
            });
        }

        await interaction.reply({ content: `🎊 Selamat! Anda berhasil membeli **${item.name}** seharga **$${item.price.toLocaleString()}**.` });
    }
};

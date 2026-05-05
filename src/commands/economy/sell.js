import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Menjual kembali barang yang sudah dimiliki (Refund 50%)')
        .addIntegerOption(opt => opt.setName('id').setDescription('ID Item yang ingin dijual').setRequired(true)),
    
    async execute(interaction, client) {
        const itemId = interaction.options.getInteger('id');
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        // Check ownership
        const owned = client.db.db.prepare(`
            SELECT inventory.*, shop_items.name, shop_items.price, shop_items.role_id 
            FROM inventory 
            JOIN shop_items ON inventory.item_id = shop_items.id 
            WHERE inventory.guild_id = ? AND inventory.user_id = ? AND inventory.item_id = ?
        `).get(guildId, userId, itemId);

        if (!owned) return interaction.reply({ content: 'Anda tidak memiliki barang ini.', flags: [MessageFlags.Ephemeral] });

        const refund = Math.floor(owned.price * 0.5);

        // Process Sale
        client.db.db.prepare('DELETE FROM inventory WHERE guild_id = ? AND user_id = ? AND item_id = ?').run(guildId, userId, itemId);
        client.db.db.prepare('UPDATE users SET balance = balance + ? WHERE guild_id = ? AND user_id = ?').run(refund, guildId, userId);

        // Remove Role
        const role = interaction.guild.roles.cache.get(owned.role_id);
        if (role) {
            await interaction.member.roles.remove(role).catch(() => {});
        }

        await interaction.reply({ content: `💰 Anda berhasil menjual **${owned.name}** kembali ke toko dan mendapatkan **$${refund.toLocaleString()}** (Refund 50%).` });
    }
};

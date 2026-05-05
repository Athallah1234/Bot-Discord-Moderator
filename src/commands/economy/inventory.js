import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Melihat barang yang Anda miliki'),
    
    async execute(interaction, client) {
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        const items = client.db.db.prepare(`
            SELECT shop_items.name, shop_items.role_id 
            FROM inventory 
            JOIN shop_items ON inventory.item_id = shop_items.id 
            WHERE inventory.guild_id = ? AND inventory.user_id = ?
        `).all(guildId, userId);

        if (items.length === 0) return interaction.reply({ content: 'Tas Anda kosong. Belanjalah di /shop!', flags: [MessageFlags.Ephemeral] });

        const embed = new EmbedBuilder()
            .setTitle(`🎒 Inventory: ${interaction.user.username}`)
            .setColor('#3498DB')
            .setDescription(items.map((item, i) => `**${i + 1}.** ${item.name} (<@&${item.role_id}>)`).join('\n'))
            .setTimestamp();
        
        return interaction.reply({ embeds: [embed] });
    }
};

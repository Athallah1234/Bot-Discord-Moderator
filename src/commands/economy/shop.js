import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Mengelola toko server')
        .addSubcommand(sub => sub
            .setName('list')
            .setDescription('Lihat semua barang di toko'))
        .addSubcommand(sub => sub
            .setName('add')
            .setDescription('Tambah item ke toko (Admin Only)')
            .addStringOption(opt => opt.setName('name').setDescription('Nama item').setRequired(true))
            .addIntegerOption(opt => opt.setName('price').setDescription('Harga item').setRequired(true))
            .addRoleOption(opt => opt.setName('role').setDescription('Role yang akan diberikan').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('edit')
            .setDescription('Ubah harga/nama item di toko (Admin Only)')
            .addIntegerOption(opt => opt.setName('id').setDescription('ID Item').setRequired(true))
            .addStringOption(opt => opt.setName('name').setDescription('Nama baru').setRequired(false))
            .addIntegerOption(opt => opt.setName('price').setDescription('Harga baru').setRequired(false)))
        .addSubcommand(sub => sub
            .setName('remove')
            .setDescription('Hapus item dari toko (Admin Only)')
            .addIntegerOption(opt => opt.setName('id').setDescription('ID Item').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('clear')
            .setDescription('Hapus semua barang di toko (Admin Only)')),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        if (subcommand === 'list') {
            const items = client.db.db.prepare('SELECT * FROM shop_items WHERE guild_id = ?').all(guildId);
            if (items.length === 0) return interaction.reply({ content: 'Toko saat ini kosong.', flags: [MessageFlags.Ephemeral] });

            const embed = new EmbedBuilder()
                .setTitle(`🏪 ${interaction.guild.name} Shop`)
                .setColor('#F1C40F')
                .setDescription(items.map(item => `**ID: \`${item.id}\`** | **${item.name}**\n💰 Harga: \`$${item.price.toLocaleString()}\` | Role: <@&${item.role_id}>`).join('\n\n'))
                .setFooter({ text: 'Gunakan /buy <id> atau /gift <id> <user>!' })
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed] });
        }

        // Admin Permissions Check
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: 'Hanya Administrator yang bisa menggunakan perintah ini.', flags: [MessageFlags.Ephemeral] });

        if (subcommand === 'add') {
            const name = interaction.options.getString('name');
            const price = interaction.options.getInteger('price');
            const role = interaction.options.getRole('role');
            client.db.db.prepare('INSERT INTO shop_items (guild_id, name, price, role_id) VALUES (?, ?, ?, ?)').run(guildId, name, price, role.id);
            return interaction.reply({ content: `✅ Berhasil menambahkan **${name}** ke toko seharga **$${price.toLocaleString()}**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'edit') {
            const id = interaction.options.getInteger('id');
            const newName = interaction.options.getString('name');
            const newPrice = interaction.options.getInteger('price');

            if (newName) client.db.db.prepare('UPDATE shop_items SET name = ? WHERE id = ? AND guild_id = ?').run(newName, id, guildId);
            if (newPrice) client.db.db.prepare('UPDATE shop_items SET price = ? WHERE id = ? AND guild_id = ?').run(newPrice, id, guildId);

            return interaction.reply({ content: `✅ Item ID \`${id}\` telah diperbarui.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'remove') {
            const id = interaction.options.getInteger('id');
            client.db.db.prepare('DELETE FROM shop_items WHERE id = ? AND guild_id = ?').run(id, guildId);
            return interaction.reply({ content: `✅ Item ID \`${id}\` telah dihapus.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'clear') {
            client.db.db.prepare('DELETE FROM shop_items WHERE guild_id = ?').run(guildId);
            return interaction.reply({ content: '✅ Toko berhasil dikosongkan.', flags: [MessageFlags.Ephemeral] });
        }
    }
};

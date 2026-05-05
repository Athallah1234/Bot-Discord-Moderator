import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Mengelola sistem Self-Roles (Reaction Roles)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('setup')
            .setDescription('Buat menu pilih role baru')
            .addStringOption(opt => opt.setName('title').setDescription('Judul menu role').setRequired(true))
            .addStringOption(opt => opt.setName('description').setDescription('Deskripsi menu role').setRequired(true))
            .addStringOption(opt => opt.setName('roles').setDescription('Format: @Role:Label, @Role:Label (pisahkan dengan koma)').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('add')
            .setDescription('Tambah role ke menu yang sudah ada')
            .addStringOption(opt => opt.setName('message_id').setDescription('ID pesan menu role').setRequired(true))
            .addRoleOption(opt => opt.setName('role').setDescription('Role yang ingin ditambah').setRequired(true))
            .addStringOption(opt => opt.setName('label').setDescription('Label untuk role tersebut').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('remove')
            .setDescription('Hapus role dari menu yang ada')
            .addStringOption(opt => opt.setName('message_id').setDescription('ID pesan menu role').setRequired(true))
            .addRoleOption(opt => opt.setName('role').setDescription('Role yang ingin dihapus').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('delete')
            .setDescription('Hapus seluruh menu role')
            .addStringOption(opt => opt.setName('message_id').setDescription('ID pesan menu role').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('list')
            .setDescription('Lihat daftar menu role aktif')),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        if (subcommand === 'setup') {
            const title = interaction.options.getString('title');
            const description = interaction.options.getString('description');
            const rolesInput = interaction.options.getString('roles');
            const roleEntries = rolesInput.split(',').map(entry => entry.trim());
            const parsedRoles = [];

            for (const entry of roleEntries) {
                const [roleMention, label] = entry.split(':');
                const roleId = roleMention?.replace(/[<@&>]/g, '');
                const role = interaction.guild.roles.cache.get(roleId);
                if (role && label) parsedRoles.push({ id: role.id, label: label });
            }

            if (parsedRoles.length === 0) return interaction.reply({ content: 'Format salah! Gunakan `@Role:Label, @Role:Label`.', flags: [MessageFlags.Ephemeral] });

            const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor('#5865F2').setFooter({ text: 'Pilih role Anda melalui menu di bawah ini.' });
            const selectMenu = new StringSelectMenuBuilder().setCustomId('reaction_role_select').setPlaceholder('Pilih Role Anda...').addOptions(parsedRoles.map(r => new StringSelectMenuOptionBuilder().setLabel(r.label).setValue(r.id)));
            const row = new ActionRowBuilder().addComponents(selectMenu);

            const msg = await interaction.channel.send({ embeds: [embed], components: [row] });
            for (const r of parsedRoles) {
                client.db.db.prepare('INSERT INTO reaction_roles (guild_id, message_id, role_id, label) VALUES (?, ?, ?, ?)').run(guildId, msg.id, r.id, r.label);
            }
            return interaction.reply({ content: '✅ Menu Reaction Roles berhasil dibuat!', flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'add') {
            const messageId = interaction.options.getString('message_id');
            const role = interaction.options.getRole('role');
            const label = interaction.options.getString('label');

            const exists = client.db.db.prepare('SELECT * FROM reaction_roles WHERE message_id = ?').get(messageId);
            if (!exists) return interaction.reply({ content: 'Menu role tidak ditemukan.', flags: [MessageFlags.Ephemeral] });

            client.db.db.prepare('INSERT INTO reaction_roles (guild_id, message_id, role_id, label) VALUES (?, ?, ?, ?)').run(guildId, messageId, role.id, label);
            await this.updateMenu(client, interaction, messageId);
            return interaction.reply({ content: `✅ Role ${role} berhasil ditambahkan ke menu.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'remove') {
            const messageId = interaction.options.getString('message_id');
            const role = interaction.options.getRole('role');

            client.db.db.prepare('DELETE FROM reaction_roles WHERE message_id = ? AND role_id = ?').run(messageId, role.id);
            await this.updateMenu(client, interaction, messageId);
            return interaction.reply({ content: `✅ Role ${role} berhasil dihapus dari menu.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'delete') {
            const messageId = interaction.options.getString('message_id');
            client.db.db.prepare('DELETE FROM reaction_roles WHERE message_id = ?').run(messageId);
            
            const msg = await interaction.channel.messages.fetch(messageId).catch(() => null);
            if (msg) await msg.delete().catch(() => {});
            
            return interaction.reply({ content: '✅ Menu role telah dihapus.', flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'list') {
            const menus = client.db.db.prepare('SELECT DISTINCT message_id FROM reaction_roles WHERE guild_id = ?').all(guildId);
            if (menus.length === 0) return interaction.reply({ content: 'Tidak ada menu role aktif.', flags: [MessageFlags.Ephemeral] });

            const embed = new EmbedBuilder()
                .setTitle('🎭 Active Role Menus')
                .setColor('#5865F2')
                .setDescription(menus.map((m, i) => `**#${i + 1}** | ID: \`${m.message_id}\``).join('\n'));
            
            return interaction.reply({ embeds: [embed] });
        }
    },

    async updateMenu(client, interaction, messageId) {
        const roles = client.db.db.prepare('SELECT * FROM reaction_roles WHERE message_id = ?').all(messageId);
        const msg = await interaction.channel.messages.fetch(messageId).catch(() => null);
        if (!msg) return;

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('reaction_role_select')
            .setPlaceholder('Pilih Role Anda...')
            .addOptions(roles.map(r => new StringSelectMenuOptionBuilder().setLabel(r.label).setValue(r.role_id)));

        const row = new ActionRowBuilder().addComponents(selectMenu);
        await msg.edit({ components: [row] });
    }
};

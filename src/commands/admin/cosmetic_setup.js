import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('cosmetic-setup')
        .setDescription('Mengatur sistem kosmetik (Warna & Lencana)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommandGroup(group => group
            .setName('color')
            .setDescription('Mengatur role warna')
            .addSubcommand(sub => sub
                .setName('add')
                .setDescription('Tambah role warna ke daftar')
                .addRoleOption(opt => opt.setName('role').setDescription('Role warna').setRequired(true))
                .addStringOption(opt => opt.setName('name').setDescription('Nama tampilan warna').setRequired(true)))
            .addSubcommand(sub => sub
                .setName('remove')
                .setDescription('Hapus role warna dari daftar')
                .addRoleOption(opt => opt.setName('role').setDescription('Role yang dihapus').setRequired(true))))
        .addSubcommandGroup(group => group
            .setName('badge')
            .setDescription('Mengatur lencana member')
            .addSubcommand(sub => sub
                .setName('give')
                .setDescription('Berikan lencana ke member')
                .addUserOption(opt => opt.setName('user').setDescription('Target member').setRequired(true))
                .addStringOption(opt => opt.setName('emoji').setDescription('Emoji lencana').setRequired(true))
                .addStringOption(opt => opt.setName('name').setDescription('Nama lencana').setRequired(true)))
            .addSubcommand(sub => sub
                .setName('revoke')
                .setDescription('Tarik lencana dari member')
                .addUserOption(opt => opt.setName('user').setDescription('Target member').setRequired(true))
                .addStringOption(opt => opt.setName('name').setDescription('Nama lencana').setRequired(true)))),
    
    async execute(interaction, client) {
        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        if (group === 'color') {
            if (subcommand === 'add') {
                const role = interaction.options.getRole('role');
                const name = interaction.options.getString('name');
                client.db.db.prepare('INSERT OR REPLACE INTO color_roles (guild_id, role_id, name) VALUES (?, ?, ?)').run(guildId, role.id, name);
                return interaction.reply({ content: `✅ Role **${role.name}** ditambahkan sebagai warna **${name}**.`, flags: [MessageFlags.Ephemeral] });
            }
            if (subcommand === 'remove') {
                const role = interaction.options.getRole('role');
                client.db.db.prepare('DELETE FROM color_roles WHERE guild_id = ? AND role_id = ?').run(guildId, role.id);
                return interaction.reply({ content: `✅ Role warna telah dihapus dari daftar.`, flags: [MessageFlags.Ephemeral] });
            }
        }

        if (group === 'badge') {
            const user = interaction.options.getUser('user');
            const bName = interaction.options.getString('name');

            if (subcommand === 'give') {
                const emoji = interaction.options.getString('emoji');
                client.db.db.prepare('INSERT OR REPLACE INTO user_badges (guild_id, user_id, badge_emoji, badge_name) VALUES (?, ?, ?, ?)').run(guildId, user.id, emoji, bName);
                return interaction.reply({ content: `✅ Lencana **${emoji} ${bName}** berhasil diberikan kepada ${user}.`, flags: [MessageFlags.Ephemeral] });
            }
            if (subcommand === 'revoke') {
                client.db.db.prepare('DELETE FROM user_badges WHERE guild_id = ? AND user_id = ? AND badge_name = ?').run(guildId, user.id, bName);
                return interaction.reply({ content: `✅ Lencana **${bName}** telah ditarik dari ${user}.`, flags: [MessageFlags.Ephemeral] });
            }
        }
    }
};

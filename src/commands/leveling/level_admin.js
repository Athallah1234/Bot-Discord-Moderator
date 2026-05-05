import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, ChannelType, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Mengelola sistem leveling (Admin Only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('set')
            .setDescription('Mengatur level seorang member')
            .addUserOption(opt => opt.setName('user').setDescription('User yang ingin diatur').setRequired(true))
            .addIntegerOption(opt => opt.setName('value').setDescription('Level baru').setRequired(true).setMinValue(0)))
        .addSubcommand(sub => sub
            .setName('reset')
            .setDescription('Mereset XP dan Level seorang member')
            .addUserOption(opt => opt.setName('user').setDescription('User yang ingin direset').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('add_reward')
            .setDescription('Tambah hadiah role untuk level tertentu')
            .addIntegerOption(opt => opt.setName('level').setDescription('Level target').setRequired(true))
            .addRoleOption(opt => opt.setName('role').setDescription('Role hadiah').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('remove_reward')
            .setDescription('Hapus hadiah role dari level tertentu')
            .addIntegerOption(opt => opt.setName('level').setDescription('Level target').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('rewards_list')
            .setDescription('Melihat semua daftar hadiah level'))
        .addSubcommand(sub => sub
            .setName('bypass')
            .setDescription('Tambah/Hapus channel yang tidak memberikan XP')
            .addChannelOption(opt => opt.setName('channel').setDescription('Channel tujuan').addChannelTypes(ChannelType.GuildText).setRequired(true))),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        if (subcommand === 'set') {
            const user = interaction.options.getUser('user');
            const level = interaction.options.getInteger('value');
            const xp = level * 500;
            client.db.db.prepare('INSERT INTO users (guild_id, user_id, xp, level) VALUES (?, ?, ?, ?) ON CONFLICT(guild_id, user_id) DO UPDATE SET xp = ?, level = ?').run(guildId, user.id, xp, level, xp, level);
            await interaction.reply({ content: `✅ Level ${user.tag} diatur ke **${level}**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'add_reward') {
            const level = interaction.options.getInteger('level');
            const role = interaction.options.getRole('role');
            client.db.db.prepare('INSERT INTO level_rewards (level, role_id) VALUES (?, ?) ON CONFLICT(level) DO UPDATE SET role_id = ?').run(level, role.id, role.id);
            await interaction.reply({ content: `✅ Role ${role} akan diberikan otomatis saat member mencapai **Level ${level}**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'remove_reward') {
            const level = interaction.options.getInteger('level');
            client.db.db.prepare('DELETE FROM level_rewards WHERE level = ?').run(level);
            await interaction.reply({ content: `✅ Hadiah role untuk Level ${level} telah dihapus.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'rewards_list') {
            const rewards = client.db.db.prepare('SELECT * FROM level_rewards ORDER BY level ASC').all();
            if (rewards.length === 0) return interaction.reply({ content: 'Belum ada hadiah level yang diatur.', flags: [MessageFlags.Ephemeral] });
            
            const embed = new EmbedBuilder()
                .setTitle('🎁 Level Rewards List')
                .setColor('#F1C40F')
                .setDescription(rewards.map(r => `Level **${r.level}**: <@&${r.role_id}>`).join('\n'));
            await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'bypass') {
            const channel = interaction.options.getChannel('channel');
            const exists = client.db.db.prepare('SELECT * FROM level_bypass WHERE channel_id = ?').get(channel.id);
            
            if (exists) {
                client.db.db.prepare('DELETE FROM level_bypass WHERE channel_id = ?').run(channel.id);
                await interaction.reply({ content: `✅ Channel ${channel} sekarang kembali memberikan XP.`, flags: [MessageFlags.Ephemeral] });
            } else {
                client.db.db.prepare('INSERT INTO level_bypass (channel_id) VALUES (?)').run(channel.id);
                await interaction.reply({ content: `✅ Channel ${channel} sekarang **tidak akan** memberikan XP.`, flags: [MessageFlags.Ephemeral] });
            }
        }

        if (subcommand === 'reset') {
            const user = interaction.options.getUser('user');
            client.db.db.prepare('DELETE FROM users WHERE guild_id = ? AND user_id = ?').run(guildId, user.id);
            await interaction.reply({ content: `✅ Riwayat leveling ${user.tag} telah direset.`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

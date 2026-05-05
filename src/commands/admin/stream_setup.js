import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('stream-setup')
        .setDescription('Mengatur notifikasi otomatis Social Media')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('add')
            .setDescription('Tambah channel untuk dipantau')
            .addStringOption(opt => opt.setName('platform')
                .setDescription('Pilih Platform')
                .setRequired(true)
                .addChoices(
                    { name: 'YouTube', value: 'YOUTUBE' },
                    { name: 'Twitch', value: 'TWITCH' },
                    { name: 'Reddit', value: 'REDDIT' },
                    { name: 'GitHub', value: 'GITHUB' }
                ))
            .addStringOption(opt => opt.setName('target').setDescription('YouTube ID / Twitch User / Subreddit Name / GitHub Repo (user/repo)').setRequired(true))
            .addChannelOption(opt => opt.setName('channel').setDescription('Channel Discord tujuan').addChannelTypes(ChannelType.GuildText).setRequired(true)))
        .addSubcommand(sub => sub
            .setName('remove')
            .setDescription('Hapus channel dari pantauan')
            .addIntegerOption(opt => opt.setName('id').setDescription('ID Monitoring').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('list')
            .setDescription('Lihat daftar channel yang dipantau')),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        if (subcommand === 'add') {
            const platform = interaction.options.getString('platform');
            const target = interaction.options.getString('target');
            const discordChannel = interaction.options.getChannel('channel');

            client.db.db.prepare('INSERT INTO stream_notifications (guild_id, discord_channel, platform, target_id) VALUES (?, ?, ?, ?)').run(
                guildId, discordChannel.id, platform, target
            );

            return interaction.reply({ content: `✅ Berhasil menambahkan monitoring **${platform}** untuk **${target}**!`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'remove') {
            const id = interaction.options.getInteger('id');
            client.db.db.prepare('DELETE FROM stream_notifications WHERE id = ? AND guild_id = ?').run(id, guildId);
            return interaction.reply({ content: `✅ Monitoring ID \`${id}\` dihapus.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'list') {
            const list = client.db.db.prepare('SELECT * FROM stream_notifications WHERE guild_id = ?').all(guildId);
            if (list.length === 0) return interaction.reply({ content: 'Belum ada monitoring aktif.', flags: [MessageFlags.Ephemeral] });

            const embed = new EmbedBuilder()
                .setTitle('🔔 Social Media Monitoring List')
                .setColor('#5865F2')
                .setDescription(list.map(l => `**ID: \`${l.id}\`** | **${l.platform}**\nTarget: \`${l.target_id}\` | Channel: <#${l.discord_channel}>`).join('\n\n'))
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed] });
        }
    }
};

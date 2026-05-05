import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags, EmbedBuilder } from 'discord.js';
import ms from 'ms';

export default {
    data: new SlashCommandBuilder()
        .setName('announcer')
        .setDescription('Mengelola pengumuman otomatis terjadwal')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('add')
            .setDescription('Tambah pengumuman terjadwal')
            .addChannelOption(opt => opt.setName('channel').setDescription('Channel tujuan').addChannelTypes(ChannelType.GuildText).setRequired(true))
            .addStringOption(opt => opt.setName('interval').setDescription('Interval waktu (misal: 1h, 30m, 12h)').setRequired(true))
            .addStringOption(opt => opt.setName('message').setDescription('Isi pesan pengumuman').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('remove')
            .setDescription('Hapus pengumuman terjadwal')
            .addIntegerOption(opt => opt.setName('id').setDescription('ID Pengumuman').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('list')
            .setDescription('Lihat daftar pengumuman aktif')),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        if (subcommand === 'add') {
            const channel = interaction.options.getChannel('channel');
            const intervalStr = interaction.options.getString('interval');
            const message = interaction.options.getString('message');
            const intervalMs = ms(intervalStr);

            if (!intervalMs || intervalMs < 60000) {
                return interaction.reply({ content: 'Interval tidak valid! Minimal 1 menit (1m).', flags: [MessageFlags.Ephemeral] });
            }

            client.db.db.prepare('INSERT INTO announcements (guild_id, channel_id, message, interval_ms) VALUES (?, ?, ?, ?)').run(
                guildId, channel.id, message, intervalMs
            );

            return interaction.reply({ content: `✅ Pengumuman berhasil dijadwalkan di ${channel} setiap **${intervalStr}**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'remove') {
            const id = interaction.options.getInteger('id');
            client.db.db.prepare('DELETE FROM announcements WHERE id = ? AND guild_id = ?').run(id, guildId);
            return interaction.reply({ content: `✅ Pengumuman ID \`${id}\` telah dihapus.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'list') {
            const list = client.db.db.prepare('SELECT * FROM announcements WHERE guild_id = ?').all(guildId);
            if (list.length === 0) return interaction.reply({ content: 'Belum ada pengumuman terjadwal.', flags: [MessageFlags.Ephemeral] });

            const embed = new EmbedBuilder()
                .setTitle('📢 Scheduled Announcements')
                .setColor('#5865F2')
                .setDescription(list.map(a => `**ID: \`${a.id}\`** | Channel: <#${a.channel_id}>\n**Interval:** ${ms(a.interval_ms, { long: true })}\n**Pesan:** ${a.message.slice(0, 100)}...`).join('\n\n'))
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed] });
        }
    }
};

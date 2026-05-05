import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('Mengelola event server')
        .addSubcommand(sub => sub.setName('create').setDescription('Buat event baru (Admin Only)'))
        .addSubcommand(sub => sub.setName('list').setDescription('Lihat daftar event'))
        .addSubcommand(sub => sub.setName('delete').setDescription('Hapus event (Admin Only)').addIntegerOption(opt => opt.setName('id').setDescription('ID Event').setRequired(true))),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'create') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: 'Hanya Admin yang bisa membuat event.', flags: [MessageFlags.Ephemeral] });

            const modal = new ModalBuilder()
                .setCustomId('event_modal')
                .setTitle('Create Server Event');

            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('event_name').setLabel('Nama Event').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('event_desc').setLabel('Deskripsi').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('event_time').setLabel('Waktu (misal: 1h, 1d, 2026-05-10)').setStyle(TextInputStyle.Short).setRequired(true))
            );

            await interaction.showModal(modal);
        }

        if (subcommand === 'list') {
            const events = client.db.db.prepare('SELECT * FROM server_events WHERE guild_id = ?').all(interaction.guildId);
            if (events.length === 0) return interaction.reply({ content: 'Belum ada event yang dijadwalkan.', flags: [MessageFlags.Ephemeral] });

            const embed = new EmbedBuilder()
                .setTitle(`📅 Upcoming Events: ${interaction.guild.name}`)
                .setColor('#5865F2')
                .setDescription(events.map(e => `**ID: \`${e.id}\`** | **${e.name}**\n⏰ Waktu: <t:${Math.floor(new Date(e.start_time).getTime() / 1000)}:R>\n📝 ${e.description}`).join('\n\n'))
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'delete') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: 'Hanya Admin yang bisa menghapus event.', flags: [MessageFlags.Ephemeral] });
            const id = interaction.options.getInteger('id');
            client.db.db.prepare('DELETE FROM server_events WHERE id = ? AND guild_id = ?').run(id, interaction.guildId);
            client.db.db.prepare('DELETE FROM event_rsvps WHERE event_id = ?').run(id);
            await interaction.reply({ content: `✅ Event ID \`${id}\` telah dihapus.`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

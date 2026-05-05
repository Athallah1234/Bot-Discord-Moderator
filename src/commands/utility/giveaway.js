import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags } from 'discord.js';
import ms from 'ms';

export default {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Mengelola sistem giveaway')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(sub => sub
            .setName('start')
            .setDescription('Memulai giveaway baru')
            .addStringOption(opt => opt.setName('duration').setDescription('Durasi (contoh: 1h, 1d, 30m)').setRequired(true))
            .addIntegerOption(opt => opt.setName('winners').setDescription('Jumlah pemenang').setRequired(true).setMinValue(1))
            .addStringOption(opt => opt.setName('prize').setDescription('Hadiah giveaway').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('reroll')
            .setDescription('Mengundi ulang pemenang dari giveaway yang sudah berakhir')
            .addStringOption(opt => opt.setName('message_id').setDescription('ID pesan giveaway').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('end')
            .setDescription('Mengakhiri giveaway secara paksa saat ini juga')
            .addStringOption(opt => opt.setName('message_id').setDescription('ID pesan giveaway').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('delete')
            .setDescription('Membatalkan dan menghapus giveaway')
            .addStringOption(opt => opt.setName('message_id').setDescription('ID pesan giveaway').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('list')
            .setDescription('Menampilkan daftar giveaway yang sedang aktif'))
        .addSubcommand(sub => sub
            .setName('info')
            .setDescription('Melihat detail informasi sebuah giveaway')
            .addStringOption(opt => opt.setName('message_id').setDescription('ID pesan giveaway').setRequired(true))),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        
        if (subcommand === 'start') {
            const durationStr = interaction.options.getString('duration');
            const winnerCount = interaction.options.getInteger('winners');
            const prize = interaction.options.getString('prize');
            
            const duration = ms(durationStr);
            if (!duration) return interaction.reply({ content: 'Format durasi tidak valid.', flags: [MessageFlags.Ephemeral] });

            const endsAt = new Date(Date.now() + duration);
            
            const embed = new EmbedBuilder()
                .setTitle('🎉 GIVEAWAY START! 🎉')
                .setDescription(`Prize: **${prize}**\n\nKlik tombol di bawah untuk ikut serta!\n\n⌛ Ends: <t:${Math.floor(endsAt.getTime() / 1000)}:R>\n👤 Winners: **${winnerCount}**`)
                .setColor('#F1C40F')
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('giveaway_join')
                    .setLabel('Join Giveaway')
                    .setEmoji('🎁')
                    .setStyle(ButtonStyle.Primary)
            );

            const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

            client.db.db.prepare('INSERT INTO giveaways (message_id, guild_id, channel_id, prize, winner_count, ends_at) VALUES (?, ?, ?, ?, ?, ?)').run(
                msg.id, guildId, interaction.channelId, prize, winnerCount, endsAt.toISOString()
            );
        }

        if (subcommand === 'end') {
            const messageId = interaction.options.getString('message_id');
            const gw = client.db.db.prepare('SELECT * FROM giveaways WHERE message_id = ? AND guild_id = ? AND status = "OPEN"').get(messageId, guildId);
            
            if (!gw) return interaction.reply({ content: 'Giveaway aktif tidak ditemukan.', flags: [MessageFlags.Ephemeral] });
            
            await client.giveaways.endGiveaway(gw);
            await interaction.reply({ content: '✅ Giveaway telah diakhiri secara manual.', flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'delete') {
            const messageId = interaction.options.getString('message_id');
            const gw = client.db.db.prepare('SELECT * FROM giveaways WHERE message_id = ? AND guild_id = ?').get(messageId, guildId);
            
            if (!gw) return interaction.reply({ content: 'Giveaway tidak ditemukan.', flags: [MessageFlags.Ephemeral] });

            client.db.db.prepare('DELETE FROM giveaways WHERE message_id = ?').run(messageId);
            client.db.db.prepare('DELETE FROM giveaway_entries WHERE message_id = ?').run(messageId);

            const channel = await client.channels.fetch(gw.channel_id).catch(() => null);
            if (channel) {
                const msg = await channel.messages.fetch(messageId).catch(() => null);
                if (msg) await msg.delete().catch(() => {});
            }

            await interaction.reply({ content: '✅ Giveaway telah dibatalkan dan dihapus.', flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'list') {
            const active = client.db.db.prepare('SELECT * FROM giveaways WHERE guild_id = ? AND status = "OPEN"').all(guildId);
            
            if (active.length === 0) return interaction.reply({ content: 'Tidak ada giveaway aktif saat ini.', flags: [MessageFlags.Ephemeral] });

            const embed = new EmbedBuilder()
                .setTitle('🎁 Active Giveaways')
                .setColor('#5865F2')
                .setDescription(active.map(gw => `**Prize:** ${gw.prize}\n**ID:** \`${gw.message_id}\`\n**Ends:** <t:${Math.floor(new Date(gw.ends_at).getTime() / 1000)}:R>`).join('\n\n'));

            await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'info') {
            const messageId = interaction.options.getString('message_id');
            const gw = client.db.db.prepare('SELECT * FROM giveaways WHERE message_id = ? AND guild_id = ?').get(messageId, guildId);
            
            if (!gw) return interaction.reply({ content: 'Giveaway tidak ditemukan.', flags: [MessageFlags.Ephemeral] });

            const entries = client.db.db.prepare('SELECT COUNT(*) as count FROM giveaway_entries WHERE message_id = ?').get(messageId);

            const embed = new EmbedBuilder()
                .setTitle(`Giveaway Info: ${gw.prize}`)
                .setColor('#F1C40F')
                .addFields([
                    { name: 'Status', value: `\`${gw.status}\``, inline: true },
                    { name: 'Participants', value: `\`${entries.count}\``, inline: true },
                    { name: 'Winners', value: `\`${gw.winner_count}\``, inline: true },
                    { name: 'Ends At', value: `<t:${Math.floor(new Date(gw.ends_at).getTime() / 1000)}:F>` }
                ]);

            await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'reroll') {
            const messageId = interaction.options.getString('message_id');
            await client.giveaways.reroll(messageId, interaction);
        }
    }
};

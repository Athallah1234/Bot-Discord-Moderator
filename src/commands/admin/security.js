import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('security')
        .setDescription('Mengelola sistem keamanan server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('status')
            .setDescription('Melihat status keamanan server saat ini'))
        .addSubcommand(sub => sub
            .setName('antiinvite')
            .setDescription('Aktifkan/Matikan blokir link undangan server lain')
            .addBooleanOption(opt => opt.setName('enabled').setDescription('Status').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('antialt')
            .setDescription('Blokir akun baru (Anti-Alt)')
            .addIntegerOption(opt => opt.setName('days').setDescription('Usia minimal akun (hari). Gunakan 0 untuk matikan').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('antispam')
            .setDescription('Batas pesan per 5 detik (Anti-Spam)')
            .addIntegerOption(opt => opt.setName('limit').setDescription('Jumlah pesan maksimal. Gunakan 0 untuk matikan').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('anticaps')
            .setDescription('Blokir pesan dengan Caps Berlebih')
            .addIntegerOption(opt => opt.setName('percentage').setDescription('Persentase minimal Caps (1-100). 0 untuk matikan').setRequired(true).setMinValue(0).setMaxValue(100)))
        .addSubcommand(sub => sub
            .setName('antimention')
            .setDescription('Batas maksimal mention per pesan')
            .addIntegerOption(opt => opt.setName('limit').setDescription('Jumlah mention maksimal. 0 untuk matikan').setRequired(true)))
        .addSubcommandGroup(group => group
            .setName('badwords')
            .setDescription('Mengelola daftar kata terlarang')
            .addSubcommand(sub => sub
                .setName('add')
                .setDescription('Tambah kata terlarang')
                .addStringOption(opt => opt.setName('word').setDescription('Kata yang ingin dilarang').setRequired(true)))
            .addSubcommand(sub => sub
                .setName('remove')
                .setDescription('Hapus kata terlarang')
                .addStringOption(opt => opt.setName('word').setDescription('Kata yang ingin dihapus').setRequired(true)))
            .addSubcommand(sub => sub
                .setName('list')
                .setDescription('Lihat semua daftar kata terlarang')))
        .addSubcommandGroup(group => group
            .setName('whitelist')
            .setDescription('Mengelola pengecualian keamanan')
            .addSubcommand(sub => sub
                .setName('role')
                .setDescription('Tambah/Hapus Role dari Whitelist')
                .addRoleOption(opt => opt.setName('target').setDescription('Role yang dituju').setRequired(true)))
            .addSubcommand(sub => sub
                .setName('channel')
                .setDescription('Tambah/Hapus Channel dari Whitelist')
                .addChannelOption(opt => opt.setName('target').setDescription('Channel yang dituju').setRequired(true)))),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const group = interaction.options.getSubcommandGroup(false);
        const guildId = interaction.guildId;

        if (subcommand === 'status') {
            const settings = client.db.getSettings(guildId);
            const badWords = client.db.db.prepare('SELECT COUNT(*) as count FROM bad_words WHERE guild_id = ?').get(guildId);
            const whitelist = client.db.db.prepare('SELECT COUNT(*) as count FROM security_whitelist WHERE guild_id = ?').get(guildId);

            const embed = new EmbedBuilder()
                .setTitle('🛡️ Server Security Status')
                .setColor('#5865F2')
                .addFields(
                    { name: 'Anti-Invite', value: settings.anti_invite ? '✅ Enabled' : '❌ Disabled', inline: true },
                    { name: 'Anti-Alt', value: settings.min_account_age > 0 ? `✅ Enabled (${settings.min_account_age}d)` : '❌ Disabled', inline: true },
                    { name: 'Anti-Spam', value: settings.anti_spam_limit > 0 ? `✅ Enabled (${settings.anti_spam_limit} msg/5s)` : '❌ Disabled', inline: true },
                    { name: 'Anti-Caps', value: settings.anti_caps_limit > 0 ? `✅ Enabled (${settings.anti_caps_limit}%)` : '❌ Disabled', inline: true },
                    { name: 'Anti-Mention', value: settings.anti_mention_limit > 0 ? `✅ Enabled (${settings.anti_mention_limit} pings)` : '❌ Disabled', inline: true },
                    { name: 'Resources', value: `\`${badWords.count}\` Bad Words | \`${whitelist.count}\` Whitelisted`, inline: true }
                )
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'antiinvite') {
            const enabled = interaction.options.getBoolean('enabled');
            client.db.updateSettings(guildId, 'anti_invite', enabled ? 1 : 0);
            return interaction.reply({ content: `✅ Anti-Invite sekarang **${enabled ? 'Aktif' : 'Nonaktif'}**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'antialt') {
            const days = interaction.options.getInteger('days');
            client.db.updateSettings(guildId, 'min_account_age', days);
            return interaction.reply({ content: `✅ Anti-Alt sekarang diatur ke **${days} hari**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'antispam') {
            const limit = interaction.options.getInteger('limit');
            client.db.updateSettings(guildId, 'anti_spam_limit', limit);
            return interaction.reply({ content: `✅ Anti-Spam limit diatur ke **${limit} pesan/5 detik**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'anticaps') {
            const perc = interaction.options.getInteger('percentage');
            client.db.updateSettings(guildId, 'anti_caps_limit', perc);
            return interaction.reply({ content: `✅ Anti-Caps sekarang diatur ke **${perc}%**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'antimention') {
            const limit = interaction.options.getInteger('limit');
            client.db.updateSettings(guildId, 'anti_mention_limit', limit);
            return interaction.reply({ content: `✅ Anti-Mention limit diatur ke **${limit} mention/pesan**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (group === 'badwords') {
            const word = interaction.options.getString('word')?.toLowerCase();
            if (subcommand === 'add') {
                client.db.db.prepare('INSERT INTO bad_words (guild_id, word) VALUES (?, ?)').run(guildId, word);
                return interaction.reply({ content: `✅ \`${word}\` ditambahkan ke daftar terlarang.`, flags: [MessageFlags.Ephemeral] });
            }
            if (subcommand === 'remove') {
                client.db.db.prepare('DELETE FROM bad_words WHERE guild_id = ? AND word = ?').run(guildId, word);
                return interaction.reply({ content: `✅ \`${word}\` dihapus dari daftar terlarang.`, flags: [MessageFlags.Ephemeral] });
            }
            if (subcommand === 'list') {
                const list = client.db.db.prepare('SELECT word FROM bad_words WHERE guild_id = ?').all(guildId);
                const embed = new EmbedBuilder().setTitle('🚫 Blacklisted Words').setColor('#E74C3C').setDescription(list.map(w => `\`${w.word}\``).join(', ') || 'Empty');
                return interaction.reply({ embeds: [embed] });
            }
        }

        if (group === 'whitelist') {
            const target = interaction.options.getMentionable('target');
            const type = interaction.options.getRole('target') ? 'ROLE' : 'CHANNEL';
            
            const exists = client.db.db.prepare('SELECT * FROM security_whitelist WHERE guild_id = ? AND target_id = ?').get(guildId, target.id);
            if (exists) {
                client.db.db.prepare('DELETE FROM security_whitelist WHERE guild_id = ? AND target_id = ?').run(guildId, target.id);
                return interaction.reply({ content: `✅ ${target} dihapus dari Whitelist Keamanan.`, flags: [MessageFlags.Ephemeral] });
            } else {
                client.db.db.prepare('INSERT INTO security_whitelist (guild_id, target_id, type) VALUES (?, ?, ?)').run(guildId, target.id, type);
                return interaction.reply({ content: `✅ ${target} ditambahkan ke Whitelist Keamanan. (Kebal dari Auto-Mod)`, flags: [MessageFlags.Ephemeral] });
            }
        }
    }
};

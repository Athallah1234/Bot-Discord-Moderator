import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags, ChannelType } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('welcomer')
        .setDescription('Mengelola sistem sambutan member baru')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('setup')
            .setDescription('Mengatur pesan sambutan channel')
            .addChannelOption(opt => opt.setName('channel').setDescription('Channel tujuan').addChannelTypes(ChannelType.GuildText).setRequired(true))
            .addBooleanOption(opt => opt.setName('enabled').setDescription('Status aktif/nonaktif').setRequired(true))
            .addStringOption(opt => opt.setName('message').setDescription('Pesan sambutan (Gunakan {user}, {guild}, {memberCount})').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('dm')
            .setDescription('Mengatur pesan sambutan via DM')
            .addBooleanOption(opt => opt.setName('enabled').setDescription('Status aktif/nonaktif').setRequired(true))
            .addStringOption(opt => opt.setName('message').setDescription('Pesan DM').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('autorole')
            .setDescription('Memberikan role otomatis saat join')
            .addRoleOption(opt => opt.setName('role').setDescription('Role yang diberikan (Kosongkan untuk hapus)').setRequired(false)))
        .addSubcommand(sub => sub
            .setName('customize')
            .setDescription('Kustomisasi tampilan Embed')
            .addStringOption(opt => opt.setName('type').setDescription('Tipe').addChoices({ name: 'Welcome', value: 'welcome' }, { name: 'Leave', value: 'leave' }).setRequired(true))
            .addStringOption(opt => opt.setName('title').setDescription('Judul Embed').setRequired(false))
            .addStringOption(opt => opt.setName('color').setDescription('Warna Hex (Contoh: #FF0000)').setRequired(false)))
        .addSubcommand(sub => sub
            .setName('test')
            .setDescription('Menguji tampilan pesan sambutan'))
        .addSubcommandGroup(group => group
            .setName('leave')
            .setDescription('Mengelola sistem perpisahan member')
            .addSubcommand(sub => sub
                .setName('setup')
                .setDescription('Mengatur pesan perpisahan')
                .addChannelOption(opt => opt.setName('channel').setDescription('Channel tujuan').addChannelTypes(ChannelType.GuildText).setRequired(true))
                .addBooleanOption(opt => opt.setName('enabled').setDescription('Status aktif/nonaktif').setRequired(true))
                .addStringOption(opt => opt.setName('message').setDescription('Pesan perpisahan').setRequired(true)))
            .addSubcommand(sub => sub
                .setName('test')
                .setDescription('Menguji tampilan pesan perpisahan'))),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const group = interaction.options.getSubcommandGroup(false);
        const guildId = interaction.guildId;

        if (subcommand === 'setup') {
            const type = group === 'leave' ? 'leave' : 'welcome';
            const channel = interaction.options.getChannel('channel');
            const enabled = interaction.options.getBoolean('enabled');
            const message = interaction.options.getString('message');

            client.db.updateSettings(guildId, `${type}_enabled`, enabled ? 1 : 0);
            client.db.updateSettings(guildId, `${type}_channel`, channel.id);
            client.db.updateSettings(guildId, `${type}_message`, message);

            return interaction.reply({ content: `✅ Sistem ${type === 'leave' ? 'perpisahan' : 'sambutan'} diatur di ${channel}.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'dm') {
            const enabled = interaction.options.getBoolean('enabled');
            const message = interaction.options.getString('message');
            client.db.updateSettings(guildId, 'welcome_dm_enabled', enabled ? 1 : 0);
            client.db.updateSettings(guildId, 'welcome_dm_message', message);
            return interaction.reply({ content: `✅ Sambutan DM sekarang **${enabled ? 'Aktif' : 'Nonaktif'}**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'autorole') {
            const role = interaction.options.getRole('role');
            client.db.updateSettings(guildId, 'auto_role', role ? role.id : null);
            return interaction.reply({ content: `✅ Auto-Role sekarang diatur ke: ${role ? role : '**Dihapus**'}.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'customize') {
            const type = interaction.options.getString('type');
            const title = interaction.options.getString('title');
            const color = interaction.options.getString('color');

            if (title) client.db.updateSettings(guildId, `${type}_title`, title);
            if (color) client.db.updateSettings(guildId, `${type}_color`, color);

            return interaction.reply({ content: `✅ Tampilan Embed **${type}** berhasil diperbarui.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'test') {
            const settings = client.db.getSettings(guildId);
            const type = group === 'leave' ? 'leave' : 'welcome';
            const channelId = settings[`${type}_channel`];
            const msgTemplate = settings[`${type}_message`];

            if (!channelId || !msgTemplate) return interaction.reply({ content: `Setup ${type} belum lengkap.`, flags: [MessageFlags.Ephemeral] });

            const channel = interaction.guild.channels.cache.get(channelId);
            if (!channel) return interaction.reply({ content: 'Channel tidak ditemukan.', flags: [MessageFlags.Ephemeral] });

            const finalMsg = msgTemplate
                .replace(/{user}/g, `<@${interaction.user.id}>`)
                .replace(/{guild}/g, interaction.guild.name)
                .replace(/{memberCount}/g, interaction.guild.memberCount);

            const embed = new EmbedBuilder()
                .setTitle(settings[`${type}_title` || ''])
                .setDescription(finalMsg)
                .setColor(settings[`${type}_color` || (type === 'leave' ? '#FF4757' : '#2ECC71')])
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp();

            await channel.send({ embeds: [embed] });
            return interaction.reply({ content: `✅ Test ${type} berhasil dikirim ke ${channel}.`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('voice-setup')
        .setDescription('Mengatur sistem Private Voice (Join-to-Create)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel pusat (Join to Create)').addChannelTypes(ChannelType.GuildVoice).setRequired(true))
        .addChannelOption(opt => opt.setName('category').setDescription('Kategori tempat channel baru dibuat').addChannelTypes(ChannelType.GuildCategory).setRequired(true))
        .addBooleanOption(opt => opt.setName('enabled').setDescription('Status aktif/nonaktif').setRequired(true)),
    
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');
        const category = interaction.options.getChannel('category');
        const enabled = interaction.options.getBoolean('enabled');
        const guildId = interaction.guildId;

        client.db.updateSettings(guildId, 'pvoice_enabled', enabled ? 1 : 0);
        client.db.updateSettings(guildId, 'pvoice_channel', channel.id);
        client.db.updateSettings(guildId, 'pvoice_category', category.id);

        await interaction.reply({ content: `✅ Sistem Private Voice berhasil diatur!\n📍 Channel Pusat: ${channel}\n📁 Kategori: **${category.name}**\n🟢 Status: **${enabled ? 'Aktif' : 'Nonaktif'}**`, flags: [MessageFlags.Ephemeral] });
    }
};

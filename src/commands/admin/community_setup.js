import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('community-setup')
        .setDescription('Mengatur channel komunitas (Suggestion, Report, Birthday)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(opt => opt.setName('suggestion').setDescription('Channel untuk Saran').addChannelTypes(ChannelType.GuildText))
        .addChannelOption(opt => opt.setName('report').setDescription('Channel untuk Laporan Staff').addChannelTypes(ChannelType.GuildText))
        .addChannelOption(opt => opt.setName('birthday').setDescription('Channel untuk Ucapan Ultah').addChannelTypes(ChannelType.GuildText)),
    
    async execute(interaction, client) {
        const suggest = interaction.options.getChannel('suggestion');
        const report = interaction.options.getChannel('report');
        const birthday = interaction.options.getChannel('birthday');
        const guildId = interaction.guildId;

        if (suggest) client.db.updateSettings(guildId, 'suggest_channel', suggest.id);
        if (report) client.db.updateSettings(guildId, 'report_channel', report.id);
        if (birthday) client.db.updateSettings(guildId, 'birthday_channel', birthday.id);

        await interaction.reply({ 
            content: `✅ Pengaturan Komunitas diperbarui!\n💡 Saran: ${suggest || 'Tidak diubah'}\n🚨 Laporan: ${report || 'Tidak diubah'}\n🎂 Ultah: ${birthday || 'Tidak diubah'}`, 
            flags: [MessageFlags.Ephemeral] 
        });
    }
};

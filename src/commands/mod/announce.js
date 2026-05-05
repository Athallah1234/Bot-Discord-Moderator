import { SlashCommandBuilder, EmbedBuilder, MessageFlags, ChannelType } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Mengirim pengumuman resmi ke channel tertentu')
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel tujuan').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addStringOption(opt => opt.setName('title').setDescription('Judul pengumuman').setRequired(true))
        .addStringOption(opt => opt.setName('message').setDescription('Isi pesan pengumuman (gunakan \\n untuk baris baru)').setRequired(true))
        .addStringOption(opt => opt.setName('color').setDescription('Warna Hex (contoh: #FF0000)').setMaxLength(7)),
    
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('title');
        const message = interaction.options.getString('message').replace(/\\n/g, '\n');
        const color = interaction.options.getString('color') || '#5865F2';

        try {
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(message)
                .setColor(color)
                .setFooter({ text: `Diumumkan oleh Staff: ${interaction.user.tag}` })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
            
            await interaction.reply({ content: `✅ Pengumuman berhasil dikirim ke ${channel}.`, flags: [MessageFlags.Ephemeral] });
        } catch (error) {
            interaction.reply({ content: `Gagal mengirim pengumuman: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

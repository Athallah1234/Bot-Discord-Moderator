import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Mengirim pesan Embed kustom')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('create')
            .setDescription('Buat embed lengkap melalui formulir'))
        .addSubcommand(sub => sub
            .setName('say')
            .setDescription('Kirim pesan teks biasa melalui bot')
            .addStringOption(opt => opt.setName('message').setDescription('Pesan yang ingin dikirim').setRequired(true))
            .addChannelOption(opt => opt.setName('channel').setDescription('Channel tujuan'))),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'say') {
            const message = interaction.options.getString('message');
            const channel = interaction.options.getChannel('channel') || interaction.channel;
            await channel.send(message);
            return interaction.reply({ content: `✅ Pesan berhasil dikirim ke ${channel}.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'create') {
            const modal = new ModalBuilder()
                .setCustomId('embed_modal')
                .setTitle('Create Custom Embed');

            const titleInput = new TextInputBuilder()
                .setCustomId('embed_title')
                .setLabel('Judul Embed')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Masukkan judul...')
                .setRequired(true);

            const descInput = new TextInputBuilder()
                .setCustomId('embed_desc')
                .setLabel('Deskripsi/Pesan')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Masukkan pesan utama...')
                .setRequired(true);

            const colorInput = new TextInputBuilder()
                .setCustomId('embed_color')
                .setLabel('Warna Hex (Contoh: #FF0000)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('#5865F2')
                .setRequired(false);

            const footerInput = new TextInputBuilder()
                .setCustomId('embed_footer')
                .setLabel('Footer Text')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder().addComponents(titleInput),
                new ActionRowBuilder().addComponents(descInput),
                new ActionRowBuilder().addComponents(colorInput),
                new ActionRowBuilder().addComponents(footerInput)
            );

            await interaction.showModal(modal);
        }
    }
};

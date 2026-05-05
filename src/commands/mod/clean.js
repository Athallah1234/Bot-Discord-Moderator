import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('clean')
        .setDescription('Menghapus pesan yang mengandung kata tertentu')
        .addStringOption(opt => opt.setName('query').setDescription('Kata kunci yang ingin dicari dan dihapus').setRequired(true))
        .addIntegerOption(opt => opt.setName('limit').setDescription('Jumlah pesan yang diperiksa (maks 100)').setMinValue(1).setMaxValue(100)),
    
    async execute(interaction, client) {
        const query = interaction.options.getString('query').toLowerCase();
        const limit = interaction.options.getInteger('limit') || 100;

        try {
            const messages = await interaction.channel.messages.fetch({ limit });
            const toDelete = messages.filter(m => m.content.toLowerCase().includes(query));

            if (toDelete.size === 0) {
                return interaction.reply({ content: `Tidak ditemukan pesan yang mengandung kata \`${query}\` dalam ${limit} pesan terakhir.`, flags: [MessageFlags.Ephemeral] });
            }

            const deleted = await interaction.channel.bulkDelete(toDelete, true);
            
            await interaction.reply({ content: `✅ Berhasil menghapus **${deleted.size}** pesan yang mengandung kata \`${query}\`.`, flags: [MessageFlags.Ephemeral] });
        } catch (error) {
            interaction.reply({ content: `Gagal membersihkan pesan: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('clear_reactions')
        .setDescription('Menghapus semua reaksi dari sebuah pesan')
        .addStringOption(opt => opt.setName('message_id').setDescription('ID pesan yang reaksinya ingin dihapus').setRequired(true)),
    
    async execute(interaction, client) {
        const messageId = interaction.options.getString('message_id');

        try {
            const message = await interaction.channel.messages.fetch(messageId);
            
            await message.reactions.removeAll();
            
            await interaction.reply({ content: `✅ Berhasil menghapus semua reaksi dari pesan \`${messageId}\`.`, flags: [MessageFlags.Ephemeral] });
        } catch (error) {
            interaction.reply({ content: `Gagal menghapus reaksi. Pastikan ID pesan berada di channel ini.`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

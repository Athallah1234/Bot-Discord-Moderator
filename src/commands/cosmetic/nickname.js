import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('nickname')
        .setDescription('Mengatur nama panggilan (Nickname) Anda')
        .addStringOption(opt => opt.setName('name').setDescription('Nickname baru').setRequired(true)),
    
    async execute(interaction, client) {
        const newName = interaction.options.getString('name');

        if (newName.length > 32) return interaction.reply({ content: 'Nickname tidak boleh lebih dari 32 karakter.', flags: [MessageFlags.Ephemeral] });

        try {
            await interaction.member.setNickname(newName);
            await interaction.reply({ content: `✅ Nickname Anda berhasil diubah menjadi **${newName}**!`, flags: [MessageFlags.Ephemeral] });
        } catch (error) {
            await interaction.reply({ content: '❌ Gagal mengubah nickname. Bot mungkin tidak memiliki izin yang cukup atau posisi role bot lebih rendah.', flags: [MessageFlags.Ephemeral] });
        }
    }
};

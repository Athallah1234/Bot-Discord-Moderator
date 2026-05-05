import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('clearwarnings')
        .setDescription('Menghapus semua riwayat peringatan user')
        .addUserOption(opt => opt.setName('user').setDescription('User yang ingin dibersihkan').setRequired(true)),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        
        client.db.clearWarnings(interaction.guildId, user.id);

        const embed = new EmbedBuilder()
            .setTitle('Warnings Cleared')
            .setColor('#2ECC71')
            .setDescription(`Semua riwayat peringatan untuk ${user.tag} telah dihapus oleh ${interaction.user.tag}.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

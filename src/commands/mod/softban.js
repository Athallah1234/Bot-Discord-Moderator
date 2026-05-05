import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('softban')
        .setDescription('Kick member dan hapus pesan mereka (Ban lalu langsung Unban)')
        .addUserOption(opt => opt.setName('user').setDescription('User yang ingin di-softban').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Alasan softban')),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Softban';

        try {
            await interaction.guild.members.ban(user.id, { reason, deleteMessageSeconds: 604800 }); // Hapus pesan 7 hari
            await interaction.guild.members.unban(user.id, 'Softban complete');

            client.db.addPunishment(interaction.guildId, user.id, interaction.user.id, 'SOFTBAN', reason);

            const embed = new EmbedBuilder()
                .setTitle('User Softbanned')
                .setColor('#E67E22')
                .setDescription(`${user.tag} telah dikeluarkan dan pesannya dalam 7 hari terakhir telah dihapus.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply({ content: `Gagal softban user: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

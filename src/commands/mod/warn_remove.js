import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('warn_remove')
        .setDescription('Menghapus satu peringatan spesifik berdasarkan ID')
        .addIntegerOption(opt => opt.setName('id').setDescription('ID Warning (lihat di /warnings)').setRequired(true)),
    
    async execute(interaction, client) {
        const warningId = interaction.options.getInteger('id');
        
        // Cek apakah warning ada
        const warning = client.db.db.prepare('SELECT * FROM warnings WHERE id = ? AND guild_id = ?').get(warningId, interaction.guildId);

        if (!warning) {
            return interaction.reply({ content: `Warning dengan ID \`${warningId}\` tidak ditemukan.`, flags: [MessageFlags.Ephemeral] });
        }

        client.db.db.prepare('DELETE FROM warnings WHERE id = ?').run(warningId);

        const embed = new EmbedBuilder()
            .setTitle('Warning Removed')
            .setColor('#2ECC71')
            .setDescription(`Warning ID \`${warningId}\` untuk <@${warning.user_id}> telah dihapus oleh ${interaction.user.tag}.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

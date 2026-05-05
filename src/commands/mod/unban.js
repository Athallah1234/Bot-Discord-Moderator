import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Membuka blokir user dari server')
        .addStringOption(opt => opt.setName('userid').setDescription('ID User yang ingin di-unban').setRequired(true)),
    
    async execute(interaction, client) {
        const userId = interaction.options.getString('userid');

        try {
            await interaction.guild.members.unban(userId);
            
            const embed = new EmbedBuilder()
                .setTitle('User Unbanned')
                .setColor('#2ECC71')
                .setDescription(`User ID \`${userId}\` telah berhasil di-unban.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply({ content: `Gagal meng-unban user. Pastikan ID benar dan user tersebut sedang diban.`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

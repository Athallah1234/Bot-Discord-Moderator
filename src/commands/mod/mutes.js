import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('mutes')
        .setDescription('Menampilkan daftar member yang sedang dalam masa skorsing (timeout)'),
    
    async execute(interaction, client) {
        try {
            const members = await interaction.guild.members.fetch();
            const mutedMembers = members.filter(m => m.isCommunicationDisabled());

            const embed = new EmbedBuilder()
                .setTitle('🔇 Active Timeouts')
                .setColor('#E67E22')
                .setTimestamp();

            if (mutedMembers.size === 0) {
                embed.setDescription('Tidak ada member yang sedang dalam masa skorsing.');
            } else {
                const list = mutedMembers.map(m => `**${m.user.tag}**\nBerakhir: <t:${Math.floor(m.communicationDisabledUntilTimestamp / 1000)}:R>`).join('\n\n');
                embed.setDescription(list);
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply({ content: `Gagal mengambil daftar mutes: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

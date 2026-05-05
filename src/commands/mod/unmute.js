import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Melepas skorsing/timeout dari member')
        .addUserOption(opt => opt.setName('user').setDescription('User yang ingin di-unmute').setRequired(true)),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ content: 'User tidak ditemukan.', flags: [MessageFlags.Ephemeral] });
        if (!member.isCommunicationDisabled()) return interaction.reply({ content: 'User ini sedang tidak dalam skorsing.', flags: [MessageFlags.Ephemeral] });

        await member.timeout(null);

        const embed = new EmbedBuilder()
            .setTitle('User Unmuted')
            .setColor('#2ECC71')
            .setDescription(`${user.tag} telah di-unmute oleh ${interaction.user.tag}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

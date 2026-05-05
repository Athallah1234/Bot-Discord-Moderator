import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Mengeluarkan member dari server')
        .addUserOption(opt => opt.setName('user').setDescription('User yang ingin di-kick').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Alasan kick')),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Tidak ada alasan';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ content: 'User tidak ditemukan di server ini.', flags: [MessageFlags.Ephemeral] });
        if (!member.kickable) return interaction.reply({ content: 'Saya tidak bisa menendang user ini.', flags: [MessageFlags.Ephemeral] });

        await member.kick(reason);
        client.db.addPunishment(interaction.guildId, user.id, interaction.user.id, 'KICK', reason);

        const embed = new EmbedBuilder()
            .setTitle('User Kicked')
            .setColor('#FFA500')
            .addFields(
                { name: 'User', value: `${user.tag}`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Alasan', value: reason }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Give a warning to a member')
        .addUserOption(opt => opt.setName('user').setDescription('The user to warn').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for the warning').setRequired(true)),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        if (user.bot) return interaction.reply({ content: 'You cannot warn bots.', flags: [MessageFlags.Ephemeral] });

        // Add to Database
        client.db.addWarning(interaction.guildId, user.id, interaction.user.id, reason);
        client.db.addPunishment(interaction.guildId, user.id, interaction.user.id, 'WARN', reason);

        const warnings = client.db.getWarnings(interaction.guildId, user.id);
        const warnCount = warnings.length;

        const embed = new EmbedBuilder()
            .setTitle('User Warned')
            .setColor('#FFA500')
            .addFields([
                { name: 'User', value: `${user.tag}`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Warning Count', value: `${warnCount}`, inline: true },
                { name: 'Reason', value: reason }
            ])
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Auto Escalation logic (example: 3 warnings = mute)
        if (warnCount >= 3) {
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            if (member && member.moderatable) {
                await member.timeout(3600000, 'Auto-escalation: 3 warnings reached.'); // 1 hour
                await interaction.followUp({ content: `⚠️ ${user.tag} has been muted for 1 hour due to reaching 3 warnings.` });
            }
        }
    }
};

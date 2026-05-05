import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('mass')
        .setDescription('Execute actions on multiple members at once')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(sub => sub
            .setName('ban')
            .setDescription('Mass ban members by ID')
            .addStringOption(opt => opt.setName('ids').setDescription('User IDs separated by space').setRequired(true))
            .addStringOption(opt => opt.setName('reason').setDescription('Reason for the ban')))
        .addSubcommand(sub => sub
            .setName('kick')
            .setDescription('Mass kick members by ID')
            .addStringOption(opt => opt.setName('ids').setDescription('User IDs separated by space').setRequired(true))
            .addStringOption(opt => opt.setName('reason').setDescription('Reason for the kick')))
        .addSubcommand(sub => sub
            .setName('warn')
            .setDescription('Mass warn members by ID')
            .addStringOption(opt => opt.setName('ids').setDescription('User IDs separated by space').setRequired(true))
            .addStringOption(opt => opt.setName('reason').setDescription('Reason for the warning').setRequired(true))),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const ids = interaction.options.getString('ids').split(/\s+/);
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const results = { success: [], failed: [] };

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        for (const id of ids) {
            try {
                if (subcommand === 'ban') {
                    await interaction.guild.members.ban(id, { reason });
                    results.success.push(id);
                } else if (subcommand === 'kick') {
                    const member = await interaction.guild.members.fetch(id).catch(() => null);
                    if (member && member.kickable) {
                        await member.kick(reason);
                        results.success.push(id);
                    } else {
                        results.failed.push(id);
                    }
                } else if (subcommand === 'warn') {
                    client.db.addWarning(interaction.guildId, id, interaction.user.id, reason);
                    results.success.push(id);
                }
            } catch {
                results.failed.push(id);
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(`Mass ${subcommand.toUpperCase()} Results`)
            .setColor(results.failed.length > 0 ? '#E74C3C' : '#2ECC71')
            .addFields([
                { name: 'Success', value: `\`${results.success.length}\` members`, inline: true },
                { name: 'Failed', value: `\`${results.failed.length}\` members`, inline: true }
            ]);

        if (results.failed.length > 0) {
            embed.addFields([{ name: 'Failed IDs', value: `\`${results.failed.join(', ')}\``.substring(0, 1024) }]);
        }

        await interaction.editReply({ embeds: [embed] });
    }
};

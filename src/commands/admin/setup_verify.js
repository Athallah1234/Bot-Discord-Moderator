import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setup_verify')
        .setDescription('Setup verification system in this channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(opt => opt.setName('role').setDescription('The role to give upon verification').setRequired(true)),
    
    async execute(interaction, client) {
        const role = interaction.options.getRole('role');
        client.db.updateSettings(interaction.guildId, 'verify_role', role.id);

        const embed = new EmbedBuilder()
            .setTitle('Server Verification')
            .setDescription('Click the button below to verify yourself and get access to the server.')
            .setColor('#2ECC71');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('verify_user')
                .setLabel('Verify')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success)
        );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: `✅ Verification system setup with role ${role.name}.`, flags: [MessageFlags.Ephemeral] });
    }
};

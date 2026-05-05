import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configure bot settings for this server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('view')
            .setDescription('View current configuration'))
        .addSubcommand(sub => sub
            .setName('set_logs')
            .setDescription('Set the logging channel')
            .addChannelOption(opt => opt.setName('channel').setDescription('The channel for logs').addChannelTypes(ChannelType.GuildText).setRequired(true)))
        .addSubcommand(sub => sub
            .setName('set_mod_role')
            .setDescription('Set the moderator role')
            .addRoleOption(opt => opt.setName('role').setDescription('The role for moderators').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('toggle_automod')
            .setDescription('Toggle Auto-Moderation features')
            .addBooleanOption(opt => opt.setName('enabled').setDescription('Enable or disable').setRequired(true))),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        if (subcommand === 'view') {
            const settings = client.db.getSettings(guildId);
            const embed = new EmbedBuilder()
                .setTitle(`Config for ${interaction.guild.name}`)
                .setColor('#5865F2')
                .addFields(
                    { name: 'Log Channel', value: settings.log_channel ? `<#${settings.log_channel}>` : 'Not set', inline: true },
                    { name: 'Mod Role', value: settings.mod_role ? `<@&${settings.mod_role}>` : 'Not set', inline: true },
                    { name: 'Auto Mod', value: settings.auto_mod_enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
                    { name: 'Anti-Spam', value: settings.anti_spam ? '✅' : '❌', inline: true },
                    { name: 'Anti-Link', value: settings.anti_link ? '✅' : '❌', inline: true }
                )
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'set_logs') {
            const channel = interaction.options.getChannel('channel');
            client.db.updateSettings(guildId, 'log_channel', channel.id);
            return interaction.reply({ content: `✅ Log channel updated to ${channel}.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'set_mod_role') {
            const role = interaction.options.getRole('role');
            client.db.updateSettings(guildId, 'mod_role', role.id);
            return interaction.reply({ content: `✅ Moderator role updated to ${role.name}.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'toggle_automod') {
            const enabled = interaction.options.getBoolean('enabled');
            client.db.updateSettings(guildId, 'auto_mod_enabled', enabled ? 1 : 0);
            return interaction.reply({ content: `✅ Auto-Moderation is now ${enabled ? 'enabled' : 'disabled'}.`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

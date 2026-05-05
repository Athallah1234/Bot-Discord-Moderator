import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption(opt => opt.setName('user').setDescription('The user to ban').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for the ban'))
        .addIntegerOption(opt => opt.setName('delete_messages').setDescription('Number of days of messages to delete').addChoices(
            { name: 'None', value: 0 },
            { name: '1 Day', value: 1 },
            { name: '7 Days', value: 7 }
        )),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deleteDays = interaction.options.getInteger('delete_messages') || 0;
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (member && !member.bannable) {
            return interaction.reply({ content: 'I cannot ban this user. They might have a higher role than me.', flags: [MessageFlags.Ephemeral] });
        }

        try {
            await interaction.guild.members.ban(user.id, { reason, deleteMessageSeconds: deleteDays * 86400 });
            
            // Log to Database
            client.db.addPunishment(interaction.guildId, user.id, interaction.user.id, 'BAN', reason);

            const embed = new EmbedBuilder()
                .setTitle('User Banned')
                .setColor('#FF0000')
                .addFields([
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Reason', value: reason }
                ])
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Internal Log
            const settings = client.db.getSettings(interaction.guildId);
            if (settings.log_channel) {
                const logChan = interaction.guild.channels.cache.get(settings.log_channel);
                if (logChan) logChan.send({ embeds: [embed] });
            }
        } catch (error) {
            interaction.reply({ content: `Failed to ban user: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

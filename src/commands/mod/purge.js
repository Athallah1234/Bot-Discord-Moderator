import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete multiple messages at once')
        .addIntegerOption(opt => opt.setName('amount').setDescription('Number of messages to delete (1-100)').setMinValue(1).setMaxValue(100).setRequired(true))
        .addUserOption(opt => opt.setName('user').setDescription('Filter messages by user')),
    
    async execute(interaction, client) {
        const amount = interaction.options.getInteger('amount');
        const user = interaction.options.getUser('user');

        let messages = await interaction.channel.messages.fetch({ limit: amount });

        if (user) {
            messages = messages.filter(m => m.author.id === user.id);
        }

        try {
            const deleted = await interaction.channel.bulkDelete(messages, true);
            
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`Successfully deleted **${deleted.size}** messages${user ? ` from ${user.tag}` : ''}.`);

            await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
        } catch (error) {
            interaction.reply({ content: `Failed to delete messages: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

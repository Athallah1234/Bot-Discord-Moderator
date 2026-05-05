import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Manage the ticket system')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('setup')
            .setDescription('Setup ticket system in this channel')
            .addChannelOption(opt => opt.setName('category').setDescription('Category where tickets will be created').addChannelTypes(ChannelType.GuildCategory).setRequired(true))),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'setup') {
            const category = interaction.options.getChannel('category');
            client.db.updateSettings(interaction.guildId, 'ticket_category', category.id);

            const embed = new EmbedBuilder()
                .setTitle('Support Ticket')
                .setDescription('Click the button below to open a support ticket. Our team will assist you shortly.')
                .setColor('#5865F2')
                .setFooter({ text: 'Official Support' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_open')
                    .setLabel('Open Ticket')
                    .setEmoji('📩')
                    .setStyle(ButtonStyle.Primary)
            );

            await interaction.channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: '✅ Ticket system setup complete.', flags: [MessageFlags.Ephemeral] });
        }
    }
};

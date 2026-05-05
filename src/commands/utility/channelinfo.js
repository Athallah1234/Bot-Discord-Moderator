import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('channelinfo')
        .setDescription('Melihat detail informasi sebuah Channel')
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel yang ingin dilihat')),
    
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        const embed = new EmbedBuilder()
            .setTitle(`Channel Info: ${channel.name}`)
            .setColor('#5865F2')
            .addFields(
                { name: 'ID', value: `\`${channel.id}\``, inline: true },
                { name: 'Type', value: `\`${ChannelType[channel.type]}\``, inline: true },
                { name: 'Category', value: `\`${channel.parent ? channel.parent.name : 'None'}\``, inline: true },
                { name: 'Topic', value: `\`${channel.topic || 'No topic set'}\`` },
                { name: 'NSFW', value: `\`${channel.nsfw ? 'Yes' : 'No'}\``, inline: true },
                { name: 'Created At', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

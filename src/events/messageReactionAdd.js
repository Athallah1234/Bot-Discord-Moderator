import { Events, EmbedBuilder } from 'discord.js';

export default {
    name: Events.MessageReactionAdd,
    async execute(reaction, user, client) {
        // Handle partials
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                return;
            }
        }

        const { message, emoji, count } = reaction;
        const guildId = message.guildId;
        if (!guildId) return;

        const starboard = client.db.db.prepare('SELECT * FROM starboard WHERE guild_id = ?').get(guildId);
        if (!starboard) return;

        if (emoji.name === starboard.emoji && count >= starboard.min_count) {
            const starboardChannel = message.guild.channels.cache.get(starboard.channel_id);
            if (!starboardChannel) return;

            // Check if already posted
            const fetchedMessages = await starboardChannel.messages.fetch({ limit: 100 });
            const existing = fetchedMessages.find(m => m.embeds.length > 0 && m.embeds[0].footer?.text.includes(message.id));
            
            const embed = new EmbedBuilder()
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setDescription(message.content || '[Attachment Only]')
                .setColor('#F1C40F')
                .addFields(
                    { name: 'Original', value: `[Jump to message](${message.url})`, inline: true },
                    { name: 'Channel', value: `${message.channel}`, inline: true }
                )
                .setFooter({ text: `Message ID: ${message.id}` })
                .setTimestamp();

            if (message.attachments.size > 0) {
                embed.setImage(message.attachments.first().url);
            }

            if (existing) {
                await existing.edit({ content: `${starboard.emoji} **${count}** | ${message.channel}`, embeds: [embed] });
            } else {
                await starboardChannel.send({ content: `${starboard.emoji} **${count}** | ${message.channel}`, embeds: [embed] });
            }
        }
    }
};

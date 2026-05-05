import { Events, EmbedBuilder } from 'discord.js';

export default {
    name: Events.MessageDelete,
    async execute(message, client) {
        if (message.author?.bot || !message.guild) return;

        const settings = client.db.getSettings(message.guild.id);
        if (!settings.log_channel) return;

        const logChan = message.guild.channels.cache.get(settings.log_channel);
        if (!logChan) return;

        const embed = new EmbedBuilder()
            .setTitle('Message Deleted')
            .setColor('#FF0000')
            .addFields(
                { name: 'Author', value: `${message.author.tag} (${message.author.id})`, inline: true },
                { name: 'Channel', value: `${message.channel}`, inline: true },
                { name: 'Content', value: message.content || '*No content (possibly an embed or image)*' }
            )
            .setTimestamp();

        logChan.send({ embeds: [embed] });
    }
};

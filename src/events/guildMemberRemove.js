import { Events, EmbedBuilder } from 'discord.js';

export default {
    name: Events.GuildMemberRemove,
    async execute(member, client) {
        const settings = client.db.getSettings(member.guild.id);
        
        // Leave Message
        if (settings.leave_enabled && settings.leave_channel && settings.leave_message) {
            const channel = member.guild.channels.cache.get(settings.leave_channel);
            if (channel) {
                const finalMsg = settings.leave_message
                    .replace(/{user}/g, `**${member.user.tag}**`)
                    .replace(/{guild}/g, member.guild.name)
                    .replace(/{memberCount}/g, member.guild.memberCount);

                const embed = new EmbedBuilder()
                    .setTitle(settings.leave_title || 'Member Keluar')
                    .setDescription(finalMsg)
                    .setColor(settings.leave_color || '#FF4757')
                    .setThumbnail(member.user.displayAvatarURL())
                    .setTimestamp();

                await channel.send({ embeds: [embed] }).catch(() => {});
            }
        }
    },
};

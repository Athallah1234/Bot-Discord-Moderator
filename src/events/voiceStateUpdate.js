import { Events, ChannelType, PermissionFlagsBits } from 'discord.js';

export default {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, client) {
        const guildId = newState.guild.id;
        const settings = client.db.getSettings(guildId);
        if (!settings || !settings.pvoice_enabled) return;

        const joinChannelId = settings.pvoice_channel;
        const categoryId = settings.pvoice_category;

        // 1. Logic: Join to Create
        if (newState.channelId === joinChannelId) {
            const member = newState.member;
            
            const channel = await newState.guild.channels.create({
                name: `🔊 ${member.user.username}'s Room`,
                type: ChannelType.GuildVoice,
                parent: categoryId || null,
                permissionOverwrites: [
                    {
                        id: newState.guild.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
                    },
                    {
                        id: member.id,
                        allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers],
                    }
                ]
            });

            await member.voice.setChannel(channel);
            client.db.db.prepare('INSERT INTO private_channels (channel_id, user_id, guild_id) VALUES (?, ?, ?)').run(channel.id, member.id, guildId);
        }

        // 2. Logic: Delete when empty
        if (oldState.channelId) {
            const privateChannel = client.db.db.prepare('SELECT * FROM private_channels WHERE channel_id = ?').get(oldState.channelId);
            if (privateChannel) {
                const channel = oldState.guild.channels.cache.get(oldState.channelId);
                if (channel && channel.members.size === 0) {
                    await channel.delete().catch(() => {});
                    client.db.db.prepare('DELETE FROM private_channels WHERE channel_id = ?').run(oldState.channelId);
                }
            }
        }
    }
};

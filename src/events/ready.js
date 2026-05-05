import { Events, ActivityType } from 'discord.js';

export default {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        client.logger.success(`Logged in as ${client.user.tag}`);
        client.user.setActivity('over servers', { type: ActivityType.Watching });
        
        // Start Managers
        client.giveaways.init();
        client.reminders.init();
        client.announcer.init();
        client.birthdays.init();
        client.streams.init();
        client.tempRoles.init();
        
        client.logger.info(`Serving ${client.guilds.cache.size} servers and ${client.users.cache.size} users.`);
    },
};

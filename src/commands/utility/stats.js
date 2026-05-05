import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import os from 'os';

export default {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View bot statistics'),
    
    async execute(interaction, client) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime % 60);

        const memory = process.memoryUsage().heapUsed / 1024 / 1024;

        const embed = new EmbedBuilder()
            .setTitle('Bot Statistics')
            .setColor('#5865F2')
            .addFields(
                { name: 'Uptime', value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
                { name: 'Memory Usage', value: `${memory.toFixed(2)} MB`, inline: true },
                { name: 'Node.js Version', value: process.version, inline: true },
                { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
                { name: 'Users', value: `${client.users.cache.size}`, inline: true },
                { name: 'CPU', value: `${os.cpus()[0].model}`, inline: false }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import ms from 'ms';

export default {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Melihat sudah berapa lama bot berjalan'),
    
    async execute(interaction, client) {
        const uptime = ms(client.uptime, { long: true });

        const embed = new EmbedBuilder()
            .setTitle('⏳ Bot Uptime')
            .setDescription(`Bot telah berjalan selama:\n**${uptime}**`)
            .setColor('#5865F2')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

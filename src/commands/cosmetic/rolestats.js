import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('role-stats')
        .setDescription('Melihat statistik distribusi role di server'),
    
    async execute(interaction, client) {
        const roles = interaction.guild.roles.cache
            .filter(r => r.name !== '@everyone')
            .sort((a, b) => b.members.size - a.members.size)
            .first(15);

        const embed = new EmbedBuilder()
            .setTitle(`📊 Role Distribution: ${interaction.guild.name}`)
            .setColor('#5865F2')
            .setDescription(roles.map(r => `**${r.name}**: \`${r.members.size} members\``).join('\n'))
            .setFooter({ text: 'Menampilkan 15 role terpopuler' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

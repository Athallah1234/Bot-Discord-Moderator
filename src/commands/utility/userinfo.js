import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Melihat informasi detail seorang user')
        .addUserOption(opt => opt.setName('user').setDescription('User yang ingin dilihat')),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const embed = new EmbedBuilder()
            .setTitle(`User Info: ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setColor(member.displayHexColor || '#5865F2')
            .addFields(
                { name: 'ID', value: `\`${user.id}\``, inline: true },
                { name: 'Nickname', value: `\`${member.nickname || 'None'}\``, inline: true },
                { name: 'Bot?', value: `\`${user.bot ? 'Yes' : 'No'}\``, inline: true },
                { name: 'Akun Dibuat', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Join Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: 'Highest Role', value: `${member.roles.highest}`, inline: true },
                { name: 'Roles', value: member.roles.cache.map(r => r).join(' ').slice(0, 1024) || 'None' }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

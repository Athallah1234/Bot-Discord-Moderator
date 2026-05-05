import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Melihat statistik lengkap server'),
    
    async execute(interaction, client) {
        const guild = interaction.guild;
        const members = guild.members.cache;
        const channels = guild.channels.cache;

        const embed = new EmbedBuilder()
            .setTitle(`Server Info: ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
            .setColor('#5865F2')
            .addFields(
                { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'ID', value: `\`${guild.id}\``, inline: true },
                { name: 'Dibuat Pada', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Members', value: `👤 Total: **${guild.memberCount}**\n🤖 Bots: **${members.filter(m => m.user.bot).size}**`, inline: true },
                { name: 'Channels', value: `💬 Text: **${channels.filter(c => c.type === ChannelType.GuildText).size}**\n🔊 Voice: **${channels.filter(c => c.type === ChannelType.GuildVoice).size}**`, inline: true },
                { name: 'Boosters', value: `🚀 Level: **${guild.premiumTier}**\n✨ Boosts: **${guild.premiumSubscriptionCount}**`, inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

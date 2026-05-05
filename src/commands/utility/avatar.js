import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Melihat foto profil user dalam ukuran penuh')
        .addUserOption(opt => opt.setName('user').setDescription('User yang ingin dilihat avatarnya')),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user') || interaction.user;
        const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

        const embed = new EmbedBuilder()
            .setTitle(`Avatar: ${user.tag}`)
            .setImage(avatarUrl)
            .setColor('#5865F2')
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Download Link')
                .setURL(avatarUrl)
                .setStyle(ButtonStyle.Link)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};

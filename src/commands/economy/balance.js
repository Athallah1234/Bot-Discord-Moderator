import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Melihat jumlah uang di dompet dan bank Anda')
        .addUserOption(opt => opt.setName('user').setDescription('User yang ingin dilihat saldonya')),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user') || interaction.user;
        const guildId = interaction.guildId;

        const data = client.db.db.prepare('SELECT balance, bank FROM users WHERE guild_id = ? AND user_id = ?').get(guildId, user.id);

        const balance = data ? data.balance : 0;
        const bank = data ? data.bank : 0;

        const embed = new EmbedBuilder()
            .setTitle(`💰 Balance: ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .setColor('#2ECC71')
            .addFields(
                { name: '💵 Dompet', value: `\`$${balance.toLocaleString()}\``, inline: true },
                { name: '🏦 Bank', value: `\`$${bank.toLocaleString()}\``, inline: true },
                { name: '📊 Total', value: `\`$${(balance + bank).toLocaleString()}\`` }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('gamble')
        .setDescription('Pertaruhkan uang Anda (Coinflip)')
        .addIntegerOption(opt => opt.setName('amount').setDescription('Jumlah taruhan').setRequired(true).setMinValue(100)),
    
    async execute(interaction, client) {
        const amount = interaction.options.getInteger('amount');
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        const data = client.db.db.prepare('SELECT balance FROM users WHERE guild_id = ? AND user_id = ?').get(guildId, userId);

        if (!data || data.balance < amount) {
            return interaction.reply({ content: 'Saldo dompet Anda tidak cukup untuk taruhan ini.', flags: [MessageFlags.Ephemeral] });
        }

        const win = Math.random() > 0.5;
        const resultAmount = win ? amount : -amount;

        client.db.db.prepare('UPDATE users SET balance = balance + ? WHERE guild_id = ? AND user_id = ?').run(resultAmount, guildId, userId);

        const embed = new EmbedBuilder()
            .setTitle('🎰 Coinflip Results')
            .setDescription(win 
                ? `🎊 Selamat! Anda menang **$${amount.toLocaleString()}**!` 
                : `💀 Aduh! Anda kalah **$${amount.toLocaleString()}**.`)
            .setColor(win ? '#2ECC71' : '#E74C3C')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

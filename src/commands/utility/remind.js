import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import ms from 'ms';

export default {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Mengatur pengingat otomatis')
        .addStringOption(opt => opt.setName('time').setDescription('Waktu (contoh: 1h, 30m, 1d)').setRequired(true))
        .addStringOption(opt => opt.setName('message').setDescription('Pesan pengingat').setRequired(true)),
    
    async execute(interaction, client) {
        const timeStr = interaction.options.getString('time');
        const message = interaction.options.getString('message');
        const duration = ms(timeStr);

        if (!duration) return interaction.reply({ content: 'Format waktu tidak valid (contoh: 1h, 30m, 1d).', flags: [MessageFlags.Ephemeral] });

        const remindAt = new Date(Date.now() + duration).toISOString();

        client.db.db.prepare('INSERT INTO reminders (user_id, channel_id, message, remind_at) VALUES (?, ?, ?, ?)').run(
            interaction.user.id,
            interaction.channelId,
            message,
            remindAt
        );

        await interaction.reply({ content: `✅ Sip! Saya akan mengingatkan Anda tentang **"${message}"** dalam **${timeStr}** (<t:${Math.floor((Date.now() + duration) / 1000)}:R>).`, flags: [MessageFlags.Ephemeral] });
    }
};

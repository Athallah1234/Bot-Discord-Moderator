import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import ms from 'ms';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Membungkam member (Mute)')
        .addUserOption(opt => opt.setName('user').setDescription('User yang ingin di-timeout').setRequired(true))
        .addStringOption(opt => opt.setName('duration').setDescription('Durasi (contoh: 10m, 1h, 1d)').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Alasan timeout')),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'Tidak ada alasan';
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ content: 'User tidak ditemukan.', flags: [MessageFlags.Ephemeral] });
        
        const duration = ms(durationStr);
        if (!duration || duration > 2419200000) { // Max 28 hari
            return interaction.reply({ content: 'Durasi tidak valid (Maksimal 28 hari). Contoh: 10m, 1h, 1d', flags: [MessageFlags.Ephemeral] });
        }

        if (!member.moderatable) return interaction.reply({ content: 'Saya tidak memiliki izin untuk menskors user ini.', flags: [MessageFlags.Ephemeral] });

        await member.timeout(duration, reason);
        client.db.addPunishment(interaction.guildId, user.id, interaction.user.id, 'TIMEOUT', reason, durationStr);

        const embed = new EmbedBuilder()
            .setTitle('User Timed Out')
            .setColor('#E67E22')
            .addFields(
                { name: 'User', value: `${user.tag}`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                { name: 'Durasi', value: durationStr, inline: true },
                { name: 'Alasan', value: reason }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

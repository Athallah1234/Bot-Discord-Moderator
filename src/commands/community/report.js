import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Laporkan member nakal atau bug ke Staff')
        .addStringOption(opt => opt.setName('reason').setDescription('Alasan laporan / Detail bug').setRequired(true))
        .addUserOption(opt => opt.setName('user').setDescription('Member yang ingin dilaporkan (opsional)')),
    
    async execute(interaction, client) {
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const settings = client.db.getSettings(interaction.guildId);

        if (!settings.report_channel) {
            return interaction.reply({ content: 'Sistem laporan belum diatur oleh Admin.', flags: [MessageFlags.Ephemeral] });
        }

        const channel = interaction.guild.channels.cache.get(settings.report_channel);
        if (!channel) return interaction.reply({ content: 'Channel laporan tidak ditemukan.', flags: [MessageFlags.Ephemeral] });

        const embed = new EmbedBuilder()
            .setTitle('🚨 New Report Received')
            .setColor('#E74C3C')
            .addFields(
                { name: 'Reporter', value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true },
                { name: 'Target', value: target ? `${target} (\`${target.id}\`)` : 'None/Bug Report', inline: true },
                { name: 'Reason', value: reason }
            )
            .setTimestamp();

        await channel.send({ embeds: [embed] });

        client.db.db.prepare('INSERT INTO reports (guild_id, user_id, target_id, reason) VALUES (?, ?, ?, ?)').run(
            interaction.guildId, interaction.user.id, target ? target.id : null, reason
        );

        await interaction.reply({ content: '✅ Laporan Anda telah dikirim secara rahasia ke Staff. Terima kasih!', flags: [MessageFlags.Ephemeral] });
    }
};

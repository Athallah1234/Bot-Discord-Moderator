import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Kirim saran untuk kemajuan server')
        .addStringOption(opt => opt.setName('suggestion').setDescription('Isi saran Anda').setRequired(true)),
    
    async execute(interaction, client) {
        const suggestion = interaction.options.getString('suggestion');
        const settings = client.db.getSettings(interaction.guildId);

        if (!settings.suggest_channel) {
            return interaction.reply({ content: 'Sistem saran belum diatur oleh Admin.', flags: [MessageFlags.Ephemeral] });
        }

        const channel = interaction.guild.channels.cache.get(settings.suggest_channel);
        if (!channel) return interaction.reply({ content: 'Channel saran tidak ditemukan.', flags: [MessageFlags.Ephemeral] });

        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setTitle('💡 New Suggestion')
            .setDescription(suggestion)
            .setColor('#F1C40F')
            .setFooter({ text: `User ID: ${interaction.user.id}` })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('suggest_up').setLabel('Setuju (0)').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('suggest_down').setLabel('Tidak Setuju (0)').setStyle(ButtonStyle.Danger)
        );

        const msg = await channel.send({ embeds: [embed], components: [row] });
        
        client.db.db.prepare('INSERT INTO suggestions (guild_id, user_id, message_id, suggestion) VALUES (?, ?, ?, ?)').run(
            interaction.guildId, interaction.user.id, msg.id, suggestion
        );

        await interaction.reply({ content: '✅ Saran Anda telah terkirim!', flags: [MessageFlags.Ephemeral] });
    }
};

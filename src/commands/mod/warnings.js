import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Melihat riwayat peringatan (warnings) user')
        .addUserOption(opt => opt.setName('user').setDescription('User yang ingin dilihat').setRequired(true)),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const warnings = client.db.getWarnings(interaction.guildId, user.id);

        if (warnings.length === 0) {
            return interaction.reply({ content: `✅ ${user.tag} tidak memiliki riwayat peringatan.`, flags: [MessageFlags.Ephemeral] });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Warnings: ${user.tag}`)
            .setColor('#F1C40F')
            .setThumbnail(user.displayAvatarURL())
            .setDescription(warnings.map((w, i) => `**#${i + 1}** | Mod: <@${w.mod_id}>\nReason: \`${w.reason}\`\nDate: <t:${Math.floor(new Date(w.timestamp).getTime() / 1000)}:R>`).join('\n\n'))
            .setFooter({ text: `Total: ${warnings.length} Warnings` });

        await interaction.reply({ embeds: [embed] });
    }
};

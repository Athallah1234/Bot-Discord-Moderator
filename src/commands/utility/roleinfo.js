import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('roleinfo')
        .setDescription('Melihat detail informasi sebuah Role')
        .addRoleOption(opt => opt.setName('role').setDescription('Role yang ingin dilihat').setRequired(true)),
    
    async execute(interaction, client) {
        const role = interaction.options.getRole('role');

        const embed = new EmbedBuilder()
            .setTitle(`Role Info: ${role.name}`)
            .setColor(role.hexColor)
            .addFields(
                { name: 'ID', value: `\`${role.id}\``, inline: true },
                { name: 'Color', value: `\`${role.hexColor}\``, inline: true },
                { name: 'Position', value: `\`${role.position}\``, inline: true },
                { name: 'Mentionable', value: `\`${role.mentionable ? 'Yes' : 'No'}\``, inline: true },
                { name: 'Hoisted', value: `\`${role.hoist ? 'Yes' : 'No'}\``, inline: true },
                { name: 'Members', value: `\`${role.members.size}\``, inline: true },
                { name: 'Dibuat Pada', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>` }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import ms from 'ms';

export default {
    data: new SlashCommandBuilder()
        .setName('temp-role')
        .setDescription('Berikan role sementara ke member')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt => opt.setName('user').setDescription('Target member').setRequired(true))
        .addRoleOption(opt => opt.setName('role').setDescription('Role yang diberikan').setRequired(true))
        .addStringOption(opt => opt.setName('duration').setDescription('Durasi (misal: 1h, 1d, 30m)').setRequired(true)),
    
    async execute(interaction, client) {
        const target = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');
        const durationStr = interaction.options.getString('duration');
        const durationMs = ms(durationStr);

        if (!durationMs) return interaction.reply({ content: 'Format durasi tidak valid!', flags: [MessageFlags.Ephemeral] });

        const endAt = new Date(Date.now() + durationMs).toISOString().replace('T', ' ').replace('Z', '');

        await target.roles.add(role);
        
        client.db.db.prepare('INSERT INTO temp_roles (guild_id, user_id, role_id, ends_at) VALUES (?, ?, ?, ?)').run(
            interaction.guildId, target.id, role.id, endAt
        );

        await interaction.reply({ content: `✅ **${target.user.username}** telah diberikan role **${role.name}** selama **${durationStr}**.` });
    }
};

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('vmod')
        .setDescription('Voice moderation commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
        .addSubcommand(sub => sub
            .setName('mute')
            .setDescription('Mute a member in voice channel')
            .addUserOption(opt => opt.setName('user').setDescription('The user to mute').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('unmute')
            .setDescription('Unmute a member in voice channel')
            .addUserOption(opt => opt.setName('user').setDescription('The user to unmute').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('deafen')
            .setDescription('Deafen a member in voice channel')
            .addUserOption(opt => opt.setName('user').setDescription('The user to deafen').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('undeafen')
            .setDescription('Undeafen a member in voice channel')
            .addUserOption(opt => opt.setName('user').setDescription('The user to undeafen').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('kick')
            .setDescription('Kick a member from voice channel')
            .addUserOption(opt => opt.setName('user').setDescription('The user to kick').setRequired(true))),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member || !member.voice.channel) {
            return interaction.reply({ content: 'User tidak sedang berada di voice channel.', flags: [MessageFlags.Ephemeral] });
        }

        try {
            switch (subcommand) {
                case 'mute':
                    await member.voice.setMute(true);
                    break;
                case 'unmute':
                    await member.voice.setMute(false);
                    break;
                case 'deafen':
                    await member.voice.setDeaf(true);
                    break;
                case 'undeafen':
                    await member.voice.setDeaf(false);
                    break;
                case 'kick':
                    await member.voice.disconnect();
                    break;
            }

            await interaction.reply({ content: `✅ Berhasil melakukan **${subcommand}** pada ${user.tag}.`, flags: [MessageFlags.Ephemeral] });
        } catch (error) {
            await interaction.reply({ content: `❌ Gagal: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

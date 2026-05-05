import { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('massnick_reset')
        .setDescription('Mereset nickname SELURUH member di server (Extreme Action)'),
    
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'Hanya Administrator yang bisa melakukan reset nickname massal.', flags: [MessageFlags.Ephemeral] });
        }

        await interaction.deferReply();
        const members = await interaction.guild.members.fetch();
        let count = 0;

        for (const [id, member] of members) {
            try {
                if (member.nickname && member.manageable) {
                    await member.setNickname(null);
                    count++;
                }
            } catch { continue; }
        }

        const embed = new EmbedBuilder()
            .setTitle('👤 Global Nickname Reset')
            .setColor('#3498DB')
            .setDescription(`Berhasil mereset nickname **${count}** member server.`)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};

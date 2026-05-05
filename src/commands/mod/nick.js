import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('nick')
        .setDescription('Mengubah nickname member')
        .addUserOption(opt => opt.setName('user').setDescription('User yang ingin diubah').setRequired(true))
        .addStringOption(opt => opt.setName('nickname').setDescription('Nickname baru (kosongkan untuk reset)')),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const nickname = interaction.options.getString('nickname');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ content: 'User tidak ditemukan.', flags: [MessageFlags.Ephemeral] });
        if (!member.manageable) return interaction.reply({ content: 'Saya tidak bisa mengubah nickname user ini.', flags: [MessageFlags.Ephemeral] });

        try {
            await member.setNickname(nickname);
            
            const embed = new EmbedBuilder()
                .setTitle('👤 Nickname Updated')
                .setColor('#3498DB')
                .setDescription(`Nickname ${user.tag} telah diubah menjadi **${nickname || 'Reset'}** oleh ${interaction.user.tag}.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply({ content: `Gagal mengubah nickname: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

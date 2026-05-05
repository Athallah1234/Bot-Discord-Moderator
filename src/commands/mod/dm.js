import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Mengirim pesan DM kepada user dari bot')
        .addUserOption(opt => opt.setName('user').setDescription('User yang ingin di-DM').setRequired(true))
        .addStringOption(opt => opt.setName('message').setDescription('Pesan yang ingin dikirim').setRequired(true)),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const message = interaction.options.getString('message');

        if (user.bot) return interaction.reply({ content: 'Anda tidak bisa mengirim DM ke bot.', flags: [MessageFlags.Ephemeral] });

        try {
            const embed = new EmbedBuilder()
                .setTitle(`Pesan dari Staff ${interaction.guild.name}`)
                .setDescription(message)
                .setColor('#5865F2')
                .setFooter({ text: `Dikirim oleh: ${interaction.user.tag}` })
                .setTimestamp();

            await user.send({ embeds: [embed] });
            
            await interaction.reply({ content: `✅ Berhasil mengirim DM ke ${user.tag}`, flags: [MessageFlags.Ephemeral] });
        } catch (error) {
            interaction.reply({ content: `Gagal mengirim DM ke user ini. Mungkin mereka menutup DM mereka.`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

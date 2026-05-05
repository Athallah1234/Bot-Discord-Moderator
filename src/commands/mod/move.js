import { SlashCommandBuilder, EmbedBuilder, MessageFlags, ChannelType } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Memindahkan member ke Voice Channel lain')
        .addUserOption(opt => opt.setName('user').setDescription('Member yang ingin dipindah').setRequired(true))
        .addChannelOption(opt => opt.setName('channel').setDescription('Voice Channel tujuan').addChannelTypes(ChannelType.GuildVoice).setRequired(true)),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const channel = interaction.options.getChannel('channel');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member || !member.voice.channel) {
            return interaction.reply({ content: 'User tersebut tidak sedang berada di Voice Channel.', flags: [MessageFlags.Ephemeral] });
        }

        try {
            await member.voice.setChannel(channel);
            
            const embed = new EmbedBuilder()
                .setTitle('🔊 Member Moved')
                .setColor('#3498DB')
                .setDescription(`${user.tag} telah dipindahkan ke channel **${channel.name}** oleh ${interaction.user.tag}.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply({ content: `Gagal memindahkan member: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

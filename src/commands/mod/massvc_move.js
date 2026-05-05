import { SlashCommandBuilder, EmbedBuilder, MessageFlags, ChannelType } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('massvc_move')
        .setDescription('Memindahkan semua orang di satu VC ke VC lain')
        .addChannelOption(opt => opt.setName('from').setDescription('Channel asal').addChannelTypes(ChannelType.GuildVoice).setRequired(true))
        .addChannelOption(opt => opt.setName('to').setDescription('Channel tujuan').addChannelTypes(ChannelType.GuildVoice).setRequired(true)),
    
    async execute(interaction, client) {
        const from = interaction.options.getChannel('from');
        const to = interaction.options.getChannel('to');

        await interaction.deferReply();
        let count = 0;

        for (const [id, member] of from.members) {
            try {
                await member.voice.setChannel(to);
                count++;
            } catch { continue; }
        }

        const embed = new EmbedBuilder()
            .setTitle('🔊 Mass Voice Move')
            .setColor('#3498DB')
            .setDescription(`Berhasil memindahkan **${count}** member dari ${from} ke ${to}.`)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};

import { SlashCommandBuilder, EmbedBuilder, MessageFlags, ChannelType } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('massvc_mute')
        .setDescription('Membungkam suara semua orang di satu VC sekaligus')
        .addChannelOption(opt => opt.setName('channel').setDescription('Voice Channel tujuan').addChannelTypes(ChannelType.GuildVoice).setRequired(true))
        .addBooleanOption(opt => opt.setName('mute').setDescription('Mute (True) atau Unmute (False)').setRequired(true)),
    
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');
        const mute = interaction.options.getBoolean('mute');

        await interaction.deferReply();
        let count = 0;

        for (const [id, member] of channel.members) {
            try {
                await member.voice.setMute(mute);
                count++;
            } catch { continue; }
        }

        const embed = new EmbedBuilder()
            .setTitle(mute ? '🔇 Mass Voice Muted' : '🔊 Mass Voice Unmuted')
            .setColor(mute ? '#E74C3C' : '#2ECC71')
            .setDescription(`Berhasil ${mute ? 'membungkam' : 'melepas suara'} **${count}** member di ${channel}.`)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};

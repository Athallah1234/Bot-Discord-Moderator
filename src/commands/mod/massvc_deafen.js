import { SlashCommandBuilder, EmbedBuilder, MessageFlags, ChannelType } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('massvc_deafen')
        .setDescription('Menulikan pendengaran semua orang di satu VC sekaligus')
        .addChannelOption(opt => opt.setName('channel').setDescription('Voice Channel tujuan').addChannelTypes(ChannelType.GuildVoice).setRequired(true))
        .addBooleanOption(opt => opt.setName('deafen').setDescription('Deafen (True) atau Undeafen (False)').setRequired(true)),
    
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');
        const deafen = interaction.options.getBoolean('deafen');

        await interaction.deferReply();
        let count = 0;

        for (const [id, member] of channel.members) {
            try {
                await member.voice.setDeaf(deafen);
                count++;
            } catch { continue; }
        }

        const embed = new EmbedBuilder()
            .setTitle(deafen ? '🔇 Mass Voice Deafened' : '🔊 Mass Voice Undeafened')
            .setColor(deafen ? '#E74C3C' : '#2ECC71')
            .setDescription(`Berhasil ${deafen ? 'menulikan' : 'melepas tuli'} **${count}** member di ${channel}.`)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};

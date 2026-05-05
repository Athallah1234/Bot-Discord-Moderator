import { SlashCommandBuilder, EmbedBuilder, MessageFlags, ChannelType } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('massvc_kick')
        .setDescription('Mengeluarkan semua orang dari sebuah Voice Channel')
        .addChannelOption(opt => opt.setName('channel').setDescription('Voice Channel yang ingin dikosongkan').addChannelTypes(ChannelType.GuildVoice).setRequired(true)),
    
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');

        await interaction.deferReply();
        let count = 0;

        for (const [id, member] of channel.members) {
            try {
                await member.voice.disconnect();
                count++;
            } catch { continue; }
        }

        const embed = new EmbedBuilder()
            .setTitle('🔇 Mass Voice Kick')
            .setColor('#E74C3C')
            .setDescription(`Berhasil mengeluarkan **${count}** member dari ${channel}.`)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};

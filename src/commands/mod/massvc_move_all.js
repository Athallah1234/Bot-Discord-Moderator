import { SlashCommandBuilder, EmbedBuilder, MessageFlags, ChannelType, PermissionFlagsBits } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('massvc_move_all')
        .setDescription('Memindahkan SEMUA orang dari SEMUA VC ke satu channel (Rally)')
        .addChannelOption(opt => opt.setName('to').setDescription('Voice Channel tujuan').addChannelTypes(ChannelType.GuildVoice).setRequired(true)),
    
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
            return interaction.reply({ content: 'Anda butuh izin `Move Members` untuk melakukan Rally.', flags: [MessageFlags.Ephemeral] });
        }

        const to = interaction.options.getChannel('to');
        await interaction.deferReply();
        
        let count = 0;
        const voiceChannels = interaction.guild.channels.cache.filter(ch => ch.type === ChannelType.GuildVoice && ch.id !== to.id);

        for (const [chId, channel] of voiceChannels) {
            for (const [mId, member] of channel.members) {
                try {
                    await member.voice.setChannel(to);
                    count++;
                } catch { continue; }
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('📣 Server Rally Complete')
            .setColor('#F1C40F')
            .setDescription(`Berhasil memindahkan **${count}** member dari seluruh VC ke ${to}.`)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};

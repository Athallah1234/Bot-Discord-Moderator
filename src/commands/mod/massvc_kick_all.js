import { SlashCommandBuilder, EmbedBuilder, MessageFlags, ChannelType, PermissionFlagsBits } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('massvc_kick_all')
        .setDescription('Mengeluarkan SEMUA orang dari SELURUH Voice Channel di server'),
    
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'Hanya Administrator yang bisa mengosongkan seluruh VC server.', flags: [MessageFlags.Ephemeral] });
        }

        await interaction.deferReply();
        let count = 0;
        const voiceChannels = interaction.guild.channels.cache.filter(ch => ch.type === ChannelType.GuildVoice);

        for (const [chId, channel] of voiceChannels) {
            for (const [mId, member] of channel.members) {
                try {
                    await member.voice.disconnect();
                    count++;
                } catch { continue; }
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('🔇 Global Voice Kick')
            .setColor('#E74C3C')
            .setDescription(`Berhasil mengeluarkan **${count}** member dari seluruh Voice Channel server.`)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};

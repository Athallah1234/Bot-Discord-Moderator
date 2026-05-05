import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Menghapus semua pesan di channel ini (Re-create channel)'),
    
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: 'Anda butuh izin `Manage Channels` untuk melakukan ini.', flags: [MessageFlags.Ephemeral] });
        }

        try {
            const channel = interaction.channel;
            const position = channel.position;
            const newChannel = await channel.clone();
            
            await channel.delete();
            await newChannel.setPosition(position);

            const embed = new EmbedBuilder()
                .setTitle('☢️ Channel Nuked')
                .setDescription('Channel ini telah dibersihkan secara total.')
                .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Y4eXgxZ3d4Z3d4Z3d4Z3d4Z3d4Z3d4Z3d4Z3d4Z3d4Z3d4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/HhTXt43pk1I1W/giphy.gif')
                .setColor('#FF0000')
                .setTimestamp();

            await newChannel.send({ embeds: [embed] });
        } catch (error) {
            interaction.reply({ content: `Gagal melakukan nuke: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

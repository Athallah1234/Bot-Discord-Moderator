import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('hide')
        .setDescription('Menyembunyikan channel dari role @everyone'),
    
    async execute(interaction, client) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                ViewChannel: false
            });

            const embed = new EmbedBuilder()
                .setTitle('👻 Channel Hidden')
                .setDescription(`Channel ini sekarang disembunyikan dari member biasa.`)
                .setColor('#34495E');

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply({ content: `Gagal menyembunyikan channel: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

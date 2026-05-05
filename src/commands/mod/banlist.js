import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('banlist')
        .setDescription('Menampilkan daftar user yang diblokir'),
    
    async execute(interaction, client) {
        try {
            const bans = await interaction.guild.bans.fetch({ limit: 10 });
            
            const embed = new EmbedBuilder()
                .setTitle('🚫 Server Ban List')
                .setColor('#FF0000')
                .setTimestamp();

            if (bans.size === 0) {
                embed.setDescription('Tidak ada user yang sedang diblokir di server ini.');
            } else {
                const list = bans.map(ban => `**${ban.user.tag}** (\`${ban.user.id}\`)\nReason: \`${ban.reason || 'No reason'}\``).join('\n\n');
                embed.setDescription(list + (bans.size >= 10 ? '\n\n*Menampilkan 10 data pertama...*' : ''));
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply({ content: `Gagal mengambil daftar ban: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

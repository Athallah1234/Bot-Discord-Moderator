import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('modlog')
        .setDescription('Melihat riwayat hukuman lengkap seorang user')
        .addUserOption(opt => opt.setName('user').setDescription('User yang ingin dilihat').setRequired(true)),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        
        // Ambil data punishments dari database
        const logs = client.db.db.prepare('SELECT * FROM punishments WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC LIMIT 10').all(interaction.guildId, user.id);

        if (logs.length === 0) {
            return interaction.reply({ content: `User ${user.tag} belum memiliki riwayat hukuman.`, flags: [MessageFlags.Ephemeral] });
        }

        const embed = new EmbedBuilder()
            .setTitle(`ModLogs: ${user.tag}`)
            .setColor('#2C3E50')
            .setThumbnail(user.displayAvatarURL())
            .setDescription(logs.map((log, i) => 
                `**[${log.type}]** | Mod: <@${log.mod_id}>\nReason: \`${log.reason}\`${log.duration ? `\nDuration: \`${log.duration}\`` : ''}\nDate: <t:${Math.floor(new Date(log.timestamp).getTime() / 1000)}:R>`
            ).join('\n\n'))
            .setFooter({ text: 'Menampilkan 10 riwayat terbaru' });

        await interaction.reply({ embeds: [embed] });
    }
};

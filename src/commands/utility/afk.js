import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Mengatur status AFK Anda')
        .addStringOption(opt => opt.setName('reason').setDescription('Alasan AFK')),
    
    async execute(interaction, client) {
        const reason = interaction.options.getString('reason') || 'No reason';
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        client.db.db.prepare('INSERT OR REPLACE INTO afk (guild_id, user_id, reason) VALUES (?, ?, ?)').run(guildId, userId, reason);

        await interaction.reply({ content: `✅ Anda sekarang AFK: **${reason}**. Saya akan memberitahu siapa pun yang men-tag Anda.`, flags: [MessageFlags.Ephemeral] });
    }
};

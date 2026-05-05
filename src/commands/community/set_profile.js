import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('set-profile')
        .setDescription('Mengatur informasi profil sosial Anda')
        .addStringOption(opt => opt.setName('bio').setDescription('Bio singkat Anda (max 200 karakter)').setMaxLength(200))
        .addStringOption(opt => opt.setName('github').setDescription('Link profil GitHub'))
        .addStringOption(opt => opt.setName('twitter').setDescription('Link profil Twitter/X'))
        .addStringOption(opt => opt.setName('youtube').setDescription('Link channel YouTube')),
    
    async execute(interaction, client) {
        const bio = interaction.options.getString('bio');
        const github = interaction.options.getString('github');
        const twitter = interaction.options.getString('twitter');
        const youtube = interaction.options.getString('youtube');
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        // Ensure user exists in DB
        client.db.db.prepare('INSERT OR IGNORE INTO users (guild_id, user_id) VALUES (?, ?)').run(guildId, userId);

        if (bio) client.db.db.prepare('UPDATE users SET bio = ? WHERE guild_id = ? AND user_id = ?').run(bio, guildId, userId);
        if (github) client.db.db.prepare('UPDATE users SET github = ? WHERE guild_id = ? AND user_id = ?').run(github, guildId, userId);
        if (twitter) client.db.db.prepare('UPDATE users SET twitter = ? WHERE guild_id = ? AND user_id = ?').run(twitter, guildId, userId);
        if (youtube) client.db.db.prepare('UPDATE users SET youtube = ? WHERE guild_id = ? AND user_id = ?').run(youtube, guildId, userId);

        await interaction.reply({ content: '✅ Profil sosial Anda berhasil diperbarui!', flags: [MessageFlags.Ephemeral] });
    }
};

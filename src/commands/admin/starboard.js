import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('starboard')
        .setDescription('Mengatur sistem Starboard (Hall of Fame)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel tujuan Starboard').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addStringOption(opt => opt.setName('emoji').setDescription('Emoji yang digunakan (default: ⭐)'))
        .addIntegerOption(opt => opt.setName('count').setDescription('Minimal reaksi untuk masuk (default: 3)')),
    
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');
        const emoji = interaction.options.getString('emoji') || '⭐';
        const count = interaction.options.getInteger('count') || 3;
        const guildId = interaction.guildId;

        client.db.db.prepare(`
            INSERT INTO starboard (guild_id, channel_id, emoji, min_count) 
            VALUES (?, ?, ?, ?)
            ON CONFLICT(guild_id) DO UPDATE SET 
            channel_id = ?, emoji = ?, min_count = ?
        `).run(guildId, channel.id, emoji, count, channel.id, emoji, count);

        await interaction.reply({ content: `✅ Starboard berhasil diatur!\n📍 Channel: ${channel}\n✨ Emoji: ${emoji}\n🔢 Min Reaksi: **${count}**`, flags: [MessageFlags.Ephemeral] });
    }
};

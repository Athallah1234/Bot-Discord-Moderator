import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('autoresponder')
        .setDescription('Mengelola respon otomatis bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('add')
            .setDescription('Tambah respon otomatis')
            .addStringOption(opt => opt.setName('trigger').setDescription('Kata kunci pemicu').setRequired(true))
            .addStringOption(opt => opt.setName('response').setDescription('Balasan bot').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('remove')
            .setDescription('Hapus respon otomatis')
            .addStringOption(opt => opt.setName('trigger').setDescription('Kata kunci yang ingin dihapus').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('list')
            .setDescription('Lihat daftar respon otomatis')),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        if (subcommand === 'add') {
            const trigger = interaction.options.getString('trigger').toLowerCase();
            const response = interaction.options.getString('response');

            client.db.db.prepare(`
                INSERT INTO auto_responders (guild_id, trigger, response) 
                VALUES (?, ?, ?)
                ON CONFLICT(guild_id, trigger) DO UPDATE SET response = ?
            `).run(guildId, trigger, response, response);

            return interaction.reply({ content: `✅ Berhasil menambahkan auto-responder untuk kata kunci: \`${trigger}\`.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'remove') {
            const trigger = interaction.options.getString('trigger').toLowerCase();
            client.db.db.prepare('DELETE FROM auto_responders WHERE guild_id = ? AND trigger = ?').run(guildId, trigger);
            return interaction.reply({ content: `✅ Auto-responder untuk \`${trigger}\` telah dihapus.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'list') {
            const list = client.db.db.prepare('SELECT * FROM auto_responders WHERE guild_id = ?').all(guildId);
            if (list.length === 0) return interaction.reply({ content: 'Belum ada auto-responder di server ini.', flags: [MessageFlags.Ephemeral] });

            const embed = new EmbedBuilder()
                .setTitle('🤖 Auto-Responder List')
                .setColor('#5865F2')
                .setDescription(list.map(r => `**Trigger:** \`${r.trigger}\`\n**Response:** ${r.response}`).join('\n\n'))
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed] });
        }
    }
};

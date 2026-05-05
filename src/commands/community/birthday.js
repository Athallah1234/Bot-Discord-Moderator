import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('birthday')
        .setDescription('Mengatur tanggal ulang tahun Anda')
        .addSubcommand(sub => sub
            .setName('set')
            .setDescription('Set tanggal ulang tahun')
            .addIntegerOption(opt => opt.setName('day').setDescription('Tanggal (1-31)').setRequired(true).setMinValue(1).setMaxValue(31))
            .addIntegerOption(opt => opt.setName('month').setDescription('Bulan (1-12)').setRequired(true).setMinValue(1).setMaxValue(12)))
        .addSubcommand(sub => sub
            .setName('remove')
            .setDescription('Hapus data ulang tahun Anda'))
        .addSubcommand(sub => sub
            .setName('list')
            .setDescription('Lihat siapa yang ulang tahun bulan ini')),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        if (subcommand === 'set') {
            const day = interaction.options.getInteger('day');
            const month = interaction.options.getInteger('month');

            client.db.db.prepare('INSERT OR REPLACE INTO birthdays (guild_id, user_id, day, month) VALUES (?, ?, ?, ?)').run(
                guildId, userId, day, month
            );

            return interaction.reply({ content: `✅ Ulang tahun Anda telah di-set ke tanggal **${day}/${month}**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'remove') {
            client.db.db.prepare('DELETE FROM birthdays WHERE guild_id = ? AND user_id = ?').run(guildId, userId);
            return interaction.reply({ content: '✅ Data ulang tahun Anda telah dihapus.', flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'list') {
            const currentMonth = new Date().getMonth() + 1;
            const bdays = client.db.db.prepare('SELECT * FROM birthdays WHERE guild_id = ? AND month = ? ORDER BY day ASC').all(guildId, currentMonth);

            if (bdays.length === 0) return interaction.reply({ content: 'Tidak ada yang berulang tahun bulan ini.', flags: [MessageFlags.Ephemeral] });

            const embed = new EmbedBuilder()
                .setTitle(`🎂 Birthdays in Month ${currentMonth}`)
                .setColor('#FF69B4')
                .setDescription(bdays.map(b => `**${b.day}** - <@${b.user_id}>`).join('\n'))
                .setTimestamp();
            
            return interaction.reply({ embeds: [embed] });
        }
    }
};

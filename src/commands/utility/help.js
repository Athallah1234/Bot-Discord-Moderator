import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ComponentType } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Menampilkan menu bantuan bot'),
    
    async execute(interaction, client) {
        const categories = [...new Set(client.commands.map(cmd => cmd.category))];
        
        const mainEmbed = new EmbedBuilder()
            .setTitle('📚 Bot Help Menu')
            .setDescription('Selamat datang di menu bantuan! Silakan pilih kategori dari dropdown di bawah untuk melihat daftar perintah yang tersedia.')
            .setColor('#5865F2')
            .addFields([
                { name: '🤖 Total Kategori', value: `${categories.length}`, inline: true },
                { name: '📜 Total Perintah', value: `${client.commands.size}`, inline: true }
            ])
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({ text: 'Gunakan select menu di bawah untuk navigasi' });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_category')
            .setPlaceholder('Pilih Kategori Bantuan...')
            .addOptions(categories.map(cat => ({
                label: cat.charAt(0).toUpperCase() + cat.slice(1),
                value: cat,
                emoji: getEmoji(cat),
                description: `Lihat semua perintah kategori ${cat}`
            })));

        const row = new ActionRowBuilder().addComponents(selectMenu);
        const response = await interaction.reply({ embeds: [mainEmbed], components: [row] });

        const collector = response.createMessageComponentCollector({ 
            time: 300000 // 5 Menit
        });

        let currentCategory = '';
        let currentPage = 0;
        const itemsPerPage = 10;

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: 'Hanya pengirim command yang bisa menggunakan menu ini.', flags: [MessageFlags.Ephemeral] });
            }

            if (i.isStringSelectMenu()) {
                currentCategory = i.values[0];
                currentPage = 0;
            } else if (i.isButton()) {
                if (i.customId === 'help_prev') currentPage--;
                if (i.customId === 'help_next') currentPage++;
            }

            const commands = client.commands.filter(cmd => cmd.category === currentCategory).map(cmd => cmd);
            const totalPages = Math.max(1, Math.ceil(commands.length / itemsPerPage));
            
            const start = currentPage * itemsPerPage;
            const end = start + itemsPerPage;
            const pagedCommands = commands.slice(start, end);

            const categoryEmbed = new EmbedBuilder()
                .setTitle(`${getEmoji(currentCategory)} Kategori: ${currentCategory.toUpperCase()}`)
                .setDescription(`Berikut adalah daftar perintah dalam kategori ini (Halaman ${currentPage + 1}/${totalPages}):`)
                .setColor('#5865F2')
                .addFields(pagedCommands.map(cmd => ({
                    name: `\`/${cmd.data.name}\``,
                    value: cmd.data.description || 'Tidak ada deskripsi',
                    inline: true
                })))
                .setFooter({ text: `Total ${commands.length} perintah | Halaman ${currentPage + 1}/${totalPages}` });

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('help_prev')
                    .setEmoji('⬅️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('help_next')
                    .setEmoji('➡️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === totalPages - 1 || totalPages === 0)
            );

            await i.update({ embeds: [categoryEmbed], components: [row, buttons] });
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                selectMenu.setDisabled(true).setPlaceholder('Menu Bantuan Berakhir')
            );
            interaction.editReply({ components: [disabledRow] }).catch(() => {});
        });
    }
};

function getEmoji(category) {
    const emojis = {
        admin: '⚙️',
        mod: '🔨',
        utility: '🛠️',
        fun: '🎮',
        leveling: '📈',
        community: '👥',
        economy: '💰',
        cosmetic: '✨'
    };
    return emojis[category.toLowerCase()] || '📂';
}

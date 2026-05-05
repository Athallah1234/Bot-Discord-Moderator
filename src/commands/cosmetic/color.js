import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('color')
        .setDescription('Mengubah warna nama Anda'),
    
    async execute(interaction, client) {
        const guildId = interaction.guildId;
        const colors = client.db.db.prepare('SELECT * FROM color_roles WHERE guild_id = ?').all(guildId);

        if (colors.length === 0) return interaction.reply({ content: 'Belum ada daftar warna yang disediakan oleh Admin.', flags: [MessageFlags.Ephemeral] });

        const embed = new EmbedBuilder()
            .setTitle('🎨 Name Color Picker')
            .setDescription('Pilih warna favorit Anda dari menu di bawah ini untuk mengubah warna nama Anda di server!')
            .setColor('#5865F2')
            .setTimestamp();

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_color')
            .setPlaceholder('Pilih warna Anda...')
            .addOptions(colors.map(c => ({
                label: c.name,
                value: c.role_id,
                description: `ID: ${c.role_id}`
            })));

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({ embeds: [embed], components: [row], flags: [MessageFlags.Ephemeral] });
    }
};

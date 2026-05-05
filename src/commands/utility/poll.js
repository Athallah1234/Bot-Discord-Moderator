import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Membuat voting interaktif')
        .addStringOption(opt => opt.setName('question').setDescription('Pertanyaan voting').setRequired(true))
        .addStringOption(opt => opt.setName('options').setDescription('Pilihan dipisahkan dengan koma (maks 5)').setRequired(true)),
    
    async execute(interaction, client) {
        const question = interaction.options.getString('question');
        const optionsStr = interaction.options.getString('options');
        const options = optionsStr.split(',').map(o => o.trim()).slice(0, 5);

        if (options.length < 2) return interaction.reply({ content: 'Minimal harus ada 2 pilihan.', flags: [MessageFlags.Ephemeral] });

        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
        const description = options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n\n');

        const embed = new EmbedBuilder()
            .setTitle(`📊 Voting: ${question}`)
            .setDescription(description)
            .setColor('#5865F2')
            .setFooter({ text: `Dibuat oleh: ${interaction.user.tag}` })
            .setTimestamp();

        const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

        for (let i = 0; i < options.length; i++) {
            await msg.react(emojis[i]);
        }
    }
};

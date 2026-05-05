import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';

export default {
    modOnly: true,
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Menambah atau menghapus role dari member')
        .addUserOption(opt => opt.setName('user').setDescription('User yang dituju').setRequired(true))
        .addRoleOption(opt => opt.setName('role').setDescription('Role yang ingin dikelola').setRequired(true)),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) return interaction.reply({ content: 'User tidak ditemukan.', flags: [MessageFlags.Ephemeral] });
        
        // Cek apakah bot memiliki izin untuk mengelola role tersebut
        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ content: 'Saya tidak bisa mengelola role ini karena posisinya lebih tinggi atau sama dengan role saya.', flags: [MessageFlags.Ephemeral] });
        }

        try {
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role);
                const embed = new EmbedBuilder()
                    .setTitle('🎭 Role Removed')
                    .setColor('#E74C3C')
                    .setDescription(`Role ${role} telah dihapus dari ${user.tag}.`)
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
            } else {
                await member.roles.add(role);
                const embed = new EmbedBuilder()
                    .setTitle('🎭 Role Added')
                    .setColor('#2ECC71')
                    .setDescription(`Role ${role} telah ditambahkan ke ${user.tag}.`)
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            interaction.reply({ content: `Gagal mengelola role: ${error.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};

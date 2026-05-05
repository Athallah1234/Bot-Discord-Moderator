import { SlashCommandBuilder, MessageFlags, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('voice')
        .setDescription('Mengatur channel Voice pribadi Anda')
        .addSubcommand(sub => sub.setName('lock').setDescription('Mengunci channel Anda'))
        .addSubcommand(sub => sub.setName('unlock').setDescription('Membuka kunci channel Anda'))
        .addSubcommand(sub => sub.setName('name').setDescription('Mengubah nama channel').addStringOption(opt => opt.setName('new_name').setDescription('Nama baru').setRequired(true)))
        .addSubcommand(sub => sub.setName('limit').setDescription('Mengatur batas member').addIntegerOption(opt => opt.setName('count').setDescription('Jumlah maksimal (0 untuk no limit)').setRequired(true).setMinValue(0).setMaxValue(99)))
        .addSubcommand(sub => sub.setName('permit').setDescription('Memberi izin member tertentu').addUserOption(opt => opt.setName('user').setDescription('User yang diizinkan').setRequired(true)))
        .addSubcommand(sub => sub.setName('reject').setDescription('Mengusir/Blokir member tertentu').addUserOption(opt => opt.setName('user').setDescription('User yang ditendang').setRequired(true)))
        .addSubcommand(sub => sub.setName('claim').setDescription('Mengklaim kepemilikan channel jika Owner sudah keluar'))
        .addSubcommand(sub => sub.setName('transfer').setDescription('Memindahkan kepemilikan channel ke orang lain').addUserOption(opt => opt.setName('user').setDescription('User penerima').setRequired(true)))
        .addSubcommand(sub => sub.setName('bitrate').setDescription('Mengatur kualitas audio (kbps)').addIntegerOption(opt => opt.setName('value').setDescription('Bitrate (8-96)').setRequired(true).setMinValue(8).setMaxValue(96)))
        .addSubcommand(sub => sub.setName('hide').setDescription('Menyembunyikan channel dari daftar'))
        .addSubcommand(sub => sub.setName('show').setDescription('Menampilkan kembali channel ke daftar'))
        .addSubcommand(sub => sub.setName('info').setDescription('Melihat detail informasi channel')),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const member = interaction.member;
        const voiceChannel = member.voice.channel;
        const guildId = interaction.guildId;

        if (!voiceChannel) return interaction.reply({ content: 'Anda harus berada di Voice Channel untuk menggunakan perintah ini.', flags: [MessageFlags.Ephemeral] });

        // Logic for CLAIM (doesn't require being the owner)
        if (subcommand === 'claim') {
            const currentOwnerData = client.db.db.prepare('SELECT * FROM private_channels WHERE channel_id = ?').get(voiceChannel.id);
            if (!currentOwnerData) return interaction.reply({ content: 'Ini bukan Voice Channel pribadi.', flags: [MessageFlags.Ephemeral] });

            const ownerInVc = voiceChannel.members.has(currentOwnerData.user_id);
            if (ownerInVc) return interaction.reply({ content: 'Owner asli masih berada di dalam channel.', flags: [MessageFlags.Ephemeral] });

            client.db.db.prepare('UPDATE private_channels SET user_id = ? WHERE channel_id = ?').run(member.id, voiceChannel.id);
            await voiceChannel.permissionOverwrites.edit(member.id, { ManageChannels: true, MoveMembers: true, MuteMembers: true });
            return interaction.reply({ content: `👑 Selamat! Anda sekarang adalah **Owner** baru dari channel ini.` });
        }

        // Other subcommands REQUIRE being the owner
        const privateChannel = client.db.db.prepare('SELECT * FROM private_channels WHERE channel_id = ? AND user_id = ?').get(voiceChannel.id, member.id);
        if (!privateChannel) return interaction.reply({ content: 'Hanya **Owner** channel yang bisa menggunakan perintah ini.', flags: [MessageFlags.Ephemeral] });

        if (subcommand === 'lock') {
            await voiceChannel.permissionOverwrites.edit(interaction.guild.id, { Connect: false });
            return interaction.reply({ content: '🔒 Channel Anda sekarang **Terkunci**.', flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'unlock') {
            await voiceChannel.permissionOverwrites.edit(interaction.guild.id, { Connect: true });
            return interaction.reply({ content: '🔓 Channel Anda sekarang **Terbuka**.', flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'name') {
            const newName = interaction.options.getString('new_name');
            await voiceChannel.setName(`🔊 ${newName}`);
            return interaction.reply({ content: `✅ Nama channel diubah menjadi: **${newName}**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'limit') {
            const count = interaction.options.getInteger('count');
            await voiceChannel.setUserLimit(count);
            return interaction.reply({ content: `✅ Batas member diatur ke: **${count}**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'permit') {
            const target = interaction.options.getUser('user');
            await voiceChannel.permissionOverwrites.edit(target.id, { Connect: true, ViewChannel: true });
            return interaction.reply({ content: `✅ ${target} diizinkan masuk.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'reject') {
            const target = interaction.options.getMember('user');
            await voiceChannel.permissionOverwrites.edit(target.id, { Connect: false });
            if (target.voice.channelId === voiceChannel.id) await target.voice.disconnect();
            return interaction.reply({ content: `❌ ${target} diblokir.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'transfer') {
            const target = interaction.options.getMember('user');
            if (!voiceChannel.members.has(target.id)) return interaction.reply({ content: 'Target harus berada di dalam channel yang sama.', flags: [MessageFlags.Ephemeral] });
            
            client.db.db.prepare('UPDATE private_channels SET user_id = ? WHERE channel_id = ?').run(target.id, voiceChannel.id);
            await voiceChannel.permissionOverwrites.edit(target.id, { ManageChannels: true, MoveMembers: true });
            await voiceChannel.permissionOverwrites.edit(member.id, { ManageChannels: null, MoveMembers: null });
            
            return interaction.reply({ content: `👑 Kepemilikan channel telah dipindahkan ke ${target}.` });
        }

        if (subcommand === 'bitrate') {
            const val = interaction.options.getInteger('value');
            await voiceChannel.setBitrate(val * 1000);
            return interaction.reply({ content: `🔊 Bitrate diatur ke **${val} kbps**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'hide') {
            await voiceChannel.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: false });
            return interaction.reply({ content: `👻 Channel Anda sekarang **Tersembunyi**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'show') {
            await voiceChannel.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: true });
            return interaction.reply({ content: `👀 Channel Anda sekarang **Terlihat**.`, flags: [MessageFlags.Ephemeral] });
        }

        if (subcommand === 'info') {
            const embed = new EmbedBuilder()
                .setTitle('🔊 Private Voice Info')
                .setColor('#5865F2')
                .addFields(
                    { name: 'Owner', value: `<@${privateChannel.user_id}>`, inline: true },
                    { name: 'Channel Name', value: `\`${voiceChannel.name}\``, inline: true },
                    { name: 'User Limit', value: `\`${voiceChannel.userLimit || 'No Limit'}\``, inline: true },
                    { name: 'Bitrate', value: `\`${voiceChannel.bitrate / 1000} kbps\``, inline: true }
                )
                .setTimestamp();
            return interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
        }
    }
};

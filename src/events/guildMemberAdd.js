import { Events, EmbedBuilder } from 'discord.js';

export default {
    name: Events.GuildMemberAdd,
    async execute(member, client) {
        const settings = client.db.getSettings(member.guild.id);
        
        // Anti-Alt Check
        if (settings.min_account_age > 0) {
            const minAgeMs = settings.min_account_age * 24 * 60 * 60 * 1000;
            const accountAgeMs = Date.now() - member.user.createdTimestamp;

            if (accountAgeMs < minAgeMs) {
                try {
                    const embed = new EmbedBuilder()
                        .setTitle('🛡️ Security: Anti-Alt Protection')
                        .setDescription(`Anda telah dikeluarkan dari **${member.guild.name}** karena usia akun Anda terlalu baru.\nMinimal usia akun: **${settings.min_account_age} hari**.`)
                        .setColor('#FF0000')
                        .setTimestamp();

                    await member.send({ embeds: [embed] }).catch(() => {});
                    await member.kick('Security: Anti-Alt Protection');
                    
                    // Log to modlog if possible (Optional, but good for auditing)
                    client.logger.info(`[Anti-Alt] Kicked ${member.user.tag} (Age: ${Math.floor(accountAgeMs / (1000 * 60 * 60 * 24))} days)`);
                    return;
                } catch (error) {
                    client.logger.error(`Error in Anti-Alt kick: ${error.message}`);
                }
            }
        }

        // Welcome Message (Channel)
        if (settings.welcome_enabled && settings.welcome_channel && settings.welcome_message) {
            const channel = member.guild.channels.cache.get(settings.welcome_channel);
            if (channel) {
                const finalMsg = settings.welcome_message
                    .replace(/{user}/g, `<@${member.id}>`)
                    .replace(/{guild}/g, member.guild.name)
                    .replace(/{memberCount}/g, member.guild.memberCount);

                const embed = new EmbedBuilder()
                    .setTitle(settings.welcome_title || 'Selamat Datang!')
                    .setDescription(finalMsg)
                    .setColor(settings.welcome_color || '#2ECC71')
                    .setThumbnail(member.user.displayAvatarURL())
                    .setTimestamp();

                await channel.send({ embeds: [embed] }).catch(() => {});
            }
        }

        // Welcome DM
        if (settings.welcome_dm_enabled && settings.welcome_dm_message) {
            const finalMsg = settings.welcome_dm_message
                .replace(/{user}/g, member.user.username)
                .replace(/{guild}/g, member.guild.name)
                .replace(/{memberCount}/g, member.guild.memberCount);

            const dmEmbed = new EmbedBuilder()
                .setTitle(`Pesan Sambutan dari ${member.guild.name}`)
                .setDescription(finalMsg)
                .setColor(settings.welcome_color || '#2ECC71')
                .setTimestamp();

            await member.send({ embeds: [dmEmbed] }).catch(() => {});
        }

        // Auto Role
        if (settings.auto_role) {
            const role = member.guild.roles.cache.get(settings.auto_role);
            if (role) {
                await member.roles.add(role).catch(() => {});
            }
        }
    },
};

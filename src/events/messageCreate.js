import { Events, EmbedBuilder } from 'discord.js';

const messageCounts = new Map();

export default {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const userId = message.author.id;
        const settings = client.db.getSettings(guildId);
        if (!settings) return;

        // 1. AFK Logic
        await this.handleAFK(message, client);

        // 2. Leveling System
        if (settings.leveling_enabled) {
            this.handleLeveling(message, client);
        }

        // 3. Auto Moderation
        if (settings.auto_mod_enabled) {
            await this.handleAutoMod(message, client, settings);
        }

        // 4. Auto Responder Logic
        await this.handleAutoResponder(message, client);
    },

    async handleLeveling(message, client) {
        const guildId = message.guild.id;
        const userId = message.author.id;

        // Check Bypass
        const isBypassed = client.db.db.prepare('SELECT * FROM level_bypass WHERE channel_id = ?').get(message.channel.id);
        if (isBypassed) return;

        // Better-sqlite3 upsert for users
        client.db.db.prepare(`
            INSERT INTO users (guild_id, user_id, xp, level, last_msg) 
            VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP)
            ON CONFLICT(guild_id, user_id) DO UPDATE SET 
            xp = xp + ?, 
            last_msg = CURRENT_TIMESTAMP
            WHERE last_msg < datetime('now', '-1 minute')
        `).run(guildId, userId, Math.floor(Math.random() * 10) + 15, Math.floor(Math.random() * 10) + 15);

        // Check for level up
        const userData = client.db.db.prepare('SELECT xp, level FROM users WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
        const nextLevel = (userData.level + 1) * 500; // Simple curve

        if (userData.xp >= nextLevel) {
            const newLevel = userData.level + 1;
            client.db.db.prepare('UPDATE users SET level = ? WHERE guild_id = ? AND user_id = ?').run(newLevel, guildId, userId);
            
            // Check for Role Rewards
            const reward = client.db.db.prepare('SELECT role_id FROM level_rewards WHERE level = ?').get(newLevel);
            if (reward) {
                const role = message.guild.roles.cache.get(reward.role_id);
                if (role) {
                    await message.member.roles.add(role).catch(() => {});
                    message.channel.send(`🎊 GG <@${userId}>! Anda naik ke **Level ${newLevel}** dan mendapatkan role **${role.name}**!`);
                }
            } else {
                message.channel.send(`🎊 GG <@${userId}>! Anda baru saja naik ke **Level ${newLevel}**!`);
            }
        }
    },

    async handleAutoMod(message, client, settings) {
        const content = message.content;
        const lowercaseContent = content.toLowerCase();
        
        // 0. Whitelist Check
        const whitelistedRoles = client.db.db.prepare("SELECT target_id FROM security_whitelist WHERE guild_id = ? AND type = 'ROLE'").all(message.guild.id).map(r => r.target_id);
        const whitelistedChannel = client.db.db.prepare("SELECT target_id FROM security_whitelist WHERE guild_id = ? AND target_id = ? AND type = 'CHANNEL'").get(message.guild.id, message.channel.id);
        
        if (whitelistedChannel || message.member.roles.cache.some(r => whitelistedRoles.includes(r.id)) || message.member.permissions.has('ManageMessages')) return;

        // 1. Anti-Invite
        if (settings.anti_invite) {
            if (content.includes('discord.gg/') || content.includes('discord.com/invite/')) {
                await message.delete().catch(() => {});
                return message.channel.send(`❌ <@${message.author.id}>, link undangan tidak diperbolehkan!`).then(m => setTimeout(() => m.delete(), 3000));
            }
        }

        // 2. Bad Words
        const badWords = client.db.db.prepare('SELECT word FROM bad_words WHERE guild_id = ?').all(message.guild.id);
        for (const bw of badWords) {
            if (lowercaseContent.includes(bw.word)) {
                await message.delete().catch(() => {});
                return message.channel.send(`❌ <@${message.author.id}>, pesan Anda mengandung kata terlarang!`).then(m => setTimeout(() => m.delete(), 3000));
            }
        }

        // 3. Anti-Caps
        if (settings.anti_caps_limit > 0 && content.length > 10) {
            const capsCount = content.replace(/[^A-Z]/g, "").length;
            const capsPercentage = (capsCount / content.length) * 100;
            if (capsPercentage > settings.anti_caps_limit) {
                await message.delete().catch(() => {});
                return message.channel.send(`❌ <@${message.author.id}>, jangan gunakan terlalu banyak huruf KAPITAL!`).then(m => setTimeout(() => m.delete(), 3000));
            }
        }

        // 4. Anti-Mention
        if (settings.anti_mention_limit > 0) {
            const mentionCount = message.mentions.users.size + message.mentions.roles.size;
            if (mentionCount > settings.anti_mention_limit) {
                await message.delete().catch(() => {});
                return message.channel.send(`❌ <@${message.author.id}>, Anda melakukan terlalu banyak mention!`).then(m => setTimeout(() => m.delete(), 3000));
            }
        }

        // 5. Anti-Spam (Configurable)
        if (settings.anti_spam_limit > 0) {
            const authorId = message.author.id;
            const now = Date.now();
            const lastMessages = client.cooldowns.get(`spam_${authorId}`) || [];
            const filteredMessages = lastMessages.filter(timestamp => now - timestamp < 5000);
            
            filteredMessages.push(now);
            client.cooldowns.set(`spam_${authorId}`, filteredMessages);

            if (filteredMessages.length > settings.anti_spam_limit) {
                await message.delete().catch(() => {});
                if (filteredMessages.length === settings.anti_spam_limit + 1) {
                    await message.member.timeout(60000, 'Anti-Spam Protection');
                    return message.channel.send(`❌ <@${authorId}> telah di-timeout selama 1 menit karena spamming.`);
                }
                return;
            }
        }

        // 6. Anti-Link (Generic)
        if (settings.anti_link) {
            const linkRegex = /(https?:\/\/[^\s]+)/g;
            if (linkRegex.test(lowercaseContent)) {
                await message.delete().catch(() => {});
                return message.channel.send(`❌ <@${message.author.id}>, link tidak diperbolehkan!`).then(m => setTimeout(() => m.delete(), 3000));
            }
        }
    },

    async handleAFK(message, client) {
        const guildId = message.guild.id;
        const userId = message.author.id;

        // 1. Check if the user is returning from AFK
        const afkData = client.db.db.prepare('SELECT * FROM afk WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
        if (afkData) {
            client.db.db.prepare('DELETE FROM afk WHERE guild_id = ? AND user_id = ?').run(guildId, userId);
            message.reply(`Selamat datang kembali <@${userId}>! Status AFK Anda telah dihapus.`).then(m => setTimeout(() => m.delete(), 5000));
        }

        // 2. Check if a mentioned user is AFK
        if (message.mentions.users.size > 0) {
            message.mentions.users.forEach(user => {
                const mentionAfk = client.db.db.prepare('SELECT * FROM afk WHERE guild_id = ? AND user_id = ?').get(guildId, user.id);
                if (mentionAfk) {
                    message.reply(`${user.username} sedang AFK: **${mentionAfk.reason}** (<t:${Math.floor(new Date(mentionAfk.timestamp).getTime() / 1000)}:R>)`).then(m => setTimeout(() => m.delete(), 7000));
                }
            });
        }
    },

    async handleAutoResponder(message, client) {
        const guildId = message.guild.id;
        const content = message.content.toLowerCase();

        const responders = client.db.db.prepare('SELECT * FROM auto_responders WHERE guild_id = ?').all(guildId);
        
        for (const res of responders) {
            if (content === res.trigger.toLowerCase()) {
                return message.channel.send(res.response);
            }
        }
    }
};

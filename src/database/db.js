import Database from 'better-sqlite3';
import { join } from 'path';
import fs from 'fs';

class DatabaseManager {
    constructor(client) {
        this.client = client;
        const dbPath = process.env.DATABASE_PATH || './src/data/database.sqlite';
        
        // Ensure directory exists
        const dbDir = dbPath.substring(0, dbPath.lastIndexOf('/'));
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        this.db = new Database(dbPath);
        this.init();
    }

    init() {
        // Settings Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS settings (
                guild_id TEXT PRIMARY KEY,
                log_channel TEXT,
                mod_role TEXT,
                admin_role TEXT,
                ticket_category TEXT,
                ticket_logs TEXT,
                verify_role TEXT,
                auto_mod_enabled INTEGER DEFAULT 1,
                anti_spam INTEGER DEFAULT 1,
                anti_link INTEGER DEFAULT 1,
                anti_badwords INTEGER DEFAULT 1,
                welcome_channel TEXT,
                leveling_enabled INTEGER DEFAULT 1
            )
        `).run();

        // Warnings Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS warnings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT,
                user_id TEXT,
                mod_id TEXT,
                reason TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        // Punishments Table (Ban/Kick/Mute history)
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS punishments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT,
                user_id TEXT,
                mod_id TEXT,
                type TEXT, -- BAN, KICK, MUTE, WARN
                reason TEXT,
                duration TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        // Tickets Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT,
                channel_id TEXT,
                user_id TEXT,
                status TEXT DEFAULT 'OPEN',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        // Leveling Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS users (
                guild_id TEXT,
                user_id TEXT,
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 0,
                last_msg DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (guild_id, user_id)
            )
        `).run();

        // Blacklist Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS blacklist (
                user_id TEXT PRIMARY KEY,
                reason TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        // Giveaways Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS giveaways (
                message_id TEXT PRIMARY KEY,
                guild_id TEXT,
                channel_id TEXT,
                prize TEXT,
                winner_count INTEGER,
                ends_at DATETIME,
                status TEXT DEFAULT 'OPEN'
            )
        `).run();

        // Giveaway Entries
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS giveaway_entries (
                message_id TEXT,
                user_id TEXT,
                PRIMARY KEY (message_id, user_id)
            )
        `).run();

        // Level Rewards
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS level_rewards (
                level INTEGER PRIMARY KEY,
                role_id TEXT
            )
        `).run();

        // Level Bypass Channels
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS level_bypass (
                channel_id TEXT PRIMARY KEY
            )
        `).run();

        // Reaction Roles (Modern Select Menu Roles)
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS reaction_roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT,
                message_id TEXT,
                role_id TEXT,
                label TEXT
            )
        `).run();

        // Bad Words Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS bad_words (
                guild_id TEXT,
                word TEXT,
                PRIMARY KEY (guild_id, word)
            )
        `).run();

        // Security Whitelist
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS security_whitelist (
                guild_id TEXT,
                target_id TEXT,
                type TEXT, -- 'ROLE' or 'CHANNEL'
                PRIMARY KEY (guild_id, target_id)
            )
        `).run();

        // Update settings table with advanced security columns
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN anti_spam_limit INTEGER DEFAULT 5').run(); } catch {}
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN anti_caps_limit INTEGER DEFAULT 0').run(); } catch {}
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN anti_mention_limit INTEGER DEFAULT 0').run(); } catch {}

        // Update users table with Economy columns
        try { this.db.prepare('ALTER TABLE users ADD COLUMN balance INTEGER DEFAULT 0').run(); } catch {}
        try { this.db.prepare('ALTER TABLE users ADD COLUMN bank INTEGER DEFAULT 0').run(); } catch {}
        try { this.db.prepare('ALTER TABLE users ADD COLUMN last_daily DATETIME').run(); } catch {}
        try { this.db.prepare('ALTER TABLE users ADD COLUMN last_work DATETIME').run(); } catch {}
        try { this.db.prepare('ALTER TABLE users ADD COLUMN last_beg DATETIME').run(); } catch {}
        try { this.db.prepare('ALTER TABLE users ADD COLUMN bio TEXT DEFAULT "No bio set."').run(); } catch {}
        try { this.db.prepare('ALTER TABLE users ADD COLUMN github TEXT').run(); } catch {}
        try { this.db.prepare('ALTER TABLE users ADD COLUMN twitter TEXT').run(); } catch {}
        try { this.db.prepare('ALTER TABLE users ADD COLUMN youtube TEXT').run(); } catch {}

        // Update settings table with Welcomer & Leave columns
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN welcome_enabled INTEGER DEFAULT 0').run(); } catch {}
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN welcome_channel TEXT').run(); } catch {}
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN welcome_message TEXT').run(); } catch {}
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN leave_enabled INTEGER DEFAULT 0').run(); } catch {}
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN leave_channel TEXT').run(); } catch {}
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN leave_message TEXT').run(); } catch {}

        // Advanced Welcomer & Leave columns
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN welcome_dm_enabled INTEGER DEFAULT 0').run(); } catch {}
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN welcome_dm_message TEXT').run(); } catch {}
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN welcome_color TEXT DEFAULT "#2ECC71"').run(); } catch {}
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN welcome_title TEXT DEFAULT "Selamat Datang!"').run(); } catch {}
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN leave_color TEXT DEFAULT "#FF4757"').run(); } catch {}
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN leave_title TEXT DEFAULT "Member Keluar"').run(); } catch {}
        try { this.db.prepare('ALTER TABLE inventory ADD COLUMN item_id INTEGER').run(); } catch {}

        // Community Settings
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN suggest_channel TEXT').run(); } catch {}
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN report_channel TEXT').run(); } catch {}
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN birthday_channel TEXT').run(); } catch {}

        // Server Events Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS server_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT,
                creator_id TEXT,
                name TEXT,
                description TEXT,
                start_time DATETIME,
                channel_id TEXT,
                message_id TEXT
            )
        `).run();

        // Event RSVPs Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS event_rsvps (
                event_id INTEGER,
                user_id TEXT,
                PRIMARY KEY (event_id, user_id)
            )
        `).run();

        // Temp Roles Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS temp_roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT,
                user_id TEXT,
                role_id TEXT,
                ends_at DATETIME
            )
        `).run();

        // AFK Table
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN auto_role TEXT').run(); } catch {}

        // Starboard Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS starboard (
                guild_id TEXT PRIMARY KEY,
                channel_id TEXT,
                emoji TEXT DEFAULT '⭐',
                min_count INTEGER DEFAULT 3
            )
        `).run();

        // Announcements Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS announcements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT,
                channel_id TEXT,
                message TEXT,
                interval_ms INTEGER,
                last_sent DATETIME
            )
        `).run();

        // Private Voice Settings
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN pvoice_enabled INTEGER DEFAULT 0').run(); } catch {}
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN pvoice_channel TEXT').run(); } catch {}
        try { this.db.prepare('ALTER TABLE settings ADD COLUMN pvoice_category TEXT').run(); } catch {}

        // Private Channels Tracking Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS private_channels (
                channel_id TEXT PRIMARY KEY,
                user_id TEXT,
                guild_id TEXT
            )
        `).run();

        // Reminders Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS reminders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                channel_id TEXT,
                message TEXT,
                remind_at DATETIME
            )
        `).run();

        // AFK Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS afk (
                guild_id TEXT,
                user_id TEXT,
                reason TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (guild_id, user_id)
            )
        `).run();

        // Auto Responders Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS auto_responders (
                guild_id TEXT,
                trigger TEXT,
                response TEXT,
                PRIMARY KEY (guild_id, trigger)
            )
        `).run();

        // Shop Items Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS shop_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT,
                name TEXT,
                price INTEGER,
                role_id TEXT
            )
        `).run();

        // User Inventory Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS inventory (
                guild_id TEXT,
                user_id TEXT,
                item_id INTEGER,
                PRIMARY KEY (guild_id, user_id, item_id)
            )
        `).run();

        try { this.db.prepare('ALTER TABLE birthdays ADD COLUMN month INTEGER').run(); } catch {}

        // Stream Notifications Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS stream_notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT,
                discord_channel TEXT,
                platform TEXT, -- 'YOUTUBE' or 'TWITCH'
                target_id TEXT, -- Channel ID or Username
                last_id TEXT -- Last video ID or Stream Status
            )
        `).run();

        try { this.db.prepare('ALTER TABLE birthdays ADD COLUMN month INTEGER').run(); } catch {}

        // Color Roles Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS color_roles (
                guild_id TEXT,
                role_id TEXT,
                name TEXT,
                PRIMARY KEY (guild_id, role_id)
            )
        `).run();

        // User Badges Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS user_badges (
                guild_id TEXT,
                user_id TEXT,
                badge_emoji TEXT,
                badge_name TEXT,
                PRIMARY KEY (guild_id, user_id, badge_name)
            )
        `).run();

        // Suggestions Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS suggestions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT,
                user_id TEXT,
                message_id TEXT,
                suggestion TEXT,
                status TEXT DEFAULT 'PENDING'
            )
        `).run();

        // Reports Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT,
                user_id TEXT,
                target_id TEXT,
                reason TEXT,
                status TEXT DEFAULT 'OPEN'
            )
        `).run();

        // Birthdays Table
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS birthdays (
                guild_id TEXT,
                user_id TEXT,
                day INTEGER,
                month INTEGER,
                PRIMARY KEY (guild_id, user_id)
            )
        `).run();

        console.log('Database initialized successfully.');
    }

    // Helper methods
    getSettings(guildId) {
        let settings = this.db.prepare('SELECT * FROM settings WHERE guild_id = ?').get(guildId);
        if (!settings) {
            this.db.prepare('INSERT INTO settings (guild_id) VALUES (?)').run(guildId);
            settings = this.db.prepare('SELECT * FROM settings WHERE guild_id = ?').get(guildId);
        }
        return settings;
    }

    updateSettings(guildId, key, value) {
        this.db.prepare(`UPDATE settings SET ${key} = ? WHERE guild_id = ?`).run(value, guildId);
    }

    addWarning(guildId, userId, modId, reason) {
        return this.db.prepare('INSERT INTO warnings (guild_id, user_id, mod_id, reason) VALUES (?, ?, ?, ?)').run(guildId, userId, modId, reason);
    }

    getWarnings(guildId, userId) {
        return this.db.prepare('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC').all(guildId, userId);
    }

    clearWarnings(guildId, userId) {
        return this.db.prepare('DELETE FROM warnings WHERE guild_id = ? AND user_id = ?').run(guildId, userId);
    }

    addPunishment(guildId, userId, modId, type, reason, duration = null) {
        return this.db.prepare('INSERT INTO punishments (guild_id, user_id, mod_id, type, reason, duration) VALUES (?, ?, ?, ?, ?, ?)').run(guildId, userId, modId, type, reason, duration);
    }
}

export default DatabaseManager;

import { Client, GatewayIntentBits, Partials, Collection, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import DatabaseManager from '../database/db.js';
import GiveawayManager from '../utils/giveawayManager.js';
import ReminderManager from '../utils/reminderManager.js';
import AnnouncerManager from '../utils/announcerManager.js';
import BirthdayManager from '../utils/birthdayManager.js';
import StreamManager from '../utils/streamManager.js';
import TempRoleManager from '../utils/tempRoleManager.js';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class BotClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.DirectMessages
            ],
            partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User]
        });

        this.commands = new Collection();
        this.cooldowns = new Collection();
        this.db = new DatabaseManager(this);
        this.giveaways = new GiveawayManager(this);
        this.reminders = new ReminderManager(this);
        this.announcer = new AnnouncerManager(this);
        this.birthdays = new BirthdayManager(this);
        this.streams = new StreamManager(this);
        this.tempRoles = new TempRoleManager(this);
        this.logger = logger;
    }

    async init() {
        await this.loadEvents();
        await this.loadCommands();
        
        this.login(process.env.DISCORD_TOKEN).catch(err => {
            this.logger.error(`Failed to login: ${err.message}`);
        });

        // Global Error Handling
        process.on('unhandledRejection', (reason, promise) => {
            this.logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
        });

        process.on('uncaughtException', (err) => {
            this.logger.error(`Uncaught Exception: ${err.message}`);
        });
    }

    async loadEvents() {
        const eventsPath = path.join(__dirname, '../events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = pathToFileURL(path.join(eventsPath, file)).href;
            const { default: event } = await import(filePath);
            if (event.once) {
                this.once(event.name, (...args) => event.execute(...args, this));
            } else {
                this.on(event.name, (...args) => event.execute(...args, this));
            }
        }
        this.logger.success(`Loaded ${eventFiles.length} events.`);
    }

    async loadCommands() {
        const commandsPath = path.join(__dirname, '../commands');
        const categories = fs.readdirSync(commandsPath);

        const slashCommands = [];

        for (const category of categories) {
            const categoryPath = path.join(commandsPath, category);
            if (!fs.statSync(categoryPath).isDirectory()) continue;

            const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = pathToFileURL(path.join(categoryPath, file)).href;
                const { default: command } = await import(filePath);

                if (command && command.data) {
                    command.category = category;
                    this.commands.set(command.data.name, command);
                    slashCommands.push(command.data.toJSON());
                }
            }
        }

        this.logger.success(`Loaded ${this.commands.size} commands.`);
        
        if (process.env.DISCORD_TOKEN) {
            this.deployCommands(slashCommands);
        }
    }

    async deployCommands(commands) {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

        try {
            this.logger.info('Started refreshing application (/) commands.');

            if (process.env.GUILD_ID) {
                await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                    { body: commands },
                );
                this.logger.success('Successfully reloaded application (/) commands (Guild).');
            } else {
                await rest.put(
                    Routes.applicationCommands(process.env.CLIENT_ID),
                    { body: commands },
                );
                this.logger.success('Successfully reloaded application (/) commands (Global).');
            }
        } catch (error) {
            this.logger.error(`Error deploying commands: ${error.message}`);
        }
    }
}

export default BotClient;

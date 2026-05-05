import Parser from 'rss-parser';
import { EmbedBuilder } from 'discord.js';

const parser = new Parser();

class StreamManager {
    constructor(client) {
        this.client = client;
        this.twitchToken = null;
    }

    init() {
        // Cek setiap 10 menit
        setInterval(() => this.checkUpdates(), 10 * 60 * 1000);
        this.checkUpdates();
    }

    async checkUpdates() {
        const monitors = this.client.db.db.prepare('SELECT * FROM stream_notifications').all();

        for (const mon of monitors) {
            if (mon.platform === 'YOUTUBE') {
                await this.checkYouTube(mon);
            } else if (mon.platform === 'TWITCH') {
                await this.checkTwitch(mon);
            } else if (mon.platform === 'REDDIT') {
                await this.checkReddit(mon);
            } else if (mon.platform === 'GITHUB') {
                await this.checkGitHub(mon);
            }
        }
    }

    async checkYouTube(mon) {
        try {
            const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${mon.target_id}`;
            const feed = await parser.parseURL(feedUrl);
            if (feed.items.length > 0) {
                const latestVideo = feed.items[0];
                const videoId = latestVideo.id.split(':').pop();
                if (videoId !== mon.last_id) {
                    const channel = await this.client.channels.fetch(mon.discord_channel).catch(() => null);
                    if (channel) {
                        const embed = new EmbedBuilder()
                            .setTitle('🎥 New YouTube Video!')
                            .setURL(latestVideo.link)
                            .setDescription(`**${latestVideo.title}**\n\n${feed.title} baru saja upload!`)
                            .setColor('#FF0000')
                            .setThumbnail(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)
                            .setTimestamp();
                        await channel.send({ content: `🔔 **${feed.title}** baru saja upload!`, embeds: [embed] });
                    }
                    this.client.db.db.prepare('UPDATE stream_notifications SET last_id = ? WHERE id = ?').run(videoId, mon.id);
                }
            }
        } catch (error) {}
    }

    async checkTwitch(mon) {
        const clientId = process.env.TWITCH_CLIENT_ID;
        const clientSecret = process.env.TWITCH_CLIENT_SECRET;
        if (!clientId || !clientSecret) return;
        try {
            if (!this.twitchToken) {
                const authRes = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, { method: 'POST' });
                const authData = await authRes.json();
                this.twitchToken = authData.access_token;
            }
            const res = await fetch(`https://api.twitch.tv/helix/streams?user_login=${mon.target_id}`, {
                headers: { 'Client-ID': clientId, 'Authorization': `Bearer ${this.twitchToken}` }
            });
            const data = await res.json();
            const stream = data.data && data.data[0];
            if (stream) {
                if (mon.last_id !== stream.id) {
                    const channel = await this.client.channels.fetch(mon.discord_channel).catch(() => null);
                    if (channel) {
                        const embed = new EmbedBuilder()
                            .setTitle('🎮 Twitch Live Now!')
                            .setURL(`https://twitch.tv/${mon.target_id}`)
                            .setDescription(`**${stream.title}**\n\n**${stream.user_name}** is LIVE on **${stream.game_name}**!`)
                            .setColor('#6441A5')
                            .setImage(stream.thumbnail_url.replace('{width}', '1280').replace('{height}', '720'))
                            .setTimestamp();
                        await channel.send({ content: `📢 **${stream.user_name}** is LIVE!`, embeds: [embed] });
                    }
                    this.client.db.db.prepare('UPDATE stream_notifications SET last_id = ? WHERE id = ?').run(stream.id, mon.id);
                }
            } else if (mon.last_id !== 'OFFLINE') {
                this.client.db.db.prepare('UPDATE stream_notifications SET last_id = ? WHERE id = ?').run('OFFLINE', mon.id);
            }
        } catch (error) { this.twitchToken = null; }
    }

    async checkReddit(mon) {
        try {
            const res = await fetch(`https://www.reddit.com/r/${mon.target_id}/new.json?limit=1`);
            const data = await res.json();
            const post = data.data.children[0]?.data;

            if (post && post.id !== mon.last_id) {
                const channel = await this.client.channels.fetch(mon.discord_channel).catch(() => null);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setTitle(`📝 New post in r/${mon.target_id}`)
                        .setURL(`https://reddit.com${post.permalink}`)
                        .setDescription(`**${post.title}**\n\nPosted by u/${post.author}`)
                        .setColor('#FF4500')
                        .setTimestamp();
                    
                    if (post.url && post.url.match(/\.(jpg|jpeg|png|gif)$/i)) embed.setImage(post.url);
                    
                    await channel.send({ embeds: [embed] });
                }
                this.client.db.db.prepare('UPDATE stream_notifications SET last_id = ? WHERE id = ?').run(post.id, mon.id);
            }
        } catch (error) {}
    }

    async checkGitHub(mon) {
        try {
            const res = await fetch(`https://api.github.com/repos/${mon.target_id}/commits?per_page=1`);
            const data = await res.json();
            const commit = data[0];

            if (commit && commit.sha !== mon.last_id) {
                const channel = await this.client.channels.fetch(mon.discord_channel).catch(() => null);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setTitle(`🛠️ New Commit: ${mon.target_id}`)
                        .setURL(commit.html_url)
                        .setDescription(`**Message:** ${commit.commit.message}\n\n**Author:** ${commit.commit.author.name}`)
                        .setColor('#24292e')
                        .setTimestamp();
                    
                    await channel.send({ embeds: [embed] });
                }
                this.client.db.db.prepare('UPDATE stream_notifications SET last_id = ? WHERE id = ?').run(commit.sha, mon.id);
            }
        } catch (error) {}
    }
}

export default StreamManager;

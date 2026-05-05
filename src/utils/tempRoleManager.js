class TempRoleManager {
    constructor(client) {
        this.client = client;
    }

    init() {
        // Cek setiap 1 menit
        setInterval(() => this.checkTempRoles(), 60000);
    }

    async checkTempRoles() {
        const now = new Date();
        const expired = this.client.db.db.prepare('SELECT * FROM temp_roles WHERE ends_at <= CURRENT_TIMESTAMP').all();

        for (const tr of expired) {
            const guild = await this.client.guilds.fetch(tr.guild_id).catch(() => null);
            if (!guild) continue;

            const member = await guild.members.fetch(tr.user_id).catch(() => null);
            const role = guild.roles.cache.get(tr.role_id);

            if (member && role) {
                await member.roles.remove(role).catch(() => {});
            }

            this.client.db.db.prepare('DELETE FROM temp_roles WHERE id = ?').run(tr.id);
        }
    }
}

export default TempRoleManager;

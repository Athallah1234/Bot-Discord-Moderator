import { Events, Collection, EmbedBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            // Blacklist check
            const blacklisted = client.db.db.prepare('SELECT * FROM blacklist WHERE user_id = ?').get(interaction.user.id);
            if (blacklisted) {
                return interaction.reply({ content: `❌ Anda telah diblokir dari menggunakan bot ini.\nAlasan: \`${blacklisted.reason}\``, flags: [MessageFlags.Ephemeral] });
            }

            // Cooldown check
            if (!client.cooldowns.has(command.data.name)) {
                client.cooldowns.set(command.data.name, new Collection());
            }

            const now = Date.now();
            const timestamps = client.cooldowns.get(command.data.name);
            const cooldownAmount = (command.cooldown || 3) * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return interaction.reply({ 
                        content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.data.name}\` command.`, 
                        flags: [MessageFlags.Ephemeral] 
                    });
                }
            }

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            // Execute Command
            try {
                // Permission checks for Mod/Admin commands
                const settings = client.db.getSettings(interaction.guildId);
                
                if (command.modOnly) {
                    const hasModRole = interaction.member.roles.cache.has(settings?.mod_role) || interaction.member.roles.cache.has(settings?.admin_role);
                    if (!hasModRole && !interaction.member.permissions.has('Administrator')) {
                        return interaction.reply({ content: 'You do not have permission to use this command.', flags: [MessageFlags.Ephemeral] });
                    }
                }

                if (command.adminOnly && !interaction.member.permissions.has('Administrator')) {
                    return interaction.reply({ content: 'Only Administrators can use this command.', flags: [MessageFlags.Ephemeral] });
                }

                await command.execute(interaction, client);
            } catch (error) {
                client.logger.error(`Error executing ${interaction.commandName}: ${error.message}`);
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Command Error')
                    .setDescription(`An error occurred: \`${error.message}\``);

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
                } else {
                    await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
                }
            }
        } else if (interaction.isButton()) {
            const settings = client.db.getSettings(interaction.guildId);

            // TICKET OPEN
            if (interaction.customId === 'ticket_open') {
                const categoryId = settings.ticket_category;
                if (!categoryId) return interaction.reply({ content: 'Ticket system is not fully configured (missing category).', flags: [MessageFlags.Ephemeral] });

                const channel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    parent: categoryId,
                    permissionOverwrites: [
                        { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
                        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                        { id: settings.mod_role || interaction.guild.roles.everyone.id, allow: [PermissionFlagsBits.ViewChannel] }
                    ]
                });

                const embed = new EmbedBuilder()
                    .setTitle('New Ticket')
                    .setDescription(`Welcome <@${interaction.user.id}>! Please describe your issue. Support will be with you shortly.`)
                    .setColor('#5865F2');

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setEmoji('🙋‍♂️').setStyle(ButtonStyle.Success)
                );

                await channel.send({ content: `<@${interaction.user.id}> | <@&${settings.mod_role}>`, embeds: [embed], components: [row] });
                
                // Save to DB
                client.db.db.prepare('INSERT INTO tickets (guild_id, channel_id, user_id) VALUES (?, ?, ?)').run(interaction.guildId, channel.id, interaction.user.id);

                return interaction.reply({ content: `Ticket created: ${channel}`, flags: [MessageFlags.Ephemeral] });
            }

            // TICKET CLOSE
            if (interaction.customId === 'ticket_close') {
                await interaction.reply('Closing ticket in 5 seconds...');
                setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
            }

            // VERIFICATION
            if (interaction.customId === 'verify_user') {
                const roleId = settings.verify_role;
                if (!roleId) return interaction.reply({ content: 'Verification role not set.', flags: [MessageFlags.Ephemeral] });

                await interaction.member.roles.add(roleId);
                return interaction.reply({ content: '✅ You have been verified!', flags: [MessageFlags.Ephemeral] });
            }

            // GIVEAWAY JOIN
            if (interaction.customId === 'giveaway_join') {
                const giveaway = client.db.db.prepare("SELECT * FROM giveaways WHERE message_id = ? AND status = 'OPEN'").get(interaction.message.id);
                if (!giveaway) return interaction.reply({ content: 'Giveaway ini sudah berakhir.', flags: [MessageFlags.Ephemeral] });

                try {
                    client.db.db.prepare('INSERT INTO giveaway_entries (message_id, user_id) VALUES (?, ?)').run(interaction.message.id, interaction.user.id);
                    return interaction.reply({ content: '✅ Anda telah berhasil bergabung dalam giveaway ini!', flags: [MessageFlags.Ephemeral] });
                } catch {
                    return interaction.reply({ content: '❌ Anda sudah terdaftar dalam giveaway ini.', flags: [MessageFlags.Ephemeral] });
                }
            }

            // REACTION ROLE SELECT
            if (interaction.customId === 'reaction_role_select') {
                const roleId = interaction.values[0];
                const role = interaction.guild.roles.cache.get(roleId);
                
                if (!role) return interaction.reply({ content: 'Role tersebut tidak ditemukan.', flags: [MessageFlags.Ephemeral] });

                if (interaction.member.roles.cache.has(roleId)) {
                    await interaction.member.roles.remove(roleId);
                    return interaction.reply({ content: `✅ Role **${role.name}** telah dihapus dari akun Anda.`, flags: [MessageFlags.Ephemeral] });
                } else {
                    await interaction.member.roles.add(roleId);
                    return interaction.reply({ content: `✅ Role **${role.name}** telah ditambahkan ke akun Anda.`, flags: [MessageFlags.Ephemeral] });
                }
            }
        }

        // MODAL SUBMISSIONS
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'embed_modal') {
                const title = interaction.fields.getTextInputValue('embed_title');
                const desc = interaction.fields.getTextInputValue('embed_desc');
                const color = interaction.fields.getTextInputValue('embed_color') || '#5865F2';
                const footer = interaction.fields.getTextInputValue('embed_footer');

                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(desc)
                    .setColor(color.startsWith('#') ? color : '#5865F2')
                    .setTimestamp();

                if (footer) embed.setFooter({ text: footer });

                await interaction.channel.send({ embeds: [embed] });
                return interaction.reply({ content: '✅ Embed kustom berhasil dikirim!', flags: [MessageFlags.Ephemeral] });
            }

            if (interaction.customId === 'event_modal') {
                const name = interaction.fields.getTextInputValue('event_name');
                const desc = interaction.fields.getTextInputValue('event_desc');
                const timeStr = interaction.fields.getTextInputValue('event_time');
                
                let startTime;
                if (timeStr.includes('-')) {
                    startTime = new Date(timeStr);
                } else {
                    const duration = ms(timeStr);
                    startTime = duration ? new Date(Date.now() + duration) : new Date();
                }

                const timestamp = Math.floor(startTime.getTime() / 1000);
                if (isNaN(timestamp)) return interaction.reply({ content: 'Format waktu tidak valid.', flags: [MessageFlags.Ephemeral] });

                const embed = new EmbedBuilder()
                    .setTitle(`📅 NEW EVENT: ${name}`)
                    .setDescription(desc)
                    .addFields([{ name: '⏰ Waktu', value: `<t:${timestamp}:F> (<t:${timestamp}:R>)` }])
                    .setColor('#5865F2')
                    .setFooter({ text: 'Klik tombol di bawah untuk bergabung!' })
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('event_join').setLabel('Join (0)').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('event_leave').setLabel('Leave').setStyle(ButtonStyle.Secondary)
                );

                const msg = await interaction.channel.send({ embeds: [embed], components: [row] });
                
                client.db.db.prepare('INSERT INTO server_events (guild_id, creator_id, name, description, start_time, channel_id, message_id) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
                    interaction.guildId, interaction.user.id, name, desc, startTime.toISOString().replace('T', ' ').replace('Z', ''), interaction.channelId, msg.id
                );

                return interaction.reply({ content: '✅ Event berhasil dibuat!', flags: [MessageFlags.Ephemeral] });
            }
        }

        // SELECT MENUS
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'select_color') {
                const roleId = interaction.values[0];
                const guildId = interaction.guildId;
                const member = interaction.member;

                const allColorRoles = client.db.db.prepare('SELECT role_id FROM color_roles WHERE guild_id = ?').all(guildId).map(r => r.role_id);
                
                // Remove existing color roles
                const rolesToRemove = member.roles.cache.filter(r => allColorRoles.includes(r.id));
                if (rolesToRemove.size > 0) await member.roles.remove(rolesToRemove);

                // Add new role
                const newRole = interaction.guild.roles.cache.get(roleId);
                if (newRole) {
                    await member.roles.add(newRole).catch(() => {});
                    return interaction.update({ content: `✅ Warna nama Anda telah diubah menjadi **${newRole.name}**!`, embeds: [], components: [] });
                }
            }
        }

        // BUTTONS (RSVP & Suggestions)
        if (interaction.isButton()) {
            const guildId = interaction.guildId;
            const userId = interaction.user.id;
            const messageId = interaction.message.id;

            if (interaction.customId.startsWith('event_')) {
                const event = client.db.db.prepare('SELECT * FROM server_events WHERE message_id = ?').get(messageId);
                if (!event) return interaction.reply({ content: 'Data event tidak ditemukan.', flags: [MessageFlags.Ephemeral] });

                if (interaction.customId === 'event_join') {
                    client.db.db.prepare('INSERT OR IGNORE INTO event_rsvps (event_id, user_id) VALUES (?, ?)').run(event.id, userId);
                } else if (interaction.customId === 'event_leave') {
                    client.db.db.prepare('DELETE FROM event_rsvps WHERE event_id = ? AND user_id = ?').run(event.id, userId);
                }

                // Update Embed
                const rsvps = client.db.db.prepare('SELECT COUNT(*) as count FROM event_rsvps WHERE event_id = ?').get(event.id);
                const embed = EmbedBuilder.from(interaction.message.embeds[0]);
                
                const row = ActionRowBuilder.from(interaction.message.components[0]);
                row.components[0].setLabel(`Join (${rsvps.count})`);

                await interaction.update({ embeds: [embed], components: [row] });
            }
        }
    },
};

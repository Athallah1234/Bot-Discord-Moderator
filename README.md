# 🚀 Ultimate Discord Suite: The All-in-One Community Powerhouse

[![Discord.js](https://img.shields.io/badge/discord.js-v14.11.0-blue.svg?style=for-the-badge&logo=discord)](https://discord.js.org)
[![Node.js](https://img.shields.io/badge/Node.js-v18.x-green.svg?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![SQLite](https://img.shields.io/badge/SQLite-Better--SQLite3-orange.svg?style=for-the-badge&logo=sqlite)](https://github.com/WiseLibs/better-sqlite3)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Ultimate Discord Suite** adalah ekosistem moderasi dan manajemen komunitas Discord paling lengkap, modular, dan siap produksi. Dibangun untuk menangani server skala besar dengan ribuan member, bot ini menggabungkan Moderasi Pro, Ekonomi MMORPG, Otomatisasi Canggih, dan Sistem Sosial dalam satu codebase yang bersih.

---

## 📍 Daftar Isi (Table of Contents)
1.  [✨ Fitur Utama (Highlight)](#-fitur-utama-highlight)
2.  [🛠️ Persyaratan & Instalasi](#️-persyaratan--instalasi)
3.  [📜 Daftar Perintah Terlengkap](#-daftar-perintah-terlengkap-114-commands)
    *   [🛡️ Moderation](#️-moderation-57-commands)
    *   [⚙️ Administration & Automation](#️-administration--automation-15-commands)
    *   [💰 Economy System](#-economy-system-15-commands)
    *   [👥 Community & Social](#-community--social-8-commands)
    *   [🛠️ Utility & General](#️-utility--general-16-commands)
4.  [🛠️ Developer Guide](#️-developer-guide-extend-the-bot)
5.  [🔑 Environment Variable Reference](#-environment-variable-reference)
6.  [⚡ Performance & Scalability](#-performance--scalability)
7.  [🏗️ Deep-Dive Architecture](#️-deep-dive-architecture)
    *   [🗄️ Database Schema](#️-database-schema-sqlite)
    *   [🔄 Event Flow Logic](#-event-flow-logic)
8.  [📖 Detailed Feature Walkthroughs](#-detailed-feature-walkthroughs)
    *   [⭐ Starboard](#-starboard-hall-of-fame)
    *   [🎫 Advanced Ticket System](#-advanced-ticket-system)
9.  [🎨 UI & Aesthetic Customization](#-ui--aesthetic-customization)
10. [🔑 API Integration Guide](#-api-integration-guide-youtube--twitch)
11. [🌐 Hosting & Deployment](#-hosting--deployment-recommendations)
12. [📂 Detailed Module Documentation](#-detailed-module-documentation)
13. [🔐 Permission Matrix](#-permission-matrix)
14. [🚀 Future Roadmap](#-future-roadmap)
15. [❓ FAQ](#-faq-frequently-asked-questions)
16. [🛠️ Troubleshooting & Debugging](#️-troubleshooting--debugging)
17. [🛡️ Security & Privacy](#️-security--privacy)
18. [🤝 Kontribusi](#-kontribusi)
19. [📄 Lisensi](#-lisensi)

---

## ✨ Fitur Utama (Highlight)
*   🛡️ **Moderasi Tanpa Batas**: 57+ perintah moderasi termasuk mass-action dan manajemen suara.
*   💰 **Ekonomi MMORPG**: Sistem toko, inventory, hadiah, dan perjudian yang adil.
*   🤖 **Otomatisasi Canggih**: Starboard, Pengumuman terjadwal, dan Auto-Responder.
*   📊 **Dashboard Internal**: Konfigurasi server penuh melalui slash commands (No Web Dashboard needed!).
*   🎮 **Community Engagement**: Sistem Event dengan RSVP, Ulang Tahun, dan Profil Sosial.
*   🎥 **External Integration**: Notifikasi otomatis dari YouTube, Twitch, Reddit, dan GitHub.
*   🎨 **Cosmetic Customization**: Role warna, Lencana (Badges), dan Nickname kustom.

---

## 🛠️ Persyaratan & Instalasi

### Prasyarat
*   Node.js v18.x atau lebih tinggi.
*   Discord Bot Token (Dapatkan di [Discord Developer Portal](https://discord.com/developers/applications)).
*   Pemahaman dasar tentang JSON dan `.env`.

### Instalasi Cepat
1.  **Clone Repositori**
    ```bash
    git clone https://github.com/username/ultimate-discord-moderator.git
    cd ultimate-discord-moderator
    ```

2.  **Instal Dependensi**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment**
    Buat file `.env` di direktori utama:
    ```env
    DISCORD_TOKEN=your_token_here
    CLIENT_ID=your_client_id_here
    GUILD_ID=your_guild_id_here
    DATABASE_PATH=./src/data/database.sqlite
    TWITCH_CLIENT_ID=optional_twitch_id
    TWITCH_CLIENT_SECRET=optional_twitch_secret
    ```

4.  **Jalankan Bot**
    ```bash
    # Development mode
    npm run dev

    # Production mode
    npm start
    ```

---

## 📜 Daftar Perintah Terlengkap (114+ Commands)

### 🛡️ Moderation (57 Commands)
*   `/ban`, `/unban`, `/softban`, `/massban`: Manajemen blokir member.
*   `/kick`, `/masskick`: Mengeluarkan member secara instan.
*   `/warn`, `/warnings`, `/clearwarn`: Sistem peringatan member.
*   `/timeout`, `/untimeout`: Membungkam member sementara.
*   `/purge`: Menghapus pesan secara massal (All, User, Bot, Link, Emoji, etc).
*   `/lock`, `/unlock`, `/nuke`: Manajemen keamanan channel.
*   `/slowmode`: Mengatur kecepatan chat.
*   `/role add/remove/info`: Manajemen role member secara cepat.
*   `/voice kick/mute/unmute/deafen/undeafen`: Moderasi suara tingkat lanjut.

### ⚙️ Administration & Automation (15 Commands)
*   `/config`: Dashboard pengaturan utama server.
*   `/verify-setup`: Mengatur sistem verifikasi member baru.
*   `/leveling-setup`: Konfigurasi XP, Level, dan Rewards.
*   `/reaction-roles`: Membuat menu pilihan role yang elegan.
*   `/security`: Mengaktifkan Anti-Spam, Anti-Link, dan Anti-Badwords.
*   `/welcomer`: Kustomisasi pesan sambutan (Embed/DM).
*   `/starboard`: Mengatur "Hall of Fame" server.
*   `/announcer`: Penjadwal pengumuman otomatis berkala.
*   `/auto-responder`: Membuat balasan otomatis berdasarkan kata kunci.
*   `/embed-creator`: Generator pesan embed profesional dengan Modal.
*   `/stream-setup`: Notifikasi YouTube, Twitch, Reddit, & GitHub.
*   `/community-setup`: Setup channel Saran, Laporan, & Ulang Tahun.
*   `/cosmetic-setup`: Kelola role warna dan lencana profil.

### 💰 Economy System (15 Commands)
*   `/balance`: Cek saldo dompet dan bank.
*   `/work`, `/daily`, `/beg`: Cara mendapatkan uang secara gratis.
*   `/pay`: Mengirim uang ke member lain.
*   `/deposit`, `/withdraw`: Manajemen saldo bank.
*   `/gamble`: Pertaruhkan nasib Anda (Coinflip/Dice/Slots).
*   `/rob`: Mencoba mencuri uang dari dompet member lain.
*   `/leaderboard money`: Papan peringkat orang terkaya.
*   `/shop`: Katalog item dan role eksklusif.
*   `/buy`: Membeli item menggunakan saldo ekonomi.
*   `/inventory`: Melihat koleksi barang yang dimiliki.
*   `/gift`: Membelikan hadiah untuk teman.
*   `/sell`: Menjual kembali item (Refund 50%).

### 👥 Community & Social (8 Commands)
*   `/profile`: Kartu identitas sosial (XP, Money, Badges, Bio, Socials).
*   `/set-profile`: Kustomisasi bio dan link sosial media.
*   `/suggest`: Sistem voting saran komunitas.
*   `/report`: Pelaporan rahasia member/bug ke Staff.
*   `/birthday`: Sistem perayaan ulang tahun otomatis.
*   `/event create/list`: Manajemen event server dengan sistem RSVP.
*   `/leaderboard xp`: Papan peringkat member teraktif.

### 🛠️ Utility & General (16 Commands)
*   `/help`: Menu bantuan interaktif dengan sistem kategori.
*   `/stats`: Statistik teknis bot dan server.
*   `/ticket`: Sistem dukungan pelanggan (Customer Support).
*   `/giveaway`: Manajemen undian berhadiah otomatis.
*   `/info`: Detail informasi User, Server, Role, dan Channel.
*   `/ping`, `/uptime`: Cek latensi dan durasi aktif bot.
*   `/remind`: Pengingat waktu pribadi.
*   `/poll`: Membuat pemungutan suara sederhana.
*   `/afk`: Status istirahat dengan deteksi auto-reply.
*   `/countdown`: Hitung mundur dinamis menuju momen penting.

---

## 🛠️ Developer Guide (Extend the Bot)
Ingin menambahkan fitur sendiri? Bot ini dirancang sangat modular:

### Menambah Perintah Baru
1.  Buat file baru di `src/commands/[kategori]/perintah_anda.js`.
2.  Gunakan template standar:
    ```javascript
    import { SlashCommandBuilder } from 'discord.js';
    export default {
        data: new SlashCommandBuilder().setName('nama').setDescription('deskripsi'),
        async execute(interaction, client) {
            // Logika Anda di sini
        }
    };
    ```
### Menambah Event Baru
1.  Buat file baru di `src/events/nama_event.js`.
2.  Bot akan otomatis mendeteksi dan mendaftarkannya saat startup.

---

## 🔑 Environment Variable Reference

| Variable | Deskripsi | Wajib? |
| :--- | :--- | :--- |
| `DISCORD_TOKEN` | Token Bot dari Discord Developer Portal | **YA** |
| `CLIENT_ID` | Application ID dari bot Anda | **YA** |
| `GUILD_ID` | ID Server utama (untuk pendaftaran command cepat) | **YA** |
| `DATABASE_PATH` | Lokasi file database SQLite (default: `./src/data/database.sqlite`) | Tidak |
| `TWITCH_CLIENT_ID` | ID Aplikasi Twitch untuk notifikasi Live | Tidak |
| `TWITCH_CLIENT_SECRET` | Secret Aplikasi Twitch untuk notifikasi Live | Tidak |

---

## ⚡ Performance & Scalability
*   **Low Resource Usage**: Bot hanya menggunakan ~60-100MB RAM dalam kondisi idle.
*   **Concurrent Handling**: Menggunakan `better-sqlite3` yang mendukung ribuan query per detik secara efisien.
*   **Async Native**: Semua operasi I/O dan API dilakukan secara asynchronous untuk mencegah lag pada thread utama.

---

## 🏗️ Deep-Dive Architecture

### 🗄️ Database Schema (SQLite)
Proyek ini menggunakan skema relasional yang dioptimalkan untuk performa tinggi:
*   **`settings`**: Menyimpan seluruh konfigurasi server (Log channels, roles, toggle fitur).
*   **`users`**: Data inti member (XP, Level, Saldo Dompet, Saldo Bank, Bio, Sosmed).
*   **`punishments`**: History ban, kick, dan timeout untuk keperluan audit.
*   **`shop_items` & `inventory`**: Ekosistem ekonomi dan kepemilikan item.
*   **`server_events` & `rsvps`**: Manajemen acara dan daftar partisipan.
*   **`stream_notifications`**: Tracking status live/upload eksternal (YouTube/Twitch/etc).
*   **`temp_roles`**: Antrean penghapusan role otomatis berbasis waktu.

### 🔄 Event Flow Logic
Bot menggunakan pola **Modular Event-Driven Architecture**:
1.  **Interaction Trigger**: Member menjalankan `/slash command`.
2.  **Middleware Check**: Validasi izin (Permissions) dan status (Blacklist/AFK).
3.  **Command Execution**: Logika inti dijalankan (Database update, API call).
4.  **Logging**: Setiap aksi penting dicatat di `log_channel` server.

---

## 🚀 Future Roadmap
Kami terus berkembang! Berikut adalah fitur yang direncanakan:
- [ ] 🤖 **AI Integration**: Moderasi berbasis sentimen menggunakan AI.
- [ ] 🎵 **Music System**: Streaming audio kualitas tinggi dengan kontrol antrean.
- [ ] 🌐 **Web Dashboard**: Panel kontrol berbasis Next.js untuk manajemen lebih mudah.
- [ ] 🎮 **Mini-Games**: Tambahan game interaktif seperti Trivia dan Hangman.
- [ ] 📉 **Analytics Graph**: Visualisasi pertumbuhan member dalam bentuk grafik di Discord.

---

## ❓ FAQ (Frequently Asked Questions)

**Q: Mengapa bot tidak merespon perintah?**  
A: Pastikan bot memiliki izin `Applications.Commands` di OAuth2 dan role bot berada di posisi atas pada daftar role server.

**Q: Apakah data saya aman?**  
A: Ya, data disimpan secara lokal di file `database.sqlite` di server Anda sendiri. Tidak ada data yang dikirim ke server pihak ketiga kecuali untuk keperluan API Notifikasi (Twitch/YouTube).

**Q: Bagaimana cara menambah role warna?**  
A: Gunakan `/cosmetic-setup color add` lalu pilih role yang sudah Anda buat di pengaturan server.

---

## 🛠️ Troubleshooting & Debugging

| Masalah | Solusi |
| :--- | :--- |
| `Unknown Interaction` | Terjadi jika proses command memakan waktu > 3 detik. Kami sudah menggunakan `deferReply()` untuk mencegah hal ini. |
| `Missing Permissions` | Berikan izin `Administrator` pada bot atau pastikan bot memiliki akses ke channel terkait. |
| `Database Locked` | Terjadi jika ada proses eksternal yang membuka file `.sqlite`. Pastikan hanya bot yang mengakses database. |

---

## 🛡️ Security & Privacy
Keamanan adalah prioritas kami:
*   **Permission Shield**: Perintah sensitif (Moderasi/Admin) dilindungi oleh pengecekan `PermissionFlagsBits`.
*   **Input Sanitization**: Semua input dari member divalidasi sebelum masuk ke database untuk mencegah SQL Injection.
*   **Rate Limiting**: Sistem Anti-Spam internal mencegah member membombardir bot dengan perintah.

---

## 📂 Detailed Module Documentation

### 🛠️ Core Utilities (`src/utils/`)
*   **`announcerManager.js`**: Mesin polling otomatis yang mengirimkan pesan terjadwal dari database ke channel tujuan.
*   **`birthdayManager.js`**: Pengelola database ulang tahun yang melakukan pengecekan harian dan mengirim ucapan otomatis.
*   **`streamManager.js`**: Integrasi API eksternal (YouTube RSS, Twitch Helix) untuk notifikasi konten baru secara real-time.
*   **`tempRoleManager.js`**: Sistem background worker yang memantau durasi role sementara dan mencabutnya secara otomatis.
*   **`giveawayManager.js`**: Logika pengundian pemenang dan manajemen waktu giveaway yang persisten.
*   **`reminderManager.js`**: Pengelola pengingat waktu pribadi member yang terintegrasi dengan database.

### 🛡️ Middleware & Security
*   **`interactionCreate.js`**: Otak dari seluruh interaksi bot (Slash commands, Buttons, Modals, Select Menus).
*   **`messageCreate.js`**: Penanggung jawab Auto-Mod, Leveling XP, AFK Detection, dan Auto-Responder.

---

## 🔐 Permission Matrix
Panduan izin yang direkomendasikan untuk stabilitas fitur:

| Kategori | Izin Discord yang Dibutuhkan | Alasan |
| :--- | :--- | :--- |
| **Moderasi** | `Ban Members`, `Kick Members`, `Manage Messages` | Eksekusi hukuman & pembersihan chat. |
| **Admin** | `Administrator` atau `Manage Guild` | Konfigurasi sistem inti server. |
| **Cosmetic** | `Manage Roles`, `Manage Nicknames` | Mengubah warna & nama member. |
| **Utility** | `Embed Links`, `Send Messages` | Pengiriman informasi & tiket. |

---

## 📖 Detailed Feature Walkthroughs

### ⭐ Starboard (Hall of Fame)
Sistem Starboard bekerja secara otomatis:
1.  Member memberikan reaksi ⭐ pada pesan yang mereka sukai.
2.  Setelah mencapai ambang batas (default: 3 ⭐), bot akan memposting pesan tersebut ke channel `#starboard`.
3.  Jika jumlah bintang bertambah, bot akan memperbarui pesan yang sudah ada, bukan memposting ulang.

### 🎫 Advanced Ticket System
Sistem tiket kami mendukung privasi penuh:
1.  Admin membuat pesan tiket menggunakan `/ticket setup`.
2.  Member menekan tombol 📩 untuk membuka tiket.
3.  Channel privat dibuat hanya untuk member tersebut dan Staff.
4.  Setelah selesai, Staff bisa menggunakan `/ticket close` untuk menghapus channel dan menyimpan log percakapan.

---

## 🎨 UI & Aesthetic Customization
Ingin mengubah tampilan bot agar sesuai dengan brand server Anda?
*   **Warna Embed Utama**: Cari variabel warna (hex code seperti `#5865F2`) di file perintah terkait dan ubah sesuai keinginan.
*   **Emoji Kustom**: Anda bisa mengganti emoji default (seperti 🔨, ⚙️) di file `src/commands/utility/help.js` atau file utilitas lainnya dengan ID emoji kustom server Anda sendiri.
*   **Footer & Author**: Kustomisasi nama bot dan ikon di bagian `.setFooter()` dan `.setAuthor()` pada setiap file perintah.

---

## 🔑 API Integration Guide (YouTube & Twitch)

### YouTube (RSS Method)
Tidak memerlukan API Key! 
1. Buka channel YouTube tujuan.
2. Klik kanan -> View Page Source.
3. Cari `channelId` (format: `UC...`).
4. Gunakan ID tersebut di `/stream-setup youtube add`.

### Twitch (API Method)
1. Pergi ke [Twitch Dev Console](https://dev.twitch.tv/console).
2. Buat aplikasi baru untuk mendapatkan `Client ID` dan `Client Secret`.
3. Masukkan keduanya ke file `.env` Anda.

---

## 🌐 Hosting & Deployment Recommendations
Untuk menjalankan bot ini 24/7 secara profesional, kami merekomendasikan:
1.  **VPS (Virtual Private Server)**: DigitalOcean, Linode, atau Vultr (OS: Ubuntu 22.04 LTS).
2.  **Process Manager**: Gunakan [PM2](https://pm2.keymetrics.io/) agar bot otomatis restart jika terjadi crash:
    ```bash
    npm install pm2 -g
    pm2 start src/index.js --name "discord-bot"
    pm2 save
    ```
3.  **Database Backup**: Lakukan backup file `database.sqlite` secara rutin setiap minggu.

---

## 💖 Special Thanks
Terima kasih kepada seluruh komunitas pengembang **Discord.js** dan para kontributor yang telah memberikan inspirasi dalam membangun bot All-in-One ini.

---
*Dibuat dengan ❤️ oleh Antigravity AI untuk komunitas Discord yang lebih baik.*

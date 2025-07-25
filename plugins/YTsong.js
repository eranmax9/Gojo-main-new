const { cmd } = require("../command");
const yts = require("yt-search");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

cmd(
  {
    pattern: "song",
    react: "🎵",
    desc: "Download Song",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      body,
      args,
      q,
    }
  ) => {
    const reply = (text) => robin.sendMessage(from, { text }, { quoted: mek });

    try {
      if (!q) return reply("*නමක් හරි ලින්ක් එකක් හරි දෙන්න* 🌚❤️");

      // 1. Search video from YouTube
      const search = await yts(q);
      const data = search.videos[0];
      const url = data.url;

      // 2. Duration check (30-minute max)
      const durationParts = data.timestamp.split(":").map(Number);
      let totalSeconds = 0;
      if (durationParts.length === 3) {
        totalSeconds = durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2];
      } else if (durationParts.length === 2) {
        totalSeconds = durationParts[0] * 60 + durationParts[1];
      } else {
        totalSeconds = durationParts[0];
      }

      if (totalSeconds > 1800) {
        return reply("⏱️ Audio limit is 30 minutes");
      }

      // 3. Song info
      const desc = `
*❤️ROBIN SONG DOWNLOADER❤️*

👻 *title* : ${data.title}
👻 *description* : ${data.description}
👻 *time* : ${data.timestamp}
👻 *ago* : ${data.ago}
👻 *views* : ${data.views}
👻 *url* : ${data.url}

𝐌𝐚𝐝𝐞 𝐛𝐲 𝐒_𝐈_𝐇_𝐈_𝐋_𝐄_𝐋
`;

      await robin.sendMessage(
        from,
        { image: { url: data.thumbnail }, caption: desc },
        { quoted: mek }
      );

      // 4. Download MP3 using yt-dlp
      const fileName = `${data.title.replace(/[^\w\s]/gi, "")}_${Date.now()}.mp3`;
      const outputPath = path.join(__dirname, "..", "downloads", fileName);

      await new Promise((resolve, reject) => {
        exec(
          `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`,
          (err, stdout, stderr) => {
            if (err) return reject(err);
            resolve(stdout);
          }
        );
      });

      // 5. Send audio
      const fileStream = fs.createReadStream(outputPath);
      await robin.sendMessage(
        from,
        {
          audio: fileStream,
          mimetype: "audio/mpeg",
        },
        { quoted: mek }
      );

      // 6. Send as document
      const docStream = fs.createReadStream(outputPath);
      await robin.sendMessage(
        from,
        {
          document: docStream,
          mimetype: "audio/mpeg",
          fileName: `${data.title}.mp3`,
          caption: "𝐌𝐚𝐝𝐞 𝐛𝐲 𝐒_𝐈_𝐇_𝐈_𝐋_𝐄_𝐋",
        },
        { quoted: mek }
      );

      // 7. Cleanup (optional)
      fs.unlink(outputPath, () => {});

      return reply("*Thanks for using my bot* 🌚❤️");
    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);

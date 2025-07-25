const { cmd, commands } = require("../command");
const yts = require("yt-search");
const { ytmp3 } = require("@bochilteam/scraper"); // Corrected

cmd(
  {
    pattern: "song",
    react: "🎵",
    desc: "Download Song",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, context) => {
    try {
      const { reply, q, from } = context;

      if (!q) return reply("*නමක් හරි ලින්ක් එකක් හරි දෙන්න* 🌚❤️");

      const search = await yts(q);
      const data = search.videos[0];
      const url = data.url;

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

      await robin.sendMessage(from, { image: { url: data.thumbnail }, caption: desc }, { quoted: mek });

      const quality = "128";
      const songData = await ytmp3(url);

      let durationParts = data.timestamp.split(":").map(Number);
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

      await robin.sendMessage(from, {
        audio: { url: songData.download.url },
        mimetype: "audio/mpeg",
      }, { quoted: mek });

      await robin.sendMessage(from, {
        document: { url: songData.download.url },
        mimetype: "audio/mpeg",
        fileName: `${data.title}.mp3`,
        caption: "𝐌𝐚𝐝𝐞 𝐛𝐲 𝐒_𝐈_𝐇_𝐈_𝐋_𝐄_𝐋",
      }, { quoted: mek });

      return reply("*Thanks for using my bot* 🌚❤️");
    } catch (e) {
      console.error(e);
      reply(`❌ Error: ${e.message}`);
    }
  }
);

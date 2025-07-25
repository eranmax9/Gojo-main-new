const { cmd, commands } = require("../lib/command");
const yts = require("yt-search");
const { ytmp3 } = require("@vreden/youtube_scraper");

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
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      if (!q) return reply("*නමක් හරි ලින්ක් එකක් හරි දෙන්න* 🌚❤️");

      // Search for the video
      const search = await yts(q);
      if (!search.videos.length)
        return reply("😓 Song not found. Try a different keyword.");

      const data = search.videos[0];
      const url = data.url;

      // Validate song duration (limit: 30 minutes)
      let durationParts = data.timestamp.split(":").map(Number);
      let totalSeconds =
        durationParts.length === 3
          ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
          : durationParts[0] * 60 + durationParts[1];

      if (totalSeconds > 1800) {
        return reply("⏱️ Audio limit is 30 minutes");
      }

      // Song metadata message
      const desc = `
🎧 *${data.title}*

📝 *Description:* ${data.description || "No description"}
⏱️ *Duration:* ${data.timestamp}
📅 *Uploaded:* ${data.ago}
👀 *Views:* ${data.views.toLocaleString()}
🔗 *URL:* ${data.url}

_Made with ❤️ by Sayura_
      `;

      // Send metadata + thumbnail
      await robin.sendMessage(
        from,
        { image: { url: data.thumbnail }, caption: desc },
        { quoted: mek }
      );

      // Download audio
      const quality = "128";
      const songData = await ytmp3(url, quality);

      if (!songData?.download?.url) {
        return reply("❌ Failed to fetch the download URL. Try again.");
      }

      // Send audio (as voice preview)
      await robin.sendMessage(
        from,
        {
          audio: { url: songData.download.url },
          mimetype: "audio/mpeg",
        },
        { quoted: mek }
      );

      // Send audio as document
      await robin.sendMessage(
        from,
        {
          document: { url: songData.download.url },
          mimetype: "audio/mpeg",
          fileName: `${data.title}.mp3`,
          caption: "📥 *Download complete!* - Sayura Bot",
        },
        { quoted: mek }
      );

      return reply("✅ *Thanks for using my bot!* 🌚❤️");
    } catch (e) {
      console.error("SONG CMD ERROR:", e);
      reply(`❌ Error: ${e.message || "Something went wrong"}`);
    }
  }
);

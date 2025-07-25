const config = require('../settings')
const { cmd, commands } = require('../lib/command')
const { getBuffer, fetchJson } = require('../lib/functions')
const { sizeFormatter } = require('human-readable')
const GDriveDl = require('../lib/gdrive.js') // ✅ CORRECT
const N_FOUND = "*I couldn't find anything :(*"

cmd({
    pattern: "slanimeclub",
    react: '📑',
    category: "movie",
    desc: "Search anime from slanimeclub.co",
    filename: __filename
}, async (conn, m, mek, { from, prefix, q, l, reply }) => {
    try {
        if (!q) return await reply('*Please Give Me Text..! 🖊️*')

        const data = await fetchJson(`https://vajira-movie-api.netlify.app/api/slanimeclub/search?q=${q}&apikey=vajiraofficial`)

        if (!data?.data?.data?.data?.length) {
            return await conn.sendMessage(from, { text: N_FOUND }, { quoted: mek })
        }

        const srh = data.data.data.data.map((item, i) => ({
            title: `${i + 1}`,
            description: item.title,
            rowId: `${prefix}slanime ${item.link}`
        }))

        const sections = [{ title: "_[Result from slanimeclub.]_", rows: srh }]
        const listMessage = {
            text: '',
            footer: config.FOOTER,
            title: 'Result from slanimeclub. 📲',
            buttonText: '*🔢 Reply below number*',
            sections
        }

        return await conn.replyList(from, listMessage, { quoted: mek })
    } catch (e) {
        reply('*ERROR !!*')
        l(e)
    }
})

cmd({
    pattern: "slanime",
    react: '📑',
    category: "movie",
    desc: "Get anime seasons",
    filename: __filename
}, async (conn, m, mek, { from, prefix, q, l, reply }) => {
    try {
        if (!q) return await reply('*Please Give Me Text..! 🖊️*')

        const data = await fetchJson(`https://vajira-movie-api.netlify.app/api/slanimeclub/movie?url=${q}&apikey=vajiraofficial`)
        const movie = data.data?.data?.moviedata

        if (!movie) return await reply(N_FOUND)

        const cap = `*_\u2618 Title: ${movie.title}_*\n\n- *Date:* ${movie.date}\n- *Generous:* ${movie.generous}\n\n*\u2692\ufe0f Link:* ${q}`

        if (!movie.seasons?.length) return await reply(N_FOUND)

        const srh = movie.seasons.map((s, i) => ({
            title: `${i + 1}`,
            description: `${s.title} | ${s.number} | ${s.date}`,
            rowId: `${prefix}slanimedl ${s.link}|${s.title}`
        }))

        const sections = [{ title: "_[Available Seasons]_ 📥", rows: srh }]
        const listMessage = {
            caption: cap,
            image: { url: movie.image },
            footer: config.FOOTER,
            title: 'Seasons from slanimeclub 📺',
            buttonText: '*🔢 Reply below number*',
            sections
        }

        return await conn.replyList(from, listMessage, { quoted: mek })
    } catch (e) {
        reply('*ERROR !!*')
        l(e)
    }
})

cmd({
    pattern: 'slanimedl',
    react: "📥",
    category: "movie",
    desc: "Download season",
    filename: __filename,
    dontAddCommandList: true
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return await reply('*❌ Please provide a valid Slanimeclub URL!*')

    try {
        const [mediaUrl, title = 'slanime_video'] = q.split("|").map(v => v.trim())

        const res = await fetchJson(`https://vajira-movie-api.netlify.app/api/slanimeclub/download?url=${encodeURIComponent(mediaUrl)}&apikey=vajiraofficial`)
        const dl_link = res?.data?.data?.link

        if (!dl_link) return await reply('*⚠️ Unable to fetch download link. Please check the URL.*')

        await reply(`╭════ ⬛ *SLANIME DOWNLOADER* ⬛ ════⬯
│ 📥 *Uploading your movie...*
│ 🎬 *Title:* ${title}
│ 🕐 *Please wait a few moments.*
╰════════════════════════════⬯`)

        if (dl_link.includes("slanimeclub.co")) {
            const videoBuffer = await getBuffer(dl_link)
            await conn.sendMessage(from, {
                document: videoBuffer,
                mimetype: 'video/mp4',
                fileName: `${title}.mp4`,
                caption: `${title}\n\n${config.FOOTER}`
            }, { quoted: mek })

        } else if (dl_link.includes("drive.google.com")) {
            const gdrive = await GDriveDl(dl_link)

            if (gdrive?.downloadUrl) {
                await reply(`✅ *Download Link Fetched!*\n\n📁 *Name:* ${gdrive.fileName}\n📦 *Size:* ${gdrive.fileSize}\n🧾 *Type:* ${gdrive.mimetype}`)
                await conn.sendMessage(from, {
                    document: { url: gdrive.downloadUrl },
                    fileName: gdrive.fileName,
                    mimetype: gdrive.mimetype,
                    caption: `${gdrive.fileName}\n\n${config.FOOTER}`
                }, { quoted: mek })

            } else {
                const id = dl_link.match(/[-\w]{25,}/)?.[0]
                const alt = id ? `https://drive.google.com/uc?export=download&id=${id}` : dl_link
                await reply(`❌ *Google Drive quota exceeded or restricted.*\n\n📎 Original Link: ${dl_link}\n\n🔄 Alternate Download:\n${alt}\n\n🪄 Proxy:\nhttps://gdrivelink.netlify.app/#${id || ''}`)
            }

        } else {
            await reply('*⚠️ Unsupported or unrecognized link format.*')
        }

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } })

    } catch (error) {
        console.error('❌ Error:', error)
        await reply('*❌ An unexpected error occurred while processing your request.*')
    }
})

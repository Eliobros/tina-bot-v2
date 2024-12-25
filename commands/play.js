const ytsr = require("ytsr");

// Função de busca no YouTube
async function searchYouTube(term) {
    const filters = await ytsr.getFilters(term);
    const videoFilter = filters.get("Type").find(o => o.name === "Video");
    const searchResults = await ytsr(videoFilter.url, { limit: 1 });
    return searchResults.items[0];
}

async function playCommand(client, message, term) {
    const video = await searchYouTube(term);
    if (!video) {
        await client.sendMessage(message.key.remoteJid, { text: "❌ Nenhum resultado encontrado!" });
        return;
    }

    const { title, url, duration, author, views, description, uploadedAt } = video;

    const buttons = [
        { buttonId: `audio-${url}`, buttonText: { displayText: "Audio" }, type: 1 },
        { buttonId: `video-${url}`, buttonText: { displayText: "Vídeo" }, type: 1 }
    ];

    const msg = `
> ❯❯ *TINA BOT* - DOWNLOADS ❮❮

> *❒ৣ͜͡Titulo:* ${title}
> *❒ৣ͜͡Canal:* ${author.name}
> *❒ৣ͜͡Visualizações:* ${views}
> *❒ৣ͜͡Postado:* ${uploadedAt}
> *❒ৣ͜͡Duração:* ${duration}
> *❒ৣ͜͡Link:* ${url}
> *❒ৣ͜͡Descrição:* ${description}

> *Baixado por ✦『*TINA BOT*』✦*
`;

    await client.sendMessage(message.key.remoteJid, {
        text: msg,
        buttons: buttons,
        headerType: 1
    });
}

module.exports = { playCommand };
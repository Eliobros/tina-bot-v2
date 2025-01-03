// commands/play.js
module.exports = {
  name: "play",
  description: "Baixa e envia músicas do YouTube",
  async execute(sock, { msg, args, from, pushName }) {

    if (text.startsWith("/play")) {
    const query = text.slice(6).trim(); // Remove '/play ' e pega a consulta

    if (!query) {
        return sock.sendMessage(from, {
            text: `╭━━━❀ TINA BOT - OFICIAL ❀━━━╮
│╭━━━──────────────━━━╮
│╎
││❯              〘 𝐓𝐔𝐓𝐎𝐑𝐈𝐀𝐋 〙
│╎
│╎Olá, ${pushName}
│╎Aqui Irei Lhe Ensinar
│╎A Baixar Músicas 
│╎Você Deve Informar o Nome
│╎Da Música Desejada 
│╎
│╎/play NomeDaMusica
│╎
│╰━━────────────────━━╯
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        }, { quoted: msg }); // Resposta com citação (opcional)
    }

    // Mensagem de progresso
    await sock.sendMessage(from, { text: `🎧 Buscando a música: *${query}*... Aguarde!` });

    try {
        // Chamada à API
        const api = await fetch.Json(`http://node2.forgerhost.online:2000/api/ytsrc?q=${query}&apikey=TinaBotAPI`);

        if (!api.resultado || api.resultado.length === 0) {
            return sock.sendMessage(from, { text: 'Não foi possível encontrar resultados para sua pesquisa. Tente outro termo.' });
        }

        const musicInfo = api.resultado[0];
        const buffer = await getBuffer(musicInfo.image); // Processa a imagem

        // Envia as informações ao usuário
        const infoText = `❯❯   TINA BOT - DOWNLOAD   ❮❮
ৡৢ͜͡𝔬⃝ Título: ${musicInfo.title}
ৡৢ͜͡𝔬⃝ Canal: ${musicInfo.author.name}
ৡৢ͜͡𝔬⃝ Duração: ${musicInfo.timestamp}
ৡৢ͜͡𝔬⃝ Link: ${musicInfo.url}
ৡৢ͜͡𝔬⃝ Visualizações: ${musicInfo.views}
ৡৢ͜͡𝔬⃝ Descrição: ${musicInfo.description}`;

        await sock.sendMessage(from, {
            text: infoText,
            contextInfo: {
                forwardingScore: 9999999,
                isForwarded: true,
                mentionedJid: [sender],
                externalAdReply: {
                    showAdAttribution: true,
                    renderLargerThumbnail: true,
                    title: 'TINA BOT OFICIAL',
                    containsAutoReply: true,
                    mediaType: 1,
                    thumbnail: buffer, // Imagem processada
                    mediaUrl: `https://chat.whatsapp.com/CNldjIfMzMM0ePgkpYQMyE`,
                    sourceUrl: `https://chat.whatsapp.com/CNldjIfMzMM0ePgkpYQMyE`
                }
            },
            mentions: [sender]
        }, { quoted: msg });

        // Envia o áudio
        await sock.sendMessage(from, {
            audio: { url: `http://node2.forgerhost.online:2000/api/dl/ytaudio?url=${musicInfo.url}&apikey=TinaBotAPI` },
            mimetype: "audio/mp4"
        }, { quoted: msg });

    } catch (error) {
        console.error(error);
        sock.sendMessage(from, { text: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.' }, { quoted: msg });
    }
}


  }
};

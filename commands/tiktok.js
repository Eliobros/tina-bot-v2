module.exports = {
  name: "tiktok",
  description: "Baixa vídeos do TikTok",
  async execute(sock, { msg, args, from, pushName }) {

    if (text.startsWith('/tiktok')) {
    const args = text.split(' '); // Divide o comando em partes
    const url = args[1]; // Obtém a URL do TikTok
    
    if (!url || !url.includes('tiktok.com')) {
        return sock.sendMessage(from, { 
            text: 'Por favor, forneça um link válido do TikTok no formato: /tiktok <URL_DO_VIDEO>'
        });
    }

    sock.sendMessage(from, { 
        text: 'Aguarde um momento, estou processando seu vídeo...' 
    });

    try {
        const { tikmate } = require('./dono/tiktok.js');
        tikmate(url).then(data => {
            if (data.success) {
                sock.sendMessage(from, {
                    video: { url: data.video.noWatermark },
                    caption: `_*Aqui está o seu vídeo do TikTok:*_\n*Pedido por:* _${pushName}_\n*Baixado por:* _${NomeDoBot}_`
                }, { quoted: selo });
            } else {
                sock.sendMessage(from, {
                    text: `Erro ao processar o vídeo: ${data.error}`
                });
            }
        }).catch(err => {
            console.error(err);
            sock.sendMessage(from, {
                text: 'Desculpe, ocorreu um erro ao baixar o vídeo.'
            });
        });
    } catch (error) {
        console.error(error);
        sock.sendMessage(from, {
            text: 'Houve um erro interno. Por favor, tente novamente mais tarde.'
        });
    }
}
  }
};
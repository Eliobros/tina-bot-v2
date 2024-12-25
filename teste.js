const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// Coloque seu Client ID do Imgur
const CLIENT_ID = 'YOUR_IMGUR_CLIENT_ID';

const sock = makeWALegacySocket();

// Função para fazer upload da imagem para o Imgur
async function uploadToImgur(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);

  const formData = new FormData();
  formData.append('image', imageBuffer.toString('base64'));

  try {
    const response = await axios.post('https://api.imgur.com/3/upload', formData, {
      headers: {
        'Authorization': `Client-ID ${CLIENT_ID}`,
      },
    });

    return response.data.data.link;  // Retorna o link da imagem carregada
  } catch (error) {
    console.error('Erro ao enviar a imagem:', error);
  }
}

// Função para lidar com mensagens recebidas
sock.ev.on('messages.upsert', async (message) => {
  const msg = message.messages[0];
  const text = msg.message.conversation;

  // Verifica se o comando é /imgLink
  if (text.startsWith("/imgLink")) {
    const { message, key } = msg;

    // Verifica se a mensagem contém uma imagem
    if (message.imageMessage) {
      const imageUrl = message.imageMessage.url;  // Obtém a URL da imagem
      try {
        const imageBuffer = await sock.downloadMediaMessage(msg); // Baixa a imagem

        // Cria a pasta temporária caso ela não exista
        const tempDir = './temp';
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        // Salva a imagem no diretório temporário para fazer upload
        const imagePath = `${tempDir}/temp-image.jpg`;
        fs.writeFileSync(imagePath, imageBuffer);

        // Faz o upload para o Imgur
        const imgurLink = await uploadToImgur(imagePath);
        
        // Envia o link de volta para o usuário
        await sock.sendMessage(msg.key.remoteJid, { text: `Aqui está o link da sua imagem: ${imgurLink}` });

        // Apaga o arquivo temporário após o uso
        fs.unlinkSync(imagePath);
      } catch (error) {
        await sock.sendMessage(msg.key.remoteJid, { text: "Houve um erro ao processar a imagem. Tente novamente." });
      }
    } else {
      // Caso o usuário não envie uma imagem, avisa sobre o erro
      await sock.sendMessage(msg.key.remoteJid, { text: "Por favor, envie uma imagem para gerar o link." });
    }
  }
});
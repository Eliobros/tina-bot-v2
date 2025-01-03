//comando pra converter imagem em figurinhas

const fs = require('fs');
const { writeFile } = fs.promises;
const sharp = require('sharp'); // Instale com `npm install sharp`

if (text.startsWith("/sticker")) {
  if (messageType === "imageMessage") {
    try {
      const imageId = message.message.imageMessage.id;
      const stream = await sock.downloadMediaMessage(message);
      const buffer = await streamToBuffer(stream);

      // Converter para figurinha
      const stickerBuffer = await sharp(buffer)
        .resize(512, 512) // Tamanho padrão para figurinhas
        .webp() // Converte para formato WebP
        .toBuffer();

      // Enviar a figurinha
      await sock.sendMessage(from, {
        sticker: stickerBuffer
      });

    } catch (error) {
      await sock.sendMessage(from, {
        text: "Ocorreu um erro ao converter a imagem em figurinha."
      });
      console.error("Erro na conversão:", error);
    }
  } else {
    await sock.sendMessage(from, {
      text: "Por favor, envie uma imagem junto com o comando /sticker."
    });
  }
}

// Função para converter stream em buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
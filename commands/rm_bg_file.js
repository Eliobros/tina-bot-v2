module.exports = {
  name: "rm_bg_file",
  description: "Remove o fundo de imagem",
  author: "Eliobros Tech ",
  async execute(sock, {
    msg,isBot, from, isGroupMsg,isGroupAdmins,pushName
 , API_KEY,}){
    async function processImage(filePath, from, sock) {
    // Processa a imagem do arquivo local e envia a resposta
    const apiEndpoint = "https://api.example.com/remove-background"; // Exemplo de endpoint para remoção de fundo
    const form = new FormData();
    form.append("image", fs.createReadStream(filePath));

    try {
      const response = await axios.post(apiEndpoint, form, {
        headers: {
          ...form.getHeaders(),
          "Authorization": `Bearer ${API_KEY}`,
        },
      });

      const outputFilePath = path.join(__dirname, "images_bg", `${Date.now()}_output.png`);
      fs.writeFileSync(outputFilePath, response.data);

      await sock.sendMessage(from, {
        text: "Remoção de fundo concluída. Aqui está a sua imagem:",
        media: { url: outputFilePath },
      });
    } catch (error) {
      console.error("Erro ao processar a imagem:", error);
      await sock.sendMessage(from, { text: "Houve um erro ao processar a imagem. Tente novamente mais tarde." });
    }
  }

  }
}
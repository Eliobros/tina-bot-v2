async function processImageUrl(url, from, sock) {
    // Processa a imagem a partir de uma URL
    const apiEndpoint = "https://api.example.com/remove-background"; // Exemplo de endpoint para remoção de fundo
    const form = new FormData();
    form.append("image_url", url);

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
      console.error("Erro ao processar a URL da imagem:", error);
      await sock.sendMessage(from, { text: "Houve um erro ao processar a imagem. Tente novamente mais tarde." });
    }
  }

module.exports = {
  name: "suporte",
  description: "Envia uma mensagem de suporte ao dono",
  async execute(sock, { from, pushName, args }) {
    if (text.startsWith('/suporte')) {
  const mensagemSuporte = text.slice(9).trim();
  const pushName = msg.pushName || "Usuário";

  if (mensagemSuporte.length > 0) {
    const textoMensagem = `Olá meu senhor, o ${pushName} relatou um problema e disse: ${mensagemSuporte}`;

    try {
      // Envia a mensagem para o dono do bot
      await sock.sendMessage(donoBot + "@s.whatsapp.net", { text: textoMensagem });
      
      // Responde ao usuário
      await sock.sendMessage(from, { text: '✅️ Sua mensagem de suporte foi enviada para o dono!' });
      
      // Reage à mensagem
      await sock.sendMessage(from, { react: { text: "✅️", key: msg.key } });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      await sock.sendMessage(from, { text: 'Houve um erro ao tentar enviar sua mensagem de suporte. Tente novamente mais tarde.' });
    }
  } else {
    await sock.sendMessage(from, { text: '❌️ Por favor, forneça uma descrição do problema após o comando /suporte.' });
    await sock.sendMessage(from, { react: { text: "❌️", key: msg.key } });
  }
  return;
    }
  }
}
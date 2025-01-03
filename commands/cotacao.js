module.exports = {
  name: "cotacao",
  description: "Mostra a cotação de moedas",
  async execute(sock, { msg, args, from }) {
    // Sua chave da API CurrencyLayer
const apiKey = 'fd6ef798342431092b9b2580904cb1d8';
const url = (source) => `http://apilayer.net/api/live?access_key=${apiKey}&currencies=EUR,GBP,CAD,PLN,MZN&source=${source}&format=1`;

// Lógica do comando no estilo `if (text.startsWith("/cotacao"))`
if (text.startsWith("/cotacao")) {
  const args = text.split(' ');  // Divide a mensagem para pegar o comando e o parâmetro (moeda)
  const source = args[1]?.toUpperCase();  // A moeda fornecida após o comando (ex: USD, EUR)

  if (source) {
    // Função para obter a cotação da moeda
    async function obterCotacao(source) {
      try {
        const resposta = await axios.get(url(source));
        const cotacoes = resposta.data.quotes;

        const respostaFormatada = `
╭━━━❀ TINA BOT - OFICIAL ❀━━━╮
│╭━━━──────────────━━━╮
│╎
││❯              〘 COTAÇÃO 〙
│╎
│╎ 𖢈Moeda: ${source}/GBP
│╎ 𖢈Valor Atual: ${cotacoes[`${source}GBP`]}
│╎
│╎ 𖢈Moeda: ${source}/EUR
│╎ 𖢈Valor Atual: ${cotacoes[`${source}EUR`]}
│╎
│╎ 𖢈Moeda: ${source}/CAD
│╎ 𖢈Valor Atual: ${cotacoes[`${source}CAD`]}
│╎
│╎ 𖢈Moeda: ${source}/PLN
│╎ 𖢈Valor Atual: ${cotacoes[`${source}PLN`]}
│╎
│╎ 𖢈Moeda: ${source}/MZN
│╎ 𖢈Valor Atual: ${cotacoes[`${source}MZN`]}
│╎
│╰━━────────────────━━╯
╰━━━━━━━━━━━━━━━━━━━━━━╯
        `;

        // Enviar a resposta formatada no WhatsApp (supondo que você tenha o `conn.sendMessage` configurado)
        sock.sendMessage(messages.key.remoteJid, respostaFormatada, { quoted: messages});

      } catch (erro) {
        console.error('Erro ao obter cotação:', erro);
        sock.sendMessage(messages.key.remoteJid, 'Erro ao buscar a cotação.', { quoted: messages });
      }
    }

    // Chamar a função para obter a cotação
    obterCotacao(source);
  } else {
    // Se a moeda não for fornecida
    sock.sendMessage(messages.key.remoteJid, 'Por favor, forneça a moeda. Exemplo: /cotacao USD', { quoted: messages });
  }
}
  }
};
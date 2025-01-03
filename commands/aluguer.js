//comamdo aluguer do bot com preços 

// commands/aluguel.js
module.exports = {
  name: "aluguel",
  description: "Mostra informações sobre aluguel do bot",
  async execute(sock, { msg, from, pushName, groupName }) {

    if (text.startsWith("/aluguel")) {
  // Adiciona um emoji de carrinho como reação (se for suportado)
  await sock.sendMessage(from, { react: { text: "🛒", key: msg.key } });

  // Envia a mensagem sobre os planos de aluguel
  sock.sendMessage(from, {
    text: `
=============================
| *ALUGUEL DO BOT* 🛒       |
=============================
===== ${NomeDoBot} =====
- 🛒 Usuário: @${pushName}
- 🛒 Grupo: ${groupName}

*📌 ALUGUE SEU BOT AQUI 📌*
*💲 PLANOS:*

- 1 DIA = R$10
- 3 DIAS = R$15
- 7 DIAS = R$20
- 15 DIAS = R$25
- 30 DIAS = R$30
- 60 DIAS = R$60
- 90 DIAS = R$90
- 120 DIAS = R$128

=============================
| ${NomeDoBot} - Chave Keys|
*Atualmente indisponível, talvez na próxima atualização.*
=============================
`
  });
} else if (text.startsWith("/infoaluguer")) {
  // Envia informações detalhadas sobre aluguel
  sock.sendMessage(from, {
    text: `
|=== INFORMAÇÕES SOBRE ALUGAR O BOT ===|

Olá, *${pushName}*.
Está perdido sobre como alugar o bot para seu grupo? Vou te ajudar!

1️⃣ Digite *${prefix}aluguel* para ver a lista de preços.
2️⃣ Escolha o plano que mais se adapta às suas necessidades.

📌 *FORMAS DE PAGAMENTO:*
- PayPal: habibosalimo0@gmail.com
- Pix: [habibosalimo0@gmail.com]
- M-Pesa (Moçambique): 841617651
- E-Mola (Moçambique): 862840075

⚠️ *Após o pagamento*:
Envie o comprovante para o *dono do bot* (${NumeroDono}) no privado para validar a compra e liberar o bot.

*Obrigado por escolher ${NomeDoBot}!*
`
  });
    }
  }
};

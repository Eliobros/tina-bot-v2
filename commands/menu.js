module.exports = {
  name: "menu",
  description: "Mostra o menu de comandos",
  async execute(sock, { from, pushName, groupName, totalParticipants, formattedDate, formattedTime }) {
    // Sua lógica existente do comando menu aqui
    // Todo o código que estava dentro do else if (text === "/menu") ...
    if (text === "/menu") {
        // Comando /help
        const helpMessage = `
        ⌈🔰 ${NomeDoBot} OFC(V1.2.0) 🔰⌋

⟅✨ 𝑩𝑶𝑨𝑺-𝑽𝑰𝑵𝑫𝑨𝑺, ${pushName}! 🎅✨⟆

╭───────────────
│𖡋 🎄 GRUPO: ${groupName}
│𖡋 🎄 𝙉𝙄𝘾𝙆: @${pushName}
│𖡋 🎅 𝘿𝘼𝙏𝘼: ${formattedDate}
│𖡋 ⏰ 𝙃𝙊𝙍𝘼: ${formattedTime}
│𖡋 🎉 𝙐𝙎𝙐Á𝙍𝙄𝙊𝙎: ${totalParticipants} 
╰───────────────

🎅 𝑴𝑬𝑵𝑼 𝑫𝑬 𝑪𝑶𝑴𝑨𝑵𝑫𝑶𝑺 🎄

╭───────────────
│ ❄️ 🎄 /help
│ ❄️ 💝 /ban
│ ❄️ ☯️ /rebaixar
│ ❄️ ☯️ /promover
│ ❄️ ☯️ /rm_bg_file (remover fundo pela foto)
│ ❄️ ☯️ /rm_bg_url (remover fundo pela url da imagem)
│ ❄️ ☯️ /Tina
│ ❄️ ☯️ /play
│ ❄️ ☯️ /menu
│ ❄️ ☯️ /ping
│ ❄️ ☯️ /bug
│ ❄️ ☯️ /sugestão
│ ❄️ ☯️ /avalie
│ ❄️ ☯️ /suporte
│ ❄️ ☯️ /aluguel (pra alugar o bot)
│ ❄️ ☯️ /totalcmd (numero total de comandos disponiveis)
│ ❄️ ☯️ /figucmd (informações sobre como usar o comando de figurinhas)
│ ❄️ ☯️ #criarImagem(palavra chave)
╰───────────────

🔰🥱𝑨𝑷𝑹𝑬𝑪𝑰𝑬 𝑶 𝑴𝑨𝑮𝑰𝑪𝑶 𝑫𝑶 𝑵𝑨𝑻𝑨𝑳 𝑪𝑶𝑴 A TINA BOT🎅 
         `;
        await sock.sendMessage(from, { text: helpMessage });
    }
  }
};
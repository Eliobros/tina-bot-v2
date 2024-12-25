const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { playCommand } = require('./commands/play');
const { handleButton } = require('./commands/buttons');

const pino = require("pino");
const readline = require("readline");
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const { format } = require("date-fns"); // Para formatar data e hora
const { NomeDoBot, NomeDono, API_KEY, CLIENT_ID } = require("./config"); // Importando do config.js

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState(path.resolve(__dirname, "auth"));
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: state,
  });

  if (!sock.authState.creds.registered) {
    console.log("Configuração inicial necessária!");
    rl.question("Digite seu número de telefone (com código do país): ", async (number) => {
      const code = await sock.requestPairingCode(number);
      console.log(`Código de pareamento gerado: ${code}`);
      rl.close();
    });
  }

  sock.ev.on("connection.update", (update) => {
    const { connection } = update;
    if (connection === "open") {
      console.log("Bot conectado com sucesso!");
    } else if (connection === "close") {
      console.log("Conexão encerrada. Tentando reconectar...");
      connect();
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // Processamento de mensagens
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const sender = isGroup ? msg.key.participant : from;
    const pushName = msg.pushName || "Usuário Desconhecido";
    const messageType = Object.keys(msg.message)[0];
    const text = msg.message.conversation || msg.message[messageType]?.caption || "";

      // Nome do grupo e número de participantes
  let groupName = "";
  let totalParticipants = 0;
  if (isGroup) {
    const group = await sock.groupMetadata(from);
    groupName = group.subject || "Grupo Desconhecido";
    totalParticipants = group.participants.length; // Conta o número total de participantes no grupo
  }

    // Formatação de data e hora
    const now = new Date();
    const formattedDate = format(now, "dd MMMM yyyy");
    const formattedTime = format(now, "HH:mm");

    // Monitoramento no terminal
    console.log(`===== TINA BOT V1 =====
Usuário: ${pushName}
Data: ${formattedDate}
Hora: ${formattedTime}
Tipo de mensagem: ${text.startsWith("/") ? "Comando" : "Mensagem"}
Local da mensagem: ${isGroup ? "Grupo" : "Privado"}
Comando: ${text.startsWith("/") ? text : "N/A"}
Grupo: ${groupName}
Mensagem: ${text}
By: ${NomeDono}
=========================`);

    if (text.startsWith("/")) {
      if (text === "/") {
        // Reage com ❌️ se o comando for apenas "/"
        await sock.sendMessage(from, 
                               { react: { text: "❌️", key: msg.key } });

        sock.sendMessage(from, {
          text: `Olá, ${pushName} Parece que goce digitou o comando incorretamente, por favor verifique o comando e tente novamento ou digite /menu pra ver a lista de comandos.`,
        })        // Caminho do áudio
        const audioPath = path.join(__dirname, "audios_bot", "erro_comando.mp3");

        // Verifica se o arquivo de áudio existe antes de enviar
        if (fs.existsSync(audioPath)) {
          await sock.sendMessage(from, {
            audio: { url: audioPath },
            mimetype: "audio/mpeg",
            ptt: true, // Define como mensagem de áudio (PTT)
          });
        } else {
          console.error("Arquivo de áudio não encontrado:", audioPath);
          await sock.sendMessage(from, {
            text: "Erro ao enviar o áudio. Arquivo não encontrado no servidor.",
          });
        }
      } else if (text.startsWith("/rm_bg_file")) {
        // Comando /rm_bg_file
        if (messageType === "imageMessage") {
          await sock.sendMessage(from, { text: "Processando sua imagem... 0%" });

          const buffer = await sock.downloadMediaMessage(msg);
          const tempFilePath = path.join(__dirname, "images_bg", `${Date.now()}_input.jpg`);
          fs.writeFileSync(tempFilePath, buffer);

          await processImage(tempFilePath, from, sock);
        } else {
          await sock.sendMessage(from, { text: "Envie uma imagem junto com o comando." });
        }
      } else if (text.startsWith("/rm_bg_url")) {
        // Comando /rm_bg_url
        const url = text.split(" ")[1]; // Captura a URL fornecida após o comando
        if (url) {
          await sock.sendMessage(from, { text: "Processando sua imagem da URL... 0%" });

          await processImageUrl(url, from, sock);
        } else {
          await sock.sendMessage(from, { text: "Por favor, forneça uma URL de imagem após o comando." });
        }
      } else if (text.startsWith("/play ")) {
        const term = text.replace("/play ", "");
        await playCommand(client, messages, term);
      } else if (message.message.buttonsResponseMessage) {
        await handleButton(client, message);
      } else if (text === "/menu") {
        // Comando /help
        const helpMessage = `
        ⌈🔰 ${NomeDoBot} OFC(V1.2.0) 🔰⌋

⟅✨ 𝑩𝑶𝑨𝑺-𝑽𝑰𝑵𝑫𝑨𝑺, ${pushName}! 🎅✨⟆

╭───────────────
│𖡋 🎄 GRUPO: ${groupName}
│𖡋 🎄 𝙉𝙄𝘾𝙆: ${pushName}
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
│ ❄️ ☯️ /bug
│ ❄️ ☯️ /sugestão
│ ❄️ ☯️ /avalie
│ ❄️ ☯️ /suporte
│ ❄️ ☯️ /comprarbot (pra comprar o bot)
│ ❄️ ☯️ /totalcmd (numero total de comandos disponiveis)
│ ❄️ ☯️ /figucmd (informações sobre como usar o comando de figurinhas)
│ ❄️ ☯️ #criarImagem(palavra chave)
╰───────────────

🔰🥱𝑨𝑷𝑹𝑬𝑪𝑰𝑬 𝑶 𝑴𝑨𝑮𝑰𝑪𝑶 𝑫𝑶 𝑵𝑨𝑻𝑨𝑳 𝑪𝑶𝑴 A TINA BOT🎅 
         `;
        await sock.sendMessage(from, { text: helpMessage });
      } else if (text.startsWith("/ban")) {
        // Comando /ban
        if (isGroup) {
          const target = msg.message.conversation.split(" ")[1]; // Captura o @usuario após o comando
          if (target) {
            // Verifica se o bot tem permissões de administrador
            const groupMetadata = await sock.groupMetadata(from);
            const groupAdmins = groupMetadata.participants.filter((participant) => participant.admin !== null).map((admin) => admin.id);

            if (!groupAdmins.includes(sock.user.id)) {
              await sock.sendMessage(from, { text: "O bot precisa ser administrador do grupo para executar esse comando." });
            } else {
              const targetJid = target.replace("@", "") + "@c.us"; // Formato de JID para banir
              await sock.groupParticipantsUpdate(from, [targetJid], 'remove');
              await sock.sendMessage(from, { text: `Usuário ${target} foi banido do grupo.` });
            }
          } else {
            await sock.sendMessage(from, { text: "Por favor, mencione o usuário que deseja banir." });
          }
        } else {
          await sock.sendMessage(from, { text: "Esse comando só pode ser usado em grupos." });
        }
      } else if (text.startsWith("/rebaixar")) {
        // Comando /rebaixar
        if (isGroup) {
          const target = msg.message.conversation.split(" ")[1]; // Captura o @usuario após o comando
          if (target) {
            // Verifica se o bot tem permissões de administrador
            const groupMetadata = await sock.groupMetadata(from);
            const groupAdmins = groupMetadata.participants.filter((participant) => participant.admin !== null).map((admin) => admin.id);

            if (!groupAdmins.includes(sock.user.id)) {
              await sock.sendMessage(from, { text: "O bot precisa ser administrador do grupo para executar esse comando." });
            } else {
              const targetJid = target.replace("@", "") + "@c.us"; // Formato de JID para rebaixar
              await sock.groupParticipantsUpdate(from, [targetJid], 'demote');
              await sock.sendMessage(from, { text: `Usuário ${target} foi rebaixado de administrador.` });
            }
          } else {
            await sock.sendMessage(from, { text: "Por favor, mencione o usuário que deseja rebaixar." });
          }
        } else {
          await sock.sendMessage(from, { text: "Esse comando só pode ser usado em grupos." });
        }
      } else if (text.startsWith("/promover")) {
        // Comando /promover
        if (isGroup) {
          const target = msg.message.conversation.split(" ")[1]; // Captura o @usuario após o comando
          if (target) {
            // Verifica se o bot tem permissões de administrador
            const groupMetadata = await sock.groupMetadata(from);
            const groupAdmins = groupMetadata.participants.filter((participant) => participant.admin !== null).map((admin) => admin.id);

            if (!groupAdmins.includes(sock.user.id)) {
              await sock.sendMessage(from, { text: "O bot precisa ser administrador do grupo para executar esse comando." });
            } else {
              const targetJid = target.replace("@", "") + "@c.us"; // Formato de JID para promover
              await sock.groupParticipantsUpdate(from, [targetJid], 'promote');
              await sock.sendMessage(from, { text: `Usuário ${target} foi promovido a administrador.` });
            }
          } else {
            await sock.sendMessage(from, { text: "Por favor, mencione o usuário que deseja promover." });
          }
        } else {
          await sock.sendMessage(from, { text: "Esse comando só pode ser usado em grupos." });
        }
      } else {
        await sock.sendMessage(from, { text: "Comando não reconhecido. Digite /help para ver os comandos disponíveis." });
      }
    }
});


  // Funções para processar as imagens

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
}

  const handleMessage = async (text, messageType, msg, from, sock) => {

    // Dentro da sua função connect(), onde está o handler de mensagens (sock.ev.on("messages.upsert")),
// adicione este trecho para o comando /suporte:

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
}else if (text.startsWith("/")) {
    if (text === "/sticker" || text === "/s") {
      // Verifica se a mensagem contém uma imagem
      if (messageType === "imageMessage") {
        await sock.sendMessage(from, { text: "Convertendo a imagem em figurinha..." });
        
        // Baixa a imagem enviada pelo usuário
        const buffer = await sock.downloadMediaMessage(msg);
        
        // Converte a imagem para sticker
        try {
          const sticker = await sock.sendMessage(from, {
            sticker: buffer
          });
          console.log("Imagem convertida em figurinha com sucesso!");
        } catch (error) {
          console.error("Erro ao converter imagem em figurinha:", error);
          await sock.sendMessage(from, { text: "Erro ao converter a imagem em figurinha. Tente novamente mais tarde." });
        }
      } else {
        await sock.sendMessage(from, { text: "Por favor, envie uma imagem junto com o comando para convertê-la em figurinha." });
      }
    }
  }
};

// Exemplo de como passar os parâmetros corretamente para a função:
const msg = {
  // Suponha que isso seja o objeto de mensagem recebido com a imagem
};
const from = 'userPhoneNumber'; // Número de telefone do remetente
const sock = {
  // Suponha que isso seja o objeto de conexão do bot, com métodos como sendMessage
  sendMessage: async (from, message) => { console.log(from, message); },
  downloadMediaMessage: async (msg) => { return Buffer.from("imageBuffer"); },
};

const messageType = "imageMessage"; // Tipo de mensagem (por exemplo, "imageMessage")
const text = "/sticker"; // O comando da mensagem

// Chamando a função handleMessage com os parâmetros corretamente
handleMessage(text, messageType, msg, from, sock);

//comando pra gerar link de imagem


// Coloque seu Client ID do 
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




// Inicia a conexão
connect();
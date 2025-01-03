
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import {  getDocs, setDoc, doc, collection } from 'firebase/firestore';

import { fileURLToPath} from 'url';
import { ptBR} from 'date-fns/locale' ; // Para formatar em português
import {format} from 'date-fns';
import {db} from './firebaseConfig.js';
 // Certifique-se de importar o Firebase corretamente

import pino from 'pino';
import readline from 'readline';
import {  makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
// Para formatar data e hora
import { NomeDoBot, NomeDono, API_KEY, CLIENT_ID, HOST_NAME, TEMPO_DE_EXECUCAO, NumeroDono, FraseDoDia, prefix, CanalConteudosBot, GIT_BOT, LINK_APP, IP_API_KEY} from './config.js'; // Importando do config.js

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função de conexão
async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState(path.resolve(__dirname, "auth"));
  const { version } = await fetchLatestBaileysVersion();
  console.log(`Baileys Version: ${version}`);
  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: state,
  });
async function sendGroupChatsToFirestore() {
  try {
    // Busca todos os grupos nos quais o bot está participando
    const groups = await sock.groupFetchAllParticipating({ timeoutMs: 60 * 1000 });

    // Converte o objeto de grupos em uma lista para facilitar a iteração
    const groupList = Object.values(groups);

    for (let group of groupList) {
      try {
        // Referência ao documento no Firestore
        const groupRef = doc(db, 'ChatGroups', group.id);

        // Envia os dados do grupo para o Firestore
        await setDoc(groupRef, {
          name: group.subject || 'Grupo Sem Nome',
          id: group.id,
          creator: group.creator || 'Desconhecido',
          membersCount: group.participants?.length || 0, // Número de participantes
          createdAt: group.creationTimestamp
            ? new Date(group.creationTimestamp * 1000).toISOString()
            : 'Data desconhecida',
        });

        console.log(`Grupo enviado: ${group.subject || 'Grupo Sem Nome'}`);
      } catch (groupError) {
        console.error(`Erro ao processar o grupo ${group.subject || 'Sem Nome'}:`, groupError);
      }
    }

    console.log(`Todos os grupos foram enviados! Total: ${groupList.length}`);
  } catch (error) {
    console.error('Erro ao enviar grupos para o Firestore:', error);
  }
}

// Função principal para conectar e chamar o envio
async function connect() {
  // Certifique-se de que o `sock` está conectado antes de chamar
  await sendGroupChatsToFirestore();
}

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
    //pegar o ip do usuario 
     const ip_user = await axios.get(`https://ipinfo.io/json?token=${IP_API_KEY}`);
    const ip = ip_user.data.ip;
    // Monitoramento no terminal
    console.log(`===== TINA BOT V1 =====
Usuário: @${pushName}
Data: ${formattedDate}
Hora: ${formattedTime}
Tipo de mensagem: ${text.startsWith("/") ? "Comando" : "Mensagem"}
Local da mensagem: ${isGroup ? "Grupo" : "Privado"}
Comando: ${text.startsWith("/") ? text : "N/A"}
Grupo: ${groupName}
Mensagem: ${text}
ip_user: ${ip}
By: ${NomeDono}
=========================`);

    // Obtém a hora atual uma vez
    const horaAtual = new Date().getHours();

    if (text.startsWith("Bom dia")) {
        if (horaAtual >= 6 && horaAtual < 12) {
            await sock.sendMessage(from, { text: `Bom dia, ${pushName}! Espero que tenha um ótimo dia!` });
        } else if (horaAtual >= 12 && horaAtual < 18) {
            await sock.sendMessage(from, { text: `Mas já é de tarde, ${pushName}! Boa tarde!` });
        } else {
            await sock.sendMessage(from, { text: `Mas já é de noite, ${pushName}! Boa noite!` });
        }
    } else if (text.startsWith("Boa tarde")) {
        if (horaAtual >= 12 && horaAtual < 18) {
            await sock.sendMessage(from, { text: `Boa tarde, ${pushName}! Espero que tenha uma ótima tarde!` });
        } else if (horaAtual >= 6 && horaAtual < 12) {
            await sock.sendMessage(from, { text: `Mas ainda é de manhã, ${pushName}! Bom dia!` });
        } else {
            await sock.sendMessage(from, { text: `Mas já é de noite, ${pushName}! Boa noite!` });
        }
    } else if (text.startsWith("Boa noite")) {
        if (horaAtual >= 18 && horaAtual < 24) {
            await sock.sendMessage(from, { text: `Boa noite, ${pushName}! Espero que tenha uma ótima noite!` });
        } else if (horaAtual >= 6 && horaAtual < 12) {
            await sock.sendMessage(from, { text: `Mas ainda é de manhã, ${pushName}! Bom dia!` });
        } else {
            await sock.sendMessage(from, { text: `Mas ainda é de tarde, ${pushName}! Boa tarde!` });
        }
    } else if (text.startsWith("Boa madrugada")) {
        if (horaAtual >= 0 && horaAtual < 6) {
            await sock.sendMessage(from, { text: `Boa madrugada, ${pushName}! Espero que tenha uma ótima madrugada!` });
        } else if (horaAtual >= 6 && horaAtual < 12) {
            await sock.sendMessage(from, { text: `Mas já é de manhã, ${pushName}! Bom dia!` });
        } else if (horaAtual >= 12 && horaAtual < 18) {
            await sock.sendMessage(from, { text: `Mas já é de tarde, ${pushName}! Boa tarde!` });
        } else {
            await sock.sendMessage(from, { text: `Mas já é de noite, ${pushName}! Boa noite!` });
        }
    }

    //CRIANDO O COMANDO PARA PEGAR O I

    //detectando a ausensia somente dono pode usar o comando
    if(text.startsWith("/on")){
      if(sender.includes(NumeroDono)){
        await sock.sendMessage(from, {text: `O bot está online!`});
      }else{
        await sock.sendMessage(from, {text: `Você não tem permissão para usar esse comando!`});
      }
    }

    /*criando a msg de ausencia e mesmo se a pessoa marcar o dono no grupo o bot dira que o dono esta ausente pelo motivo que o dono colocara
    eemplo o dono usa o comando assim /ausente indo trabalhar ai o bot respondera por eemplo claro meu senho agora o senhor esta indo ${ausencia_msg} entao quando o usuario marca o dono entao o bot respondera ola ${pushName} o meu dono esta ${ausencia_msg} 
    */

    if(text.startsWith("/ausente")){
      if(sender.includes(NumeroDono)){
        const ausencia_msg = text.replace("/ausente", "");
        await sock.sendMessage(from, {text: `Claro meu senho agora o senhor esta: ${ausencia_msg}`});
      }else if (sender.includes(!NumeroDono)){
        await sock.sendMessage(from, {text: `Você não tem permissão para usar esse comando!`});
      }
      //criando  a msg quando o usuario marcar o dono no grupo o bot respondera ola ${pushName} o meu dono esta ${ausencia_msg
      if(sender.includes(NumeroDono)){
        const ausencia_msg = text.replace("/ausente", "");
        await sock.sendMessage(from, {text: `Ola ${pushName} o meu dono esta: ${ausencia_msg} desde as ${formattedTime}`});
      }

    }

    if (text.startsWith("/movie-app")) {
    // Nome do app
    const movieAppName = "CineHub";

    // Mensagem inicial
    sock.sendMessage(from, {
        text: `Olá ${pushName}, aqui está o arquivo do nosso app de filme cujo nome é ${movieAppName} caso nao apareça o arquivo entao voce pode baixar pelo seguinte link
        ===============
        ${LINK_APP}`
    });

    // Caminho para o arquivo APK
    const filePath = "./appMovies/CineHub.apk"; // Substitua pelo caminho correto do arquivo .apk

    // Enviar o arquivo APK
    sock.sendMessage(from, {
        document: { url: filePath },
        mimetype: "application/vnd.android.package-archive", // Tipo MIME para arquivos APK
        fileName: `${movieAppName}.apk`
    }).then(() => {
        console.log("Arquivo enviado com sucesso!");
    }).catch((error) => {
        console.error("Erro ao enviar o arquivo:", error);
    });
}

if (text.startsWith("/registro")) {
  const args = text.split(" ")[1];

  if (!args || !args.includes("/")) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `Formato inválido! Use: /registro nome/data_de_nascimento.`
    });
  }

  const [nome, dob] = args.split("/");

  try {
    const userId = msg.key.participant; // ID único do usuário no WhatsApp

    // Verificar se o usuário já está registrado pelo ID
    const userDoc = await db.collection("users").doc(userId).get();

    if (userDoc.exists) {
      // Usuário já registrado
      const userData = userDoc.data();
      return await sock.sendMessage(msg.key.remoteJid, {
        text: `Você já está registrado como ${userData.nome}, usuário número ${userData.numero_de_usuario}.`
      });
    }

    // Obter referência do contador no Firestore
    const counterRef = db.collection("counters").doc("userCounter");

    // Transação para atualizar o contador de forma segura
    const userNumber = await db.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);

      if (!counterDoc.exists) {
        // Criar o contador se não existir
        transaction.set(counterRef, { count: 1 });
        return 1;
      }

      const newCount = counterDoc.data().count + 1;
      transaction.update(counterRef, { count: newCount });
      return newCount;
    });

    // Criar registro do usuário com o ID do WhatsApp
    await db.collection("users").doc(userId).set({
      nome: nome.trim(),
      data_de_nascimento: dob.trim(),
      id: userId, // ID único do contato no WhatsApp
      numero_de_usuario: userNumber
    });

    // Responder ao usuário
    await sock.sendMessage(msg.key.remoteJid, {
      text: `Parabéns ${pushName}, você acabou de efetuar o registro e você é o usuário número ${userNumber}.`
    });
  } catch (error) {
    console.error("Erro ao registrar usuário: ", error);
    await sock.sendMessage(msg.key.remoteJid, {
      text: `Houve um erro ao registrar o usuário. Por favor, tente novamente mais tarde.`
    });
  }
}
if (text.startsWith("/gemini")) {
  try {
    // Enviar reação ao comando
    await sock.sendMessage(from, { react: { text: "🌐", key: info.key } });

    // Extrair o prompt
    const q = text.replace("/gemini", "").trim();
    if (!q) {
      return sock.sendMessage(from, {
        text: `Por favor, defina um prompt.\n\nExemplo de uso: /gemini Qual é a capital da Rússia?`,
      });
    }

    // Sanitizar o prompt e fazer a requisição à API Gemini
    const sanitizedPrompt = encodeURIComponent(q);
    const geminiResponse = await fetchJson(
      `https://eliasar-yt-api.vercel.app/api/ia/gemini?prompt=${sanitizedPrompt}`
    );

    // Verificar se a resposta é válida
    if (geminiResponse && geminiResponse.content) {
      await sock.sendMessage(from, { text: geminiResponse.content });
    } else {
      throw new Error("Resposta inválida da API");
    }
  } catch (e) {
    console.error(`[Erro no Comando /gemini]`, e);

    // Mensagem de erro para o usuário
    await sock.sendMessage(from, {
      text: "Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.",
    });

    // Mensagem ao dono
     // Número do dono
    await sock.sendMessage(`${NumeroDono}`, {
      text: `Oi, mestre. Desculpa incomodar, mas ocorreu um erro aqui.\n\nComando: /gemini\nErro: ${String(e)}`,
    });
  }
}

    if (text.startsWith("/like")) {
  const args = text.split(" ");
  const q = args[1]; // ID fornecido após o comando
  if (!q) return sock.sendMessage(from, { text: "Informe o ID que deseja enviar os likes após o comando." });

  await sock.sendMessage(from, { text: "> ⚙️ Enviando likes... ⏳" });

  try {
    const consulta = await fetchJson(`https://mdzapis.com/api/like/${q}?apikey=SuaApiKey`);

    if (consulta.error) {
      return sock.sendMessage(from, { text: `Erro: ${consulta.message}` });
    }

    const { Name, Level, Region, "Likes before": likesAntes, "Likes later": likesAgora, Speed, Bot_Send } = consulta;

    const respostaFormatada = `👤 • Nome: ${Name}
🎖️ • Level: ${Level}
🆔 • ID: ${q}
🌍 • Região: ${Region}
📊 • Likes Antes: ${likesAntes}
🔄 • Likes Agora: ${likesAgora}
📌 • Likes Enviados: ${Bot_Send}
⚡ • Velocidade: ${Speed}
💻 • Nosso Painel: Args • Bot`;

    const imageUrl = 'https://files.catbox.moe/xghdlt.jpg';
    await sock.sendMessage(from, {
      image: { url: imageUrl },
      caption: respostaFormatada,
    });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(from, { text: "❌ Ocorreu um erro ao enviar likes." });
  }
}
    if (text.startsWith("/Hora")) {
  // Enviar reação
  await sock.sendMessage(from, {
    react: { text: "🕒", key: msg.key }
  });

  // Obter hora formatada para Moçambique
  const now = new Date();
  const options = { timeZone: "Africa/Maputo", hour: "2-digit", minute: "2-digit" };
  const formattedTime = now.toLocaleTimeString("pt-BR", options);

  // Enviar mensagem de texto
  await sock.sendMessage(from, {
    text: `Olá, ${pushName}! Agora são ${formattedTime} horas em Moçambique.`
  });
}

    // Importa a função format do date-fns



if (text.startsWith("/Data")) {
  // Enviar reação
  sock.sendMessage(from, {
    react: { text: "📅", key: msg.key }
  });

  // Obter a Data formatada
  const now = new Date();
  const formattedDate = format(now, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }); // Formato em português

  // Enviar mensagem de texto ao usuário
  await sock.sendMessage(from, {
    text: `Olá, ${pushName}, hoje é dia ${formattedDate}.`
  });
}


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
// Sua chave da API CurrencyLayer
const apiKey = 'fd6ef798342431092b9b2580904cb1d8';
const url = (source) => `http://apilayer.net/api/live?access_key=${apiKey}&currencies=EUR,GBP,CAD,PLN,MZN&source=${source}&format=1`;

// Lógica do comando no estilo if (text.startsWith("/cotacao"))
if (text.startsWith("/cotacao")) {
  const args = text.split(' ');  // Divide a mensagem para pegar o comando e o parâmetro (moeda)
  const source = args[1]?.toUpperCase();  // A moeda fornecida após o comando (ex: USD, EUR)

  if (source) {
    // Função para obter a cotação da moeda

    // Chamar a função para obter a cotação
    obterCotacao(source);
  } else {
    // Se a moeda não for fornecida
    sock.sendMessage(messages.key.remoteJid, 'Por favor, forneça a moeda. Exemplo: /cotacao USD', { quoted: messages });
  }
}
  if (text.startsWith("/admins")) {
  if (isGroupMsg) {
    if (isGroupAdmins) {
      try {
        const groupMetadata = await sock.groupMetadata(from); // Obtém os dados do grupo
        const admins = groupMetadata.participants.filter(participant => participant.admin === 'admin'); // Filtra os administradores

        // Mapeia os administradores e usa o nome, se disponível, ou o ID
        const adminList = admins.map((admin, index) => {
          const name = admin.notify || admin.id.split('@')[0]; // Usa o nome de exibição, se disponível
          return `${index + 1}. ${name}`;
        }).join("\n");

        // Envia a resposta com a lista de administradores
        await sock.sendMessage(from, {
          text: `Olá ${pushName}, aqui está a lista dos administradores do grupo:

=== LISTA DE ADMINS ===
${adminList}`

        });
      } catch (error) {
        console.error("Erro ao obter administradores: ", error);
        await sock.sendMessage(from, {
          text: `Desculpe, ocorreu um erro ao tentar listar os administradores.`
        });
      }
    } else {
      await sock.sendMessage(from, {
        text: `Você não tem permissão para ver a lista de administradores!`
      });
    }
  } else {
    await sock.sendMessage(from, {
      text: `Este comando só pode ser usado em grupos!`
    });
  }
}

if(text.startsWith("/git-bot")){
  sock.sendMessage(from,{
    text:`Ola ${pushName} voce pode acessar ao repositório git do bot pelo seguinte url ${GIT_BOT}, nota que os arquivos estao criptografado e se quiser um bot limpo e editdavel fale com meu dono ${NumeroDono}`
  })
}else

    if (text.startsWith("/aluguel")) {
  // Adiciona um emoji de carrinho como reação (se for suportado)
  await sock.sendMessage(from, { react: { text: "🛒", key: msg.key } });

  // Envia a mensagem sobre os planos de aluguel
  sock.sendMessage(from, {
    text: `
=============================
| ALUGUEL DO BOT 🛒       |
=============================
===== ${NomeDoBot} =====
- 🛒 Usuário: @${pushName}
- 🛒 Grupo: ${groupName}

📌 ALUGUE SEU BOT AQUI 📌
💲 PLANOS:

1 DIA = R$10
3 DIAS = R$15
7 DIAS = R$20
15 DIAS = R$25
30 DIAS = R$30
60 DIAS = R$60
90 DIAS = R$90
120 DIAS = R$128
=============================
| ${NomeDoBot} - Chave Keys|
Atualmente indisponível, talvez na próxima atualização.
=============================

 ` });
} else if (text.startsWith("/infoaluguer")) {
  // Envia informações detalhadas sobre aluguel
  sock.sendMessage(from, {
    text:`
|=== INFORMAÇÕES SOBRE ALUGAR O BOT ===|

Olá, ${pushName}.
Está perdido sobre como alugar o bot para seu grupo? Vou te ajudar!

1️⃣ Digite ${prefix}aluguel para ver a lista de preços.
2️⃣ Escolha o plano que mais se adapta às suas necessidades.

📌 FORMAS DE PAGAMENTO:
- PayPal: habibosalimo0@gmail.com
- Pix: [habibosalimo0@gmail.com]
- M-Pesa (Moçambique): 841617651
- E-Mola (Moçambique): 862840075

⚠️ Após o pagamento:
Envie o comprovante para o dono do bot (${NumeroDono}) no privado para validar a compra e liberar o bot.

Obrigado por escolher ${NomeDoBot}!

  `});
    }else

    if(text.startsWith("Prefixo", "prefixo","prefix","Prefix")){
  sock.sendMessage(from, { text: `Ola @${pushName} aqui está o prefixo do bot: ${prefix}`});
}else if(text.startsWith("/infobot")){
  sock.sendMessage(from, {
    text: `
    |====== INFORMAÇÕES DO BOT ======|
    |-●Nome: ${NomeDoBot}
    |-●Criador: ${NomeDono}
    |-●Prefixo: ${prefix}
    |-●Host: ${HOST_NAME}
    |-●Canal: ${CanalConteudosBot}

    |============================|
  `  
  })
}else if (text.startsWith("Tina")) {
    // Verificar se message.key é válido
    if (messages.key && messages.key.remoteJid) {
        // Enviar reação
        await sock.sendMessage(from, { react: { text: "❤️", key: msg.key } });
    } else {
        console.error("Erro: message.key` está nulo ou inválido.");
    }


    // Enviar mensagem de texto
    await sock.sendMessage(from, { text: "Olá amor, você me chamou?" });

    // Enviar sticker
    await sock.sendMessage(from, { sticker: { url: "./figus/tina-chamou.webp" } });
}
// Função para formatar o tempo de atividade
function formatarTempo(tempoEmSegundos) {
  const horas = Math.floor(tempoEmSegundos / 3600); // 1 hora = 3600 segundos
  const minutos = Math.floor((tempoEmSegundos % 3600) / 60); // Resto da hora convertido para minutos
  const segundos = Math.floor(tempoEmSegundos % 60); // Resto dos segundos

  let tempoFormatado = '';

  if (horas > 0) {
    tempoFormatado += `${horas} hora${horas > 1 ? 's' : ''}`;
  }
  if (minutos > 0) {
    if (tempoFormatado) tempoFormatado += ' e ';
    tempoFormatado += `${minutos} minuto${minutos > 1 ? 's' : ''}`;
  }
  if (segundos > 0 && !tempoFormatado) {
    tempoFormatado = `${segundos} segundo${segundos > 1 ? 's' : ''}`;
  }
  if (segundos > 0 && tempoFormatado) {
    tempoFormatado +=  `e ${segundos} segundo${segundos > 1 ? 's' : ''}`;
  }

  return tempoFormatado;
}

// No seu código principal
const tempoFormatado = formatarTempo(`${TEMPO_DE_EXECUCAO}`/1000);

    if (text.startsWith("/dono")) {
  sock.sendMessage(from, {
    text: `👑* DONO DO BOT *
    *Olá @${pushName}, aqui estão as informações do meu dono*
    |-●Nome: ${NomeDono}
    |-●Número: ${NumeroDono}
    |-●NomeBot: ${NomeDoBot}
    |-●Prefixo: ${prefix}
    |-●Host: ${HOST_NAME}
    |-●Frase Do Dia: ${FraseDoDia}`

  });
}

// Função para o bot mandar o contato do dono
async function contactDono(client, message) {
  try {
    const contact = {
      displayName: NomeDono,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${NomeDono};;\nTEL:${NumeroDono}\nEND:VCARD`
    };

    await client.sendMessage(message.from, { contact: contact });
  } catch (error) {
    console.error('Erro ao enviar o contato:', error);
  }
}
    if (text.startsWith("/likeff")) {
    // Separar o comando e o argumento
    const args = text.trim().split(" ");

    if (args.length < 2 || args[1].trim() === "") {
        // Caso o ID do jogador não seja fornecido
        await sock.sendMessage(from, {
            text: "❲❗❳ Informe o Id do Jogador\nExemplo: /likeff 1989445071",
        });
    } else {
        const jogadorId = args[1].trim();

        // Enviar mensagem para o PV do usuário que usou o comando
        await sock.sendMessage(from, {
            text: "Enviando seus 100 likes, aguarde...",
        });

        // Resposta ao fornecer o ID no grupo
        await sock.sendMessage(from, {
            text: `Por questões de segurança, irei te enviar os dados no PV...\n\nLembrando que só é possível adicionar 100 likes por dia. Caso tente por mais 100 no mesmo dia, irá dar erro e os seus likes não irão cair!,`
        });
    }
}else if(text.startsWith("/ping")){
  await sock.sendMessage(from, { text: `
  ============================
  |-●Usuário: @${pushName}
  |-●Bot: ${NomeDoBot}
  |-●HOST: ${HOST_NAME}
  |-●Tempo de atividade: ${tempoFormatado}
  |-●Dono: ${NomeDono}
  |-●Grupo: ${groupName}
  ==========================`
  });
  }else if (text.startsWith("/")) {
      if (text === "/") {
        // Reage com ❌️ se o comando for apenas "/"
        await sock.sendMessage(from, 
                               { react: { text: "❌️", key: msg.key } });

        sock.sendMessage(from, {
          text: `Olá, @${pushName} Parece que voce digitou o comando incorretamente, por favor verifique o comando e tente novamento ou digite /menu pra ver a lista de comandos.,`
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
      }else if (text === "/menu") {
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
│ ❄️ ☯️ /movie-app (envia o apk do filme)
│ ❄️ ☯️ /aluguel (envia a lista do valores do bot)
│ ❄️ ☯️ /info-aluguer (envia as informações sobre o aluguer do bot)
│ ❄️ ☯️ /Data (mostra a data atual)
│ ❄️ ☯️ /Hora (mostra a hora atual)
│ ❄️ ☯️ /registro (para o usuario efetuar o registro n bot)
│ ❄️ ☯️ /git-bot (envia o link do repositório do bot)
│ ❄️ ☯️ /simi (faz uma pergunta para o bot)
│ ❄️ ☯️ /ausente (msg de ausencia do dono)
│ ❄️ ☯️ /on (para remover a msg de ausencia do dono)
│ ❄️ ☯️ /play
│ ❄️ ☯️ /menu
│ ❄️ ☯️ /ping
│ ❄️ ☯️ /bug
│ ❄️ ☯️ /gemini
│ ❄️ ☯️ /tiktok
│ ❄️ ☯️ /suporte
│ ❄️ ☯️ /comprarbot (pra comprar o bot)
│ ❄️ ☯️ /totalcmd (numero total de comandos disponiveis)
│ ❄️ ☯️ /figucmd (informações sobre como usa
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
              await sock.sendMessage(from, { text: `Usuário ${target} foi banido do grupo. `});
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
              await sock.sendMessage(from, { text:` Usuário ${target} foi promovido a administrador.` });
            }
          } else {
            await sock.sendMessage(from, { text: "Por favor, mencione o usuário que deseja promover." });
          }
        } else {
          await sock.sendMessage(from, { text: "Esse comando só pode ser usado em grupos." });
        }
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
          "Authorization": Bearer `${API_KEY},`
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
    const textoMensagem =`Olá meu senhor, o ${pushName} relatou um problema e disse: ${mensagemSuporte}`;

    try {
      // Envia a mensagem para o dono do bot
      await sock.sendMessage(donoBot + "@s.whatsapp.net", { text: textoMensagem });

    //Responde ao usuário
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
    throw error;
  }

}

connect();
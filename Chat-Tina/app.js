// Importar e inicializar Firebase
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

import { 
  getAuth, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBxml_34BiDbOmMxclzM-UnFzke9ymcf8A",
  authDomain: "tina-chat-87cc1.firebaseapp.com",
  projectId: "tina-chat-87cc1",
  storageBucket: "tina-chat-87cc1.firebasestorage.app",
  messagingSenderId: "518858413060",
  appId: "1:518858413060:web:86c6cb8f5094a9b5291151",
  measurementId: "G-CB39SE8MQZ"
};

// Inicializar Firebase, Auth e Firestore
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Verificar se o usuário está logado antes de carregar a página do chat
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Caso o usuário não esteja autenticado
    alert("Usuário não autenticado. Por favor, faça login.");
    window.location.href = "login.html"; // Redireciona para a página de login
  } else {
    // Caso o usuário esteja autenticado
    console.log("Usuário autenticado:", user.email);
    carregarMensagens(); // Chama a função para carregar as mensagens
  }
});

// Função para chamada à API Dify
async function sendMessageToAPI(userMessage) {
  const url = "https://api.dify.ai/v1/chat/completions";
  const apiKey = "SUA_API_KEY_AQUI"; // Substitua pela sua chave de API Dify
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  };
  const body = {
    inputs: { text: userMessage },
    user: auth.currentUser.uid, // UID do usuário como identificador único
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error("Erro na chamada da API Dify");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Erro ao se comunicar com a API Dify:", error);
    return null;
  }
}

// Enviar mensagem e salvar no Firestore
async function sendMessage() {
  const messageInput = document.getElementById('userMessage');
  const messageText = messageInput.value.trim();

  if (messageText !== "") {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    appendMessage('user', `Você: ${messageText}`, currentTime);
    await salvarMensagem('user', `Você: ${messageText}`, currentTime); // Salva mensagem do usuário
    messageInput.value = "";
    scrollToBottom();

    // Resposta do bot via API Dify
    const response = await sendMessageToAPI(messageText);
    if (response) {
      const botMessage = response.answer || 'Desculpe, não consegui entender sua pergunta.';
      appendMessage('bot', `Assistente Tina: ${botMessage}`, currentTime);
      await salvarMensagem('bot', `Assistente Tina: ${botMessage}`, currentTime); // Salva mensagem do bot
    } else {
      const errorMessage = 'Assistente Tina: Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.';
      appendMessage('bot', errorMessage, currentTime);
      await salvarMensagem('bot', errorMessage, currentTime); // Salva mensagem do bot
    }

    scrollToBottom();
  }
}

// Adicionar mensagens no chat
function appendMessage(sender, messageText, time) {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message', sender);

  const messageBubble = document.createElement('div');
  messageBubble.classList.add('message-bubble');
  messageBubble.textContent = messageText;

  const messageTime = document.createElement('span');
  messageTime.classList.add('message-time');
  messageTime.textContent = time;

  messageBubble.appendChild(messageTime);
  messageContainer.appendChild(messageBubble);

  const chatBox = document.getElementById('chatBox');
  if (chatBox) {
    chatBox.appendChild(messageContainer);
  }
}

// Salvar mensagem no Firestore
async function salvarMensagem(sender, messageText, time) {
  try {
    const user = auth.currentUser;
    const userMessagesDocRef = doc(db, "messages", user.uid);

    const docSnapshot = await getDoc(userMessagesDocRef);

    if (docSnapshot.exists()) {
      // Atualiza mensagens existentes
      await setDoc(userMessagesDocRef, {
        messages: [...docSnapshot.data().messages, { sender, message: messageText, time, timestamp: new Date() }]
      }, { merge: true });
    } else {
      // Cria novo documento
      await setDoc(userMessagesDocRef, {
        messages: [{ sender, message: messageText, time, timestamp: new Date() }]
      });
    }
  } catch (error) {
    console.error("Erro ao salvar a mensagem no Firestore:", error);
  }
}

// Carregar mensagens do Firestore
async function carregarMensagens() {
  try {
    const user = auth.currentUser;
    const userMessagesDocRef = doc(db, "messages", user.uid);
    const docSnapshot = await getDoc(userMessagesDocRef);

    if (docSnapshot.exists()) {
      const messages = docSnapshot.data().messages;
      messages.forEach(msg => {
        appendMessage(msg.sender, msg.message, msg.time);
      });
    } else {
      console.log("Não há mensagens armazenadas para este usuário.");
    }
  } catch (error) {
    console.error("Erro ao carregar as mensagens do Firestore:", error);
  }
}

// Rolagem automática para o final
function scrollToBottom() {
  const chatBox = document.getElementById('chatBox');
  if (chatBox) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

// Eventos para enviar mensagem
document.getElementById('sendMessage').addEventListener('click', sendMessage);
document.getElementById('userMessage').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
});
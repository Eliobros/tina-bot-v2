// Importar e inicializar Firebase
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification 
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

// Inicializar Firebase e Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Verificar sessão do usuário
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuário logado:", user.email);
    // Redireciona para a página do chat
    window.location.href = "chat.html";
  } else {
    console.log("Usuário não autenticado");
    // Mostra o formulário de autenticação
    document.getElementById("authSection").style.display = "block";
  }
});

// Função para login com Google
function loginWithGoogle() {
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      const user = result.user;
      alert(`Bem-vindo, ${user.displayName}!`);
      // Redireciona para a página do chat
      window.location.href = "chat.html";
    })
    .catch((error) => alert(error.message));
}

// Função para cadastro com e-mail/senha
function registerUser() {
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      sendEmailVerification(user).then(() => {
        alert("E-mail de verificação enviado!");
      });
      alert("Cadastro realizado com sucesso!");
      // Redireciona para a página do chat
      window.location.href = "chat.html";
    })
    .catch((error) => alert(error.message));
}

// Função para login com e-mail/senha
function loginUser() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      if (user.emailVerified) {
        alert("Login realizado com sucesso!");
        // Redireciona para a página do chat
        window.location.href = "chat.html";
      } else {
        alert("E-mail não verificado.");
      }
    })
    .catch((error) => alert(error.message));
}

// Eventos para os botões de autenticação
document.getElementById("loginBtn").addEventListener("click", loginUser);
document.getElementById("registerBtn").addEventListener("click", registerUser);
document.getElementById("googleLoginBtn").addEventListener("click", loginWithGoogle);
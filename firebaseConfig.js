import admin from "firebase-admin";
import { readFileSync } from "fs"; // Para carregar o JSON

// Carregar as credenciais do JSON
const serviceAccount = JSON.parse(
  readFileSync("./firebaseConfig.json", "utf8")
);

// Inicializar o Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Exportar o Firestore para ser usado no projeto
const db = admin.firestore();
export {db}
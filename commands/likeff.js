// commands/ping.js
module.exports = {
  name: "likeff",
  description: "Aumentar likes no Free Fire",
  async execute(sock, { from, pushName, groupName, tempoFormatado }) {
if (text.startsWith("/likeff")) {
    // Separar o comando e o argumento
    const args = text.trim().split(" ");
    
    if (args.length < 2 || args[1].trim() === "") {
        // Caso o ID do jogador não seja fornecido
        await sock.sendMessage(from, {
            text: "_❲❗❳ Informe o Id do Jogador_\nExemplo: /likeff 1989445071",
        });
    } else {
        const jogadorId = args[1].trim();
        
        // Enviar mensagem para o PV do usuário que usou o comando
        await sock.sendMessage(from, {
            text: "*Enviando seus 100 likes, aguarde...*",
        });
        
        // Resposta ao fornecer o ID no grupo
        await sock.sendMessage(from, {
            text: `Por questões de segurança, irei te enviar os dados no PV...\n\nLembrando que só é possível adicionar 100 likes por dia. Caso tente por mais 100 no mesmo dia, irá dar erro e os seus likes não irão cair!`,
        });
    }
}
  }
};
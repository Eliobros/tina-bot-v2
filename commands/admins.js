// commands/admins.js
module.exports = {
  name: "admins",
  description: "Lista os administradores do grupo",
  async execute(sock, { msg, from, isGroupMsg, pushName,isGroupAdmins,isGroup}) {
    
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
${adminList}
`
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
  }
};

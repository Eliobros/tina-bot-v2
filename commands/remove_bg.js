//criando o comando de remover fundo na imagem 

const {remove} = require('rembg');
const fs = require('fs');

module.exports = {
  name: 'removebg',
  description: 'Remove o fundo da imagem ',
  command: '/removebg',
  async execute(msg, wa, args) {
    try {
      const { from, type, quotedMessage, isMedia} = msg;
      const content = JSON.JSON.stringify();
    }
    
    
  } catch (error: any){
    console.error('Erro ao remover o fundo da imagem:', error);
    await sock.sendMessage(from,{
      text: "Ocorreu um erro ao remover o fundo da imagem tente novamente mais tarde",
      
    })
    
  }
  
}

try {
   
} catch (error: unknown) {
   
}

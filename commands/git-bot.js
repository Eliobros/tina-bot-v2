module.exports  = {
  name: "git-bot",
  description: "Exibe o link do repositório ģit do bot",
  async execute(sock, { from, pushName, GIT_BOT}){
    text: `Olá, ${pushName}, aqui esta o link do repositório git 
    ≈==== GIT DO BOT =====
    
    ${GIT_BOT}
    `
  }
}
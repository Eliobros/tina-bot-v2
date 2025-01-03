import { exec } from 'child_process';
import { createServer } from 'http';
import { Server } from 'socket.io'
import { createReadStream, mkdirSync, existsSync, writeFileSync } from 'fs';
import { parse } from 'url';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Diretório atual e diretório base para arquivos e pastas criados
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDirectory = join(__dirname, 'paths_node');

// Garante que o diretório base exista
if (!existsSync(baseDirectory)) {
  mkdirSync(baseDirectory);
}

// Criar servidor HTTP
const httpServer = createServer((req, res) => {
  const url = parse(req.url);
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  const path = join(__dirname, pathname);

  // Verifica se o arquivo existe e serve
  createReadStream(path)
    .on('error', () => {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    })
    .pipe(res);
});

// Criar instância do Socket.io
const io = new Server(httpServer);

// Lógica do Socket.io
io.on('connection', (socket) => {
  console.log('Um usuário se conectou');

  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
  });

  socket.on('terminal-command', (command) => {
    console.log(`Comando recebido: ${command}`);

    // Validar comandos permitidos
    const allowedCommands = ['node', 'npm', 'ls', 'cd', 'mkdir', 'touch'];
    const [baseCommand, ...args] = command.split(' '); // Separa o comando principal e os argumentos

    if (!allowedCommands.includes(baseCommand)) {
      socket.emit('terminal-output', 'Comando não permitido.');
      return;
    }

    if (baseCommand === 'mkdir') {
      const folderName = args[0];
      if (!folderName) {
        socket.emit('terminal-output', 'Erro: Nome da pasta não especificado.');
        return;
      }

      const targetPath = join(baseDirectory, folderName);
      if (!existsSync(targetPath)) {
        mkdirSync(targetPath);
        socket.emit('terminal-output', `Pasta criada com sucesso: ${targetPath}`);
      } else {
        socket.emit('terminal-output', `A pasta já existe: ${targetPath}`);
      }
      return;
    }

    if (baseCommand === 'touch') {
      const fileName = args[0];
      if (!fileName) {
        socket.emit('terminal-output', 'Erro: Nome do arquivo não especificado.');
        return;
      }

      const filePath = join(baseDirectory, fileName);
      if (!existsSync(filePath)) {
        writeFileSync(filePath, ''); // Cria o arquivo vazio
        socket.emit('terminal-output', `Arquivo criado com sucesso: ${filePath}`);
      } else {
        socket.emit('terminal-output', `O arquivo já existe: ${filePath}`);
      }
      return;
    }

    // Executar outros comandos
    exec(command, { cwd: baseDirectory }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao executar o comando: ${error.message}`);
        socket.emit('terminal-output', `Erro: ${stderr || error.message}`);
      } else {
        console.log(`Saída do comando: ${stdout}`);
        socket.emit('terminal-output', stdout || stderr);
      }
    });
  });
});

// Iniciar servidor
httpServer.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});

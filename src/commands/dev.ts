import chalk from 'chalk';
import path from 'path';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { createSelfSignedCertificate } from '../utils/certificate';

export async function devCommand(port?: number): Promise<void> {
  const serverPort = port || 11123;

  console.log(chalk.cyan.bold('\n🔧 Start the local development server: \n'));

  if (await isPortInUse(serverPort)) {
    console.error(chalk.red(`\n[ERROR] 端口 ${serverPort} 已被占用！`));
    console.log(chalk.yellow('[Tips] 使用 --port 参数指定其他端口\n'));
    process.exit(1);
  }

  try {
    const server = await startHttpServer(serverPort);

    console.log(chalk.green.bold('Server is running! \n'));
    console.log(chalk.white('[INFO] 本地地址:'), chalk.cyan(`https://localhost:${serverPort}/`));
    console.log(chalk.white('[INFO] 插件文件:'), chalk.cyan(`https://localhost:${serverPort}/${getPluginFileName()}`));
    console.log(chalk.yellow('\n[Tips] 在 NitaiPage 控制台执行以下命令安装插件：'));
    console.log(chalk.cyan.bold(`installNpplication('https://localhost:${serverPort}/${getPluginFileName()}')\n`));
    console.log(chalk.gray('Press Ctrl+C to stop\n'));

    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\n[INFO] Server is done!'));
      server.close();
      process.exit(0);
    });
  } catch (error) {
    console.error(chalk.red('\n[ERROR] Startup failed：'), error);
    process.exit(1);
  }
}

async function startHttpServer(port: number): Promise<https.Server> {
  const { cert, key } = await createSelfSignedCertificate();

  const server = https.createServer({ cert, key }, (req, res) => {
    let requestedPath = req.url === '/' ? '' : req.url || '';

    if (requestedPath.startsWith('/')) {
      requestedPath = requestedPath.substring(1);
    }

    const resolvedPath = path.resolve(process.cwd(), requestedPath);
    const normalizedPath = path.normalize(resolvedPath);

    try {
      if (!normalizedPath.startsWith(process.cwd())) {
        res.writeHead(403, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end('Forbidden');
        return;
      }

      if (fs.existsSync(normalizedPath) && fs.statSync(normalizedPath).isFile()) {
        const ext = path.extname(normalizedPath);
        const contentType = getContentType(ext);

        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400'
        });
        fs.createReadStream(normalizedPath).pipe(res);
      } else {
        res.writeHead(404, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end('Not Found');
      }
    } catch (error) {
      res.writeHead(500, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      res.end('Internal Server Error');
    }
  });

  server.listen(port);
  return server;
}

function getContentType(ext: string): string {
  const types: { [key: string]: string } = {
    '.js': 'application/javascript',
    '.html': 'text/html',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  return types[ext] || 'application/octet-stream';
}

function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = http.createServer();

    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(false);
    });

    server.listen(port);
  });
}

function getPluginFileName(): string {
  const files = fs.readdirSync(process.cwd());
  const jsFiles = files.filter((f: string) => f.endsWith('.js') && !f.endsWith('-compressed.js'));
  return jsFiles[0] || 'plugin.js';
}

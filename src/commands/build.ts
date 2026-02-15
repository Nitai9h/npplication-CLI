import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { minify } from 'terser';
import { validateMetadata } from '../utils/metadataValidator';

export async function buildCommand(filePath?: string): Promise<void> {
  console.log(chalk.cyan.bold('\n📦 Building...\n'));

  const targetPath = filePath || findPluginFile();

  if (!targetPath) {
    console.error(chalk.red('[ERROR] File not found未找到插件文件！'));
    console.log(chalk.yellow('[Tips] 在插件目录中运行此命令，或使用 --file 参数指定文件路径\n'));
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(targetPath, 'utf-8');

    const metadataMatch = content.match(/\/\/\s*==Npplication==\s*\n([\s\S]*?)\n\/\/\s*==\/Npplication==/);

    if (!metadataMatch) {
      console.error(chalk.red('[ERROR] 未找到元数据块！'));
      process.exit(1);
    }

    const metadataBlock = metadataMatch[0];
    const codeContent = content.replace(metadataBlock, '');

    console.log(chalk.gray('Compressing...'));
    const minified = await minify(codeContent, {
      compress: true,
      mangle: true,
      format: {
        comments: false
      }
    });

    const outputPath = targetPath.replace(/\.js$/, '-compressed.js');
    const minifiedContent = metadataBlock + '\n' + (minified.code || codeContent);

    fs.writeFileSync(outputPath, minifiedContent, 'utf-8');

    console.log(chalk.green.bold('[OK] Build succeeded！\n'));
    console.log(chalk.white('[INFO] 输出文件:'), chalk.cyan(path.basename(outputPath)));

    console.log(chalk.gray('\nVerifying...'));
    const result = validateMetadata(minifiedContent);

    if (result.valid) {
      console.log(chalk.green('[OK] Verification passed！\n'));
    } else {
      console.log(chalk.red('[ERROR] Verification failed！'));
      result.errors.forEach(error => {
        console.log(chalk.red(`  - ${error}`));
      });
      console.log();
    }
  } catch (error) {
    console.error(chalk.red('\n[ERROR] Build failed：'), error);
    process.exit(1);
  }
}

function findPluginFile(): string | null {
  const files = fs.readdirSync(process.cwd());
  const jsFiles = files.filter(f => f.endsWith('.js') && !f.endsWith('-compressed.js'));

  if (jsFiles.length === 0) {
    return null;
  }

  if (jsFiles.length === 1) {
    return path.resolve(process.cwd(), jsFiles[0]);
  }

  console.log(chalk.yellow('[WARN] 发现多个 JS 文件，请指定要构建的文件：'));
  jsFiles.forEach((file, index) => {
    console.log(chalk.white(`  ${index + 1}. ${file}`));
  });

  return path.resolve(process.cwd(), jsFiles[0]);
}

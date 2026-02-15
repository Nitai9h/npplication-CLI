import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { validateMetadata } from '../utils/metadataValidator';

export async function checkCommand(filePath?: string): Promise<void> {
  console.log(chalk.cyan.bold('\n🔍 Checking...\n'));

  const targetPath = filePath || findPluginFile();

  if (!targetPath) {
    console.error(chalk.red('[ERROR] File not found！'));
    console.log(chalk.yellow('[Tips] 在插件目录中运行此命令，或使用 --file 参数指定文件路径\n'));
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(targetPath, 'utf-8');
    const result = validateMetadata(content);

    if (result.valid) {
      console.log(chalk.green.bold('[OK] Verification passed！\n'));

      if (result.warnings.length > 0) {
        console.log(chalk.yellow('[WARN]  警告：'));
        result.warnings.forEach(warning => {
          console.log(chalk.yellow(`  - ${warning}`));
        });
        console.log();
      }
    } else {
      console.log(chalk.red.bold('[ERROR] 验证失败！\n'));
      console.log(chalk.red('错误：'));
      result.errors.forEach(error => {
        console.log(chalk.red(`  - ${error}`));
      });

      if (result.warnings.length > 0) {
        console.log(chalk.yellow('\n[WARN]  警告：'));
        result.warnings.forEach(warning => {
          console.log(chalk.yellow(`  - ${warning}`));
        });
      }

      console.log();
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('\n[ERROR] 验证失败：'), error);
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

  console.log(chalk.yellow('[WARN] 发现多个 JS 文件，请指定要验证的文件：'));
  jsFiles.forEach((file, index) => {
    console.log(chalk.white(`  ${index + 1}. ${file}`));
  });

  return path.resolve(process.cwd(), jsFiles[0]);
}

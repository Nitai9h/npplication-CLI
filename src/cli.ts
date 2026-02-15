#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createCommand } from './commands/create';
import { devCommand } from './commands/dev';
import { checkCommand } from './commands/check';
import { buildCommand } from './commands/build';
import { storeCommand } from './commands/store';

const program = new Command();

program
  .name('npplication')
  .description('NitaiPage NPP 插件开发 CLI 工具')
  .description('CLI tool for creating and developing NitaiPage NPP plugins')
  .version('1.0.0');

program
  .command('create [name]')
  .alias('c')
  .description('创建新的 NPP 插件项目')
  .action(createCommand);

program
  .command('dev')
  .alias('d')
  .description('启动本地开发服务器')
  .option('-p, --port <port>', '指定端口号', '11123')
  .action((options) => devCommand(parseInt(options.port)));

program
  .command('check')
  .description('验证插件元数据')
  .option('-f, --file <path>', '指定插件文件路径')
  .action((options) => checkCommand(options.file));

program
  .command('build')
  .alias('b')
  .description('构建插件（压缩代码）')
  .option('-f, --file <path>', '指定插件文件路径')
  .action((options) => buildCommand(options.file));

program
  .command('store')
  .alias('s')
  .description('创建商店 JSON 文件')
  .action(storeCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

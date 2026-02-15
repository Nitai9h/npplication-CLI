import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { StoreCategory, StorePlugin, StoreData } from '../types.js';

export async function storeCommand(): Promise<void> {
  console.log(chalk.cyan.bold('\n🚀 Welcome to NitaiPage npplication store creation guide\n'));

  const storeData: StoreData = {
    category: [],
    plugins: {}
  };

  console.log(chalk.cyan.bold('\n[INFO] 请填写分类\n'));
  console.log(chalk.cyan.bold('\n[INFO] Please fill in the category\n'));
  console.log(chalk.gray('[Tips] 留空结束填写\n'));

  while (true) {
    const category = await promptCategory();
    if (!category) {
      break;
    }

    if (storeData.category.some(cat => cat.key === category.key)) {
      console.log(chalk.red(`\n[ERROR] 分类 ID "${category.key}" 已存在！请使用不同的分类 ID\n`));
      continue;
    }

    storeData.category.push(category);
    storeData.plugins[category.key] = [];

    console.log(chalk.green(`[OK] 分类 "${category.name}" 已添加\n`));
  }

  if (storeData.category.length === 0) {
    console.log(chalk.yellow('\n[WARN] 未添加任何分类\n'));
    return;
  }

  console.log(chalk.cyan.bold('\n[INFO] 请填写插件\n'));
  console.log(chalk.cyan.bold('\n[INFO] Please fill in the npplication\n'));
  console.log(chalk.gray('[Tips] 留空结束填写\n'));

  for (const category of storeData.category) {
    console.log(chalk.cyan.bold(`\n[INFO] 当前分类: ${category.name}\n`));

    let pluginCount = 0;

    while (true) {
      const plugin = await promptPlugin(category.name);
      if (!plugin) {
        break;
      }

      storeData.plugins[category.key].push(plugin);
      pluginCount++;
      console.log(chalk.green(`[OK] "${plugin.id}" 已添加到 "${category.name}"\n`));
    }

    console.log(chalk.yellow(`${category.name} 共添加了 ${pluginCount} 个插件信息\n`));
  }

  try {
    const outputPath = path.join(process.cwd(), 'store.json');
    const jsonContent = JSON.stringify(storeData, null, 2);
    fs.writeFileSync(outputPath, jsonContent, 'utf-8');

    console.log(chalk.green.bold('\n[OK] Created successfully！\n'));
    console.log(chalk.white('[INFO] 地址:'), chalk.cyan(outputPath));
    console.log(chalk.white('[INFO] 统计:'));
    console.log(chalk.white(`  - 分类数量: ${storeData.category.length}`));

    let totalPlugins = 0;
    storeData.category.forEach(cat => {
      const plugins = storeData.plugins[cat.key] || [];
      totalPlugins += plugins.length;
      console.log(chalk.white(`  - 分类 "${cat.name}": ${plugins.length} 个插件`));
    });
    console.log(chalk.white(`  - 插件总数: ${totalPlugins}\n`));
  } catch (error) {
    console.error(chalk.red('\n[ERROR] Created failed：'), error);
    process.exit(1);
  }
}

async function promptCategory(): Promise<StoreCategory | null> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'key',
      message: '分类 ID (Category ID):',
      validate: (input: string) => {
        return true;
      }
    }
  ]);

  const key = answers.key.trim();
  if (!key) {
    return null;
  }

  const nameAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '分类名称 (Category Name):',
      validate: (input: string) => {
        if (!input.trim()) {
          return '分类名称不能为空';
        }
        return true;
      }
    }
  ]);

  return {
    key: key,
    name: nameAnswer.name.trim()
  };
}

async function promptPlugin(categoryName: string): Promise<StorePlugin | null> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: `插件 NID (Plugin NID) :`,
      validate: (input: string) => {
        return true;
      }
    }
  ]);

  const id = answers.id.trim();
  if (!id) {
    return null;
  }

  const otherAnswers = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: '插件 URL (Plugin URL):',
      validate: (input: string) => {
        if (!input.trim()) {
          return '插件 URL 不能为空';
        }
        if (!isValidUrl(input.trim())) {
          return '请输入有效的 URL';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'screenshots',
      message: '[可选] 截图 URL (Screen URL):',
      default: '',
      filter: (input: string) => {
        if (!input.trim()) {
          return [];
        }
        return input.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
    }
  ]);

  const plugin: StorePlugin = {
    id: id,
    url: otherAnswers.url.trim()
  };

  if (otherAnswers.screenshots && otherAnswers.screenshots.length > 0) {
    plugin.screenshots = otherAnswers.screenshots;
  }

  return plugin;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

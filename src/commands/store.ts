import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { StoreCategory, StorePlugin, StorePluginMap, StoreWizardOptions } from '../types.js';
import { buildStoreData, inspectStoreData } from '../utils/storeSerializer.js';

const NID_PATTERN = /^([0-9]{13})_[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
const NID_MIN_TIMESTAMP = 1749401460000;

export async function storeCommand(options: StoreWizardOptions = {}): Promise<void> {
  console.log(chalk.cyan.bold('\n🚀 Welcome to NitaiPage npplication store creation guide\n'));

  const categories: StoreCategory[] = [];
  const plugins: StorePluginMap = {};

  console.log(chalk.cyan.bold('\n[INFO] 请填写分类\n'));
  console.log(chalk.cyan.bold('\n[INFO] Please fill in the category\n'));
  console.log(chalk.gray('[Tips] 留空结束填写\n'));

  while (true) {
    const category = await promptCategory();
    if (!category) {
      break;
    }

    if (categories.some(item => item.key === category.key)) {
      console.log(chalk.red(`\n[ERROR] 分类 ID "${category.key}" 已存在！请使用不同的分类 ID\n`));
      continue;
    }

    categories.push(category);
    plugins[category.key] = [];

    console.log(chalk.green(`[OK] 分类 "${category.name}" 已添加\n`));
  }

  if (categories.length === 0) {
    console.log(chalk.yellow('\n[WARN] 未添加任何分类\n'));
    return;
  }

  console.log(chalk.cyan.bold('\n[INFO] 请填写插件\n'));
  console.log(chalk.cyan.bold('\n[INFO] Please fill in the npplication\n'));
  console.log(chalk.gray('[Tips] 留空结束填写\n'));

  for (const category of categories) {
    console.log(chalk.cyan.bold(`\n[INFO] 当前分类: ${category.name}\n`));

    let pluginCount = 0;

    while (true) {
      const plugin = await promptPlugin();
      if (!plugin) {
        break;
      }

      plugins[category.key].push(plugin);
      pluginCount++;

      if (!isStandardNid(plugin.id)) {
        console.log(chalk.gray('[INFO] 该插件 NID 不符合格式，详细请看官方文档 (https://nitaipage.nitai.cc)\n'));
      }

      console.log(chalk.green(`[OK] "${plugin.id}" 已添加到 "${category.name}"\n`));
    }

    console.log(chalk.yellow(`${category.name} 共添加了 ${pluginCount} 个插件信息\n`));
  }

  const storeData = buildStoreData(categories, plugins);
  const inspection = inspectStoreData(storeData);

  if (inspection.problems.length > 0) {
    console.error(chalk.red('\n[ERROR] 生成出错：\n'));
    inspection.problems.forEach(problem => console.error(chalk.red(`  - ${problem}`)));
    console.error('');
    process.exit(1);
  }

  const outputPath = path.join(process.cwd(), options.outputFileName || 'store.json');

  try {
    fs.writeFileSync(outputPath, JSON.stringify(storeData, null, 4), 'utf-8');
  } catch (error) {
    console.error(chalk.red('\n[ERROR] Created failed：'), error);
    process.exit(1);
  }

  console.log(chalk.green.bold('\n[OK] Created successfully！\n'));
  console.log(chalk.white('[INFO] 地址:'), chalk.cyan(outputPath));
  console.log(chalk.white(`[INFO] NitaiPage 将读到: ${Object.keys(inspection.categories).length} 个分类 / ${inspection.totalPlugins} 个插件`));

  categories.forEach((category) => {
    const count = inspection.plugins[category.key]?.length || 0;
    const line = `  - ${category.name} (${category.key}): ${count} 个插件`;
    console.log(count > 0 ? chalk.white(line) : chalk.yellow(`${line}（没有插件，商店里会是一个空分类）`));
  });

  const blankCategories = categories.filter(category => (inspection.plugins[category.key]?.length || 0) === 0);
  if (blankCategories.length > 0) {
    console.log(chalk.yellow(`\n[WARN] ${blankCategories.length} 个分类下没有插件，确认是有意为之再发布\n`));
  } else {
    console.log('');
  }
}

async function promptCategory(): Promise<StoreCategory | null> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'key',
      message: '分类 ID (Category ID):'
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

async function promptPlugin(): Promise<StorePlugin | null> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: '插件 NID (Plugin NID) :'
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

function isStandardNid(id: string): boolean {
  const match = id.match(NID_PATTERN);
  if (!match) {
    return false;
  }
  return Number.parseInt(match[1], 10) >= NID_MIN_TIMESTAMP;
}

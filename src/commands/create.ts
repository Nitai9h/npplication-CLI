import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { CreatePluginOptions } from '../types';
import { generateMetadata } from '../utils/metadataGenerator';
import { generatePluginId } from '../utils/idGenerator';

export async function createCommand(pluginName?: string, cliOptions?: { id?: boolean }): Promise<void> {
  if (cliOptions?.id) {
    const id = generatePluginId();
    console.log(chalk.cyan.bold('\nGenerated NID:\n'));
    console.log(chalk.white(id));
    console.log();
    return;
  }

  console.log(chalk.cyan.bold('\n🚀 Welcome to NitaiPage npplication creation wizard tool\n'));

  let options: CreatePluginOptions;

  if (pluginName) {
    options = await promptWithDefaults(pluginName);
  } else {
    options = await promptInteractive();
  }

  const projectName = pluginName || options.name;
  const projectPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.error(chalk.red(`\n[ERROR] 目录 "${projectName}" 已存在！`));
    process.exit(1);
  }

  try {
    createProjectStructure(projectPath, options);
    console.log(chalk.green.bold('\n[OK] Creation successfully！\n'));
    console.log(chalk.yellow(' Next：'));
    console.log(chalk.white(`  cd ${projectName}`));
    console.log(chalk.white('  npplication dev\n'));
  } catch (error) {
    console.error(chalk.red('\n[ERROR] Creation failed：'), error);
    process.exit(1);
  }
}

async function promptInteractive(): Promise<CreatePluginOptions> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '插件名称(Name):',
      validate: (input: string) => input.trim().length > 0 || '插件名称不能为空'
    },
    {
      type: 'input',
      name: 'description',
      message: '插件描述(Description):',
      default: 'My first plugin'
    },
    {
      type: 'input',
      name: 'author',
      message: '作者(Author):',
      default: ''
    },
    {
      type: 'list',
      name: 'time',
      message: '加载时机(Loading time):',
      choices: ['body', 'head'],
      default: 'body'
    },
    {
      type: 'list',
      name: 'type',
      message: '插件类型(Type):',
      choices: ['normal', 'coreNpp', 'translate'],
      default: 'normal'
    },
    {
      type: 'input',
      name: 'icon',
      message: '[可选] 图像 URL (Icon URL):',
      default: ''
    },
    {
      type: 'input',
      name: 'screen',
      message: '[可选] 截图URL (Screen URL):',
      default: ''
    },
    {
      type: 'confirm',
      name: 'setting',
      message: '[可选] 是否需要设置界面(Setting page)?',
      default: false
    },
    {
      type: 'confirm',
      name: 'forced',
      message: '[可选] 是否开启强制更新(Force update)?',
      default: false
    },
    {
      type: 'input',
      name: 'dependencies',
      message: '[可选] 依赖项(Dependencies) - 格式: [`url`:`version`,...]',
      default: ''
    }
  ]);

  return answers;
}

async function promptWithDefaults(name: string): Promise<CreatePluginOptions> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: '插件描述(Description):',
      default: 'My first plugin'
    },
    {
      type: 'input',
      name: 'author',
      message: '作者(Author):',
      default: ''
    },
    {
      type: 'list',
      name: 'time',
      message: '加载时机(Loading time):',
      choices: ['body', 'head'],
      default: 'body'
    },
    {
      type: 'list',
      name: 'type',
      message: '插件类型(Type):',
      choices: ['normal', 'coreNpp', 'translate'],
      default: 'normal'
    },
    {
      type: 'input',
      name: 'icon',
      message: '[可选] 图标 URL (Icon URL):',
      default: ''
    },
    {
      type: 'input',
      name: 'screen',
      message: '[可选] 截图 URL (Screen URL):',
      default: ''
    },
    {
      type: 'confirm',
      name: 'setting',
      message: '[可选] 是否需要设置界面(Setting page)?',
      default: false
    },
    {
      type: 'confirm',
      name: 'forced',
      message: '[可选] 是否开启强制更新(Force update)?',
      default: false
    },
    {
      type: 'input',
      name: 'dependencies',
      message: '[可选] 依赖项(Dependencies) - 格式: [`url`:`version`,...]',
      default: ''
    }
  ]);
  return { ...answers, name };
}

function createProjectStructure(projectPath: string, options: CreatePluginOptions): void {
  fs.mkdirSync(projectPath, { recursive: true });

  const metadata = generateMetadata(options);
  const idMatch = metadata.match(/\/\/ @id (.+)/);
  const id = idMatch ? idMatch[1] : 'unknown';
  const versionMatch = metadata.match(/\/\/ @version (.+)/);
  const version = versionMatch ? versionMatch[1] : '0.0.1';

  const filename = `${options.name.replace(/\s+/g, '-')}.js`;
  const camelCaseName = toCamelCase(options.name);

  const pluginContent = generatePluginContent(metadata, options.name, camelCaseName, options);
  const readmeContent = generateReadmeContent(options, filename, id, version);

  fs.writeFileSync(path.join(projectPath, filename), pluginContent, 'utf-8');
  fs.writeFileSync(path.join(projectPath, 'README.md'), readmeContent, 'utf-8');
}

function generatePluginContent(metadata: string, name: string, camelCaseName: string, options: CreatePluginOptions): string {
  const idMatch = metadata.match(/\/\/ @id (.+)/);
  const id = idMatch ? idMatch[1] : '';
  const versionMatch = metadata.match(/\/\/ @version (.+)/);
  const version = versionMatch ? versionMatch[1] : '';
  const descriptionMatch = metadata.match(/\/\/ @description (.+)/);
  const description = descriptionMatch ? descriptionMatch[1] : '';
  const authorMatch = metadata.match(/\/\/ @author (.+)/);
  const author = authorMatch ? authorMatch[1] : '';
  const timeMatch = metadata.match(/\/\/ @time (.+)/);
  const time = timeMatch ? timeMatch[1] : 'body';
  const typeMatch = metadata.match(/\/\/ @type (.+)/);
  const type = typeMatch ? typeMatch[1] : '';
  const iconMatch = metadata.match(/\/\/ @icon (.+)/);
  const icon = iconMatch ? iconMatch[1] : '';
  const screenMatch = metadata.match(/\/\/ @screen (.+)/);
  const screen = screenMatch ? screenMatch[1] : '';
  const forcedMatch = metadata.match(/\/\/ @forced (.+)/);
  const forced = forcedMatch ? forcedMatch[1] : 'false';
  const settingMatch = metadata.match(/\/\/ @setting (.+)/);
  const setting = settingMatch ? settingMatch[1] : 'false';
  const dependenciesMatch = metadata.match(/\/\/ @dependencies (.+)/);
  const dependencies = dependenciesMatch ? dependenciesMatch[1] : '';

  let settingCode = '';
  if (setting === 'true') {
    settingCode = `
    // 注册的设置页面
    document.addEventListener('pluginSettingsTemplateReady', function() {
        const pluginId = '${id}';
        const mainConts = document.querySelector(\`[data-value="\${pluginId}"]\`);
        
        if (mainConts) {
            const settingsContainer = document.createElement('div');
            settingsContainer.className = 'plugin-settings';
            settingsContainer.innerHTML = \`
                <div class="setting-item">
                    <label>示例设置项</label>
                    <input type="text" id="\${pluginId}_exampleInput" placeholder="请输入值" />
                </div>
                <div class="setting-item">
                    <label>开关示例</label>
                    <input type="checkbox" id="\${pluginId}_toggleInput" />
                </div>
                <div class="setting-actions">
                    <button id="\${pluginId}_saveBtn">保存</button>
                </div>
            \`;
            
            mainConts.appendChild(settingsContainer);
            
            // 绑定事件
            \$(\`#\${pluginId}_saveBtn\`).on('click', function() {
                const exampleValue = \$(\`#\${pluginId}_exampleInput\`).val();
                const toggleValue = \$(\`#\${pluginId}_toggleInput\`).prop('checked');
                
                // 保存设置到插件存储
                npp.set('exampleSetting', exampleValue);
                npp.set('toggleSetting', toggleValue);
                
                alert('设置已保存！');
            });
            
            // 加载已保存的设置
            (async function() {
                const savedExample = await npp.get('exampleSetting');
                const savedToggle = await npp.get('toggleSetting');
                
                if (savedExample !== undefined) {
                    \$(\`#\${pluginId}_exampleInput\`).val(savedExample);
                }
                if (savedToggle !== undefined) {
                    \$(\`#\${pluginId}_toggleInput\`).prop('checked', savedToggle);
                }
            })();
        }
    });
`;
  }

  return `// ==Npplication==
// @name ${name}
// @id ${id}
// @version ${version}
// @description ${description}
// @author ${author}
// @time ${time}
// @type ${type}
// @icon ${icon}
${screen ? `// @screen ${screen}` : ''}
// @forced ${forced}
// @setting ${setting}
${dependencies ? `// @dependencies ${dependencies}` : ''}
// ==/Npplication==

(function() {
    'use strict';
    
    console.log('${name} 插件已加载！');
    
    function ${camelCaseName}Function() {
        alert('Hello from ${name}!');
    }
    
    $(function() {
        console.log('页面已加载');
        ${camelCaseName}Function();
    });
    
    ${settingCode}
})();
`;
}

function generateReadmeContent(options: CreatePluginOptions, filename: string, id: string, version: string): string {
  return `# ${options.name}

${options.description || 'My first plugin'}

## 安装 / Install

在 NitaiPage 浏览器控制台执行 / Execute in console：

\`\`\`javascript
installNpplication('https://localhost:11126/${filename}')
\`\`\`

## 开发 / Development

启动本地开发服务器 / Start the local development server：

\`\`\`bash
npplication dev
\`\`\`

## 构建 / Build

构建生产版本 / Build production version：

\`\`\`bash
npplication build
\`\`\`

## 作者 / Author

${options.author || 'Unknown'}

## 许可证 / License

Your License here.
`;
}

function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/-/g, '');
}

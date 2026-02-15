import { PluginMetadata, CreatePluginOptions } from '../types';

export function generateMetadata(options: CreatePluginOptions): string {
  const id = generatePluginId();
  const version = '0.0.1';
  const time = options.time || 'body';
  const type = options.type || '';

  const metadata: PluginMetadata = {
    name: options.name,
    id,
    version,
    description: options.description || '@npplication:no-description',
    author: options.author || '@npplication:no-author',
    time,
    type,
    icon: options.icon || 'https://nitai-images.pages.dev/nitaiPage/defeatNpp.svg',
    screen: options.screen || '',
    forced: options.forced ? 'true' : 'false',
    setting: options.setting ? 'true' : 'false',
    dependencies: options.dependencies || '',
    associations: options.associations || '',
    translates: options.translates || ''
  };

  return formatMetadata(metadata);
}

function generatePluginId(): string {
  const timestamp = Date.now().toString();
  const uuid = generateUUIDv4();
  return `${timestamp}_${uuid}`;
}

function generateUUIDv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function formatMetadata(metadata: PluginMetadata): string {
  let result = '// ==Npplication==\n';
  
  result += `// @name ${metadata.name}\n`;
  result += `// @id ${metadata.id}\n`;
  result += `// @version ${metadata.version}\n`;
  
  if (metadata.description) {
    result += `// @description ${metadata.description}\n`;
  }
  
  if (metadata.author) {
    result += `// @author ${metadata.author}\n`;
  }
  
  if (metadata.time) {
    result += `// @time ${metadata.time}\n`;
  }
  
  if (metadata.type) {
    result += `// @type ${metadata.type}\n`;
  }
  
  if (metadata.icon) {
    result += `// @icon ${metadata.icon}\n`;
  }
  
  if (metadata.screen) {
    result += `// @screen ${metadata.screen}\n`;
  }
  
  if (metadata.forced) {
    result += `// @forced ${metadata.forced}\n`;
  }
  
  if (metadata.setting) {
    result += `// @setting ${metadata.setting}\n`;
  }
  
  if (metadata.dependencies) {
    result += `// @dependencies ${metadata.dependencies}\n`;
  }
  
  if (metadata.associations) {
    result += `// @associations ${metadata.associations}\n`;
  }
  
  if (metadata.translates) {
    result += `// @translates ${metadata.translates}\n`;
  }
  
  result += '// ==/Npplication==';
  
  return result;
}

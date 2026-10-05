import { PluginMetadata, ValidationResult } from '../types';
import { validatePluginId } from './idGenerator';

export function validateMetadata(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const metadata = parseMetadata(content);

  if (!metadata) {
    errors.push('元数据块格式错误：未匹配到 ==Npplication==');
    return { valid: false, errors, warnings };
  }

  const isTranslatePlugin = metadata.type === 'translate';
  const checksPluginId = metadata.type !== 'coreNpp' && !isTranslatePlugin;

  if (!metadata.name) {
    errors.push('缺少必需字段(Must)：@name');
  }

  if (!metadata.id) {
    errors.push('缺少必需字段(Must)：@id');
  } else if (checksPluginId && !validatePluginId(metadata.id)) {
    errors.push('无效的 @id 格式：应为 13 位时间戳 + UUID v4');
  }

  if (!metadata.version) {
    errors.push('缺少必需字段(Must)：@version');
  } else if (!isValidVersion(metadata.version)) {
    warnings.push(`@version 非建议的 X.Y.Z 形式，但若为纯数字则仍可使用：${metadata.version}`);
  }

  if (!isTranslatePlugin) {
    if (!metadata.time) {
      errors.push('缺少必需字段(Must)：@time（非翻译插件必填）');
    } else if (metadata.time !== 'head' && metadata.time !== 'body') {
      warnings.push(`@time 值不是 head / body，nitaiPage 将按 body 处理：${metadata.time}`);
    }
  }

  if (isTranslatePlugin && !metadata.translates) {
    errors.push('翻译插件缺少必需字段(Must for translate)：@translates');
  }

  if (isTranslatePlugin && metadata.translates && !isValidLanguageCode(metadata.translates)) {
    errors.push('无效的 @translates 值：应为有效的语言代码（如 zh-CN, en-US）');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function parseMetadata(content: string): PluginMetadata | null {
  const match = content.match(/\/\/\s*==Npplication==\s*\n([\s\S]*?)\n\/\/\s*==\/Npplication==/);

  if (!match || !match[1]) {
    return null;
  }

  const metadataLines = match[1].split('\n');
  const metadata: Partial<PluginMetadata> = {};

  for (const line of metadataLines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('// @')) {
      const [key, ...valueParts] = trimmedLine.replace('// @', '').trim().split(' ');
      const value = valueParts.join(' ').trim();
      if (key && value) {
        (metadata as any)[key] = value;
      }
    }
  }

  return metadata as PluginMetadata;
}

function isValidVersion(version: string): boolean {
  const versionPattern = /^\d+\.\d+\.\d+$/;
  return versionPattern.test(version);
}

function isValidLanguageCode(code: string): boolean {
  const languagePattern = /^[a-z]{2}(-[A-Z]{2})?$/;
  return languagePattern.test(code);
}

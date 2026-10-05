// 商店 JSON 的组装与读取

import { StoreCategory, StoreData, StoreEntry, StorePluginMap } from '../types.js';

// 组装商店 JSON
// categories：分类列表（key 是分类 ID，name 是显示名）
// plugins：每个分类下的插件列表
export function buildStoreData(categories: StoreCategory[], plugins: StorePluginMap): StoreData {
  const categoryNames: Record<string, string> = {};
  const store: Record<string, unknown> = { category: [categoryNames] };

  categories.forEach((category) => {
    categoryNames[category.key] = category.name;

    const entries: Record<string, StoreEntry> = {};
    (plugins[category.key] ?? []).forEach((plugin) => {
      entries[plugin.id] = plugin.screenshots && plugin.screenshots.length > 0
        ? { url: plugin.url, screenshots: plugin.screenshots }
        : { url: plugin.url };
    });

    store[category.key] = [entries];
  });

  return store as StoreData;
}

export interface StoreInspection {
  categories: Record<string, string>;
  plugins: Record<string, StoreEntry[]>;
  totalPlugins: number;
  problems: string[];
}

// 读取并验证商店 JSON
export function inspectStoreData(data: unknown): StoreInspection {
  const categories: Record<string, string> = {};
  const plugins: Record<string, StoreEntry[]> = {};
  const problems: string[] = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { categories, plugins, totalPlugins: 0, problems: ['商店 JSON 必须是一个 Object'] };
  }

  const store = data as Record<string, unknown>;

  if (!Array.isArray(store.category)) {
    problems.push('缺少 category 字段 或它不是 Array');
  } else if (!store.category[0] || typeof store.category[0] !== 'object') {
    problems.push('category 的第 0 项不是 Object，分类全部加载不出来');
  } else {
    Object.entries(store.category[0] as Record<string, unknown>).forEach(([key, name]) => {
      if (typeof name === 'string') {
        categories[key] = name;
      } else {
        problems.push(`分类 ${key} 的显示名不是 string，会被忽略`);
      }
    });
  }

  Object.entries(store).forEach(([key, value]) => {
    if (key === 'category') return;

    if (!Array.isArray(value)) {
      problems.push(`${key} 不是 Array，nitaiPage 将跳过这个分类`);
      return;
    }
    if (!value[0] || typeof value[0] !== 'object') {
      problems.push(`${key} 的第 0 项不是 Object，这个分类下的插件全部加载不出来`);
      return;
    }

    if (!(key in categories)) {
      problems.push(`${key} 下有插件，但 category 里没有声明这个分类，商店里不会出现它`);
    }

    const entries: StoreEntry[] = [];
    Object.entries(value[0] as Record<string, unknown>).forEach(([id, entry]) => {
      if (!entry || typeof entry !== 'object' || typeof (entry as StoreEntry).url !== 'string') {
        problems.push(`${key} / ${id} 缺少 url，会被丢弃`);
        return;
      }

      const record = entry as StoreEntry;
      entries.push({
        url: record.url,
        ...(Array.isArray(record.screenshots) && record.screenshots.length > 0
          ? { screenshots: record.screenshots }
          : {})
      });
    });

    plugins[key] = entries;
  });

  const totalPlugins = Object.values(plugins).reduce((sum, list) => sum + list.length, 0);
  return { categories, plugins, totalPlugins, problems };
}

# NitaiPage NPP CLI

NitaiPage NPP 插件开发的命令行工具，旨在帮助开发者快速创建和调试 NPP 插件

## 功能特性

- 🚀 快速创建插件文件或商店 JSON 文件
- 🔧 集成本地开发服务器
- 🔍 插件元数据验证
- 📦 插件代码压缩

## 安装

```bash
npm install -g nitaipage-npp-cli
```

## 使用方法

### 创建新插件

```bash
npplication create

# 可直接指定名称
npplication create my-plugin

# 使用别名
npplication c my-plugin

# 快速生成插件 ID
npplication c -id
# 或
npplication create --id
```

创建向导会提示输入以下信息：

- 插件名称
- 插件描述
- 作者信息
- 加载时机（head/body）
- 插件类型（normal/coreNpp/translate）
- 图标 URL（可选）
- 截图 URL（可选）
- 是否需要设置界面（可选）
- 是否开启强制更新（可选）
- 依赖项（可选）

### 启动开发服务器

```bash
# 使用默认端口 11126
npplication dev

# 指定端口
npplication dev --port 11124

# 使用别名
npplication d
```

在 NitaiPage 浏览器控制台执行显示的安装命令即可安装插件并进行调试

### 验证插件

```bash
# 验证当前目录的插件文件
npplication check

# 验证指定文件
npplication check --file path/to/plugin.js
```

验证功能会检查：

- 元数据格式
- 必需元数据
- ID 格式（13位时间戳 + UUID v4）
- 版本号格式
- 加载时机
- 翻译插件的语言代码（仅翻译插件）

### 构建插件（压缩插件）

```bash
# 构建当前目录的插件文件
npplication build

# 构建指定文件
npplication build --file path/to/plugin.js

# 使用别名
npplication b
```

构建功能会：

- 压缩插件代码
- 生成 `plugin-compressed.js` 文件
- 自动验证构建结果

### 创建商店 JSON 文件

```bash
npplication store

# 使用别名
npplication s

# 指定输出文件名（默认 store.json）
npplication store -o my-store.json
```

生成的 JSON 里 `category` 与每个分类都是**长度 1 的数组**，分类下的插件以插件 NID 为键：

```json
{
  "category": [{ "tools": "工具" }],
  "tools": [{ "1753629993099_c29f24d8-3308-4367-a961-dc53a92272ae": { "url": "https://example.com/timeSeconds.js" } }]
}
```

写出文件前会按主程序的读取规则自检一遍，读不出插件或分类就会拒绝落盘并列出问题。

## 插件元数据规范

NPP 插件需要在文件开头包含元数据块：

```javascript
// ==Npplication==
// @name 插件名称
// @id 1234567890123_12345678-1234-4123-8123-123456789012
// @version 1.0.0
// @description 插件描述
// @author 作者名称
// @time body
// @type 
// @icon https://example.com/icon.png
// @screen https://example.com/screenshot.png
// @forced false
// @setting false
// @dependencies [`https://example.com/dep.js`:`1.0.0`]
// @associations [`https://example.com/assoc.js`:`1.0.0`]
// @translates [`https://example.com/trans.js`:`1.0.0`] or zh-CN
// ==/Npplication==
```

### 必需字段

- `@name`: 插件名称
- `@id`: 插件 ID（格式：13位时间戳 + UUID v4）
- `@version`: 版本号（格式：数字.数字.数字，如 0.0.1）
- `@time`: 加载时机（head/body）

### 可选字段

- `@description`: 插件描述
- `@author`: 作者信息
- `@type`: 插件类型（normal/coreNpp/translate）
- `@icon`: 图标 URL
- `@screen`: 截图 URL
- `@forced`: 是否强制更新（true/false）
- `@setting`: 是否注册设置页面（true/false）
- `@dependencies`: 依赖项列表（格式：[`url`:`version`]）
- `@associations`: 关联项列表（格式：[`url`:`version`]）
- `@translates`: 翻译语言代码（仅翻译插件必需，格式：zh-CN 或 [`url`:`version`]）

## 商店数据格式规范

NitaiPage 商店使用 JSON 格式存储数据：

```json
{
  "category": [
    {
      "tools": "工具",
      "style": "主题",
      "translate": "翻译"
    }
  ],
  "tools": [
    {
      "插件ID": {
        "url": "插件文件 URL",
        "screenshots": ["截图 URL1", "截图 URL2"]
      }
    }
  ],
  "style": [
    {
      "插件ID": {
        "url": "插件文件 URL",
        "screenshots": ["截图 URL"]
      }
    }
  ],
  "translate": [
    {
      "插件ID": {
        "url": "插件文件 URL"
      }
    }
  ]
}
```

## 开发工作流

1. **创建项目**

   ```bash
   npplication create my-plugin
   cd my-plugin
   ```

2. **开发插件**
   编辑生成的 `my-plugin.js` 文件，实现你的插件功能。
3. **本地调试**

   ```bash
   npplication dev
   ```

   在 NitaiPage 控制台执行显示的安装命令。

   **注意**：开发服务器已配置 CORS

4. **验证插件**

   ```bash
   npplication check
   ```

5. **构建压缩**

   ```bash
   npplication build
   ```

## 命令参考

| 命令                          | 别名              | 说明           |
| ----------------------------- | ----------------- | -------------- |
| `npplication create <name>` | `npplication c` | 创建新插件项目 |
| `npplication create --id`         | `npplication c -id` | 快速生成插件 ID |
| `npplication dev --port <port>` | `npplication d` | 启动开发服务器 |
| `npplication check`         | -                 | 验证插件元数据 |
| `npplication build`         | `npplication b` | 构建插件       |
| `npplication store`         | `npplication s` | 创建商店 JSON 文件 |

## 编辑器补全

装成开发依赖：

```bash
npm install -D nitaipage-npp-cli
```

加进编辑器配置

```jsonc
{
    "include": ["*.js", "node_modules/nitaipage-npp-cli/types/npplication-env.d.ts"]
}
```

## 常见问题 (Q&A)

### Q: 如何更新插件？

A: 更新插件文件并增加版本号，NitaiPage 会自动检测更新。或者再次在控制台执行 `installNpplication(JSUrl)` 覆盖安装插件。

### Q: 如何设置 CORS？

A: 开发服务器已自动配置 CORS ，无需手动设置

### Q: 开发服务器端口被占用怎么办？

A: 使用 `--port` 参数指定其他端口，例如：`npplication dev --port 11124`。

## License

MIT

## 欢迎提交 Issue 和 PR！

- [NitaiPage](https://github.com/Nitai9h/nitaiPage/)
- [NitaiPage Docs](https://nitaipage.nitai.us.kg/)
- [NitaiPage npp-Store](https://github.com/Nitai9h/nitaiPage-Store)

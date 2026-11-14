// 用于定义插件脚本里可以直接使用的变量和函数

// 成功 { ok: true, value, error: null }
// 失败 { ok: false, value: undefined, error }
interface NppStoreResult {
    ok: boolean
    value?: unknown
    error?: unknown
}

// 插件的私有存储，按插件 ID 隔离
interface NppStore {
    // 初始化本插件的存储。一般不用手动调用，set/get/remove 内部自动调用
    init(pluginId: string): Promise<void>
    // 写入数据
    set(key: string, value: unknown): Promise<NppStoreResult>
    // 读取数据，键不存在时 ok 为 true、value 为 undefined
    get(key: string): Promise<NppStoreResult>
    // 删除数据
    remove(key: string): Promise<NppStoreResult>
    // 按插件 ID 读取
    dbGet(pluginId: string, key: string): Promise<NppStoreResult>
    // 按插件 ID 写入
    dbSet(pluginId: string, key: string, value: unknown): Promise<NppStoreResult>
    // 按插件 ID 删除
    dbRemove(pluginId: string, key: string): Promise<NppStoreResult>
}

declare const npp: NppStore

// 以下是可使用的其它依赖

declare const iziToast: any
declare const Cookies: any
declare const Sortable: any
declare const chroma: any
declare const ColorThief: any

// 时钟数位，返回 HTML
declare function wrapTimeDigits(numStr: string, type?: string): string
// 日期数位，返回 HTML
declare function wrapDayDigits(numStr: string, type?: string): string
// 显示居中公告弹窗，content 里的换行符会转成 <br>
declare function showAnnouncement(title: string, content: string, buttonText?: string): void

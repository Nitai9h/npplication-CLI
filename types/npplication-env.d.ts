// 用于定义插件脚本里可以直接使用的变量和函数

// 插件的私有存储，按插件 ID 隔离
interface NppStore {
    // 初始化本插件的存储。一般不用手动调用，set/get/remove 内部自动调用
    init(pluginId: string): Promise<void>
    // 写入数据，返回是否成功
    set(key: string, value: unknown): Promise<boolean>
    // 读取数据，没有就是 undefined
    get(key: string): Promise<unknown>
    // 删除数据，返回是否成功
    remove(key: string): Promise<boolean>
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

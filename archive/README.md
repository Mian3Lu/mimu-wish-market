# 历史版本归档 · archive

这里保留 **mimu.** 网站从灵感分享站到许愿接单市集的迭代版本。所有历史文件均可单独作为 HTML 打开，**不会覆盖仓库根目录的 `index.html`**。

| 版本 | 文件 | 功能 / 风格 | 状态 |
| --- | --- | --- | --- |
| v01 | [`v01-scrapbook.html`](v01-scrapbook.html) | 奶油手帐风；Wish 许愿 + Files 文件 + Repo 返图反馈 | 归档 |
| v02 | [`v02-editorial.html`](v02-editorial.html) | INS / 独立杂志风；Wish + Files + Repo，画廊式作品封面 | 归档 |
| v03 | [`v03-wish-market.html`](v03-wish-market.html) | 小红书市集式卡片流；分区许愿、接单、进度与文件位置 | 归档 |
| v04 | [`v04-admin-dashboard.html`](v04-admin-dashboard.html) | 在市集上增加管理员演示、举报、删除及回收站 | 归档 |
| v05 | [`v05-creator-claims.html`](v05-creator-claims.html) | 多人接单；创作者自行更新进度；接单与留言附图/URL；可隐藏未完成接单 | 归档 |
| v06 | [`../index.html`](../index.html) | **当前主线**：保留 v05 功能，新增完成交付地址提示 | 当前使用 |

## 与 v06 的主要区别

v01 / v02 属于最早的「文件资源分享 + Repo 反馈」产品设想。后来项目定位调整：文件统一存放在外部资源库，网站专注于「许愿、接单、进度与领取位置」。因此 **v03 起取消独立 Files / Repo 分区**。

v04 / v05 / v06 是逐步叠加功能的演示版本，**它们都尚未接入 Supabase**，管理员口令和匿名身份也仅适用于本地功能体验。

当前 v06 在「已完成」交付信息中提供以下地址候选：`仓库群1`、`仓库群2`、`Aaa我不是饭神`、`Bbb我不是饭神`、`discord`。

### 版本管理约定

建议后续将里程碑命名为 `v07-supabase-alpha.html` 等，并在新增归档条目后更新本表。线上部署以根目录 `index.html` 为准，不要把归档文件误设为首页。

### 2026-10-27 升级前快照

[v06-market-before-editorial.html](v06-market-before-editorial.html) 保存本次黑白灰改版前的完整主页面（包含 Supabase 接入尝试）。仅用于恢复与审查，不进入生产 dist。已有 v01–v06 历史文件均保留。

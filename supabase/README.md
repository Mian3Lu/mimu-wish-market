# Supabase 接入计划（审查后草案）

当前项目已有 Supabase 数据表、RLS、Auth 管理员身份和公开 Storage bucket，但没有迁移历史；根目录 `index.html` 是 Supabase 接入中的版本，部分偏好和收藏仍在浏览器保存，权限与隐藏资料尚未通过安全验收。本计划按线上实际 schema 继续整理并保留现有 UI。

## 1. 需要迁移的真实数据

| 领域 | 建议表 / 数据 | 数据边界 |
| --- | --- | --- |
| 愿望 | `posts`、`post_media` | 分类、标题、正文、署名、封面/参考图、创建时间、软删除信息；作者身份由 `auth.uid()` 绑定 |
| 接单 | `claims`、受保护的接单详情/归属数据 | 公共摘要只含席位、状态、时间；昵称、说明、图片、隐藏设置、交付资料按可见性读取；不同创作者独立成行 |
| 互动 | `comments`、`comment_media`、`likes`、`favorites` | 留言可附一张图片；点赞和收藏由 `(user_id, post_id)` 唯一约束；收藏仅本人可读 |
| 治理 | `reports`、`admin_roles`、`moderation_logs` | 举报可指向帖子、留言或接单；角色仅受信任的后台维护；操作日志记录管理员、目标、动作、原因、时间及恢复关联 |
| 媒体 | Storage 对象与媒体记录 | 记录对象路径、上传者、类型、大小和可见性；外部 URL 与 Storage 路径分开存储 |

所有主键用数据库生成的 ID，`created_at` 等时间由数据库生成。分类和状态用约束限制取值。不要让客户端直接写入聚合状态、作者 ID、管理标记或审计记录。帖子总状态可从有效接单计算：任一已完成则为已完成，否则任一制作中则为制作中，否则有接单则为已接单，否则等待接单；在实现前确认该产品规则。

### 三人接单与隐藏信息

- 每帖最多三个**未撤回且未被管理移除**的接单，一位 Auth 用户对同帖最多一份有效接单。创建接单通过单次数据库事务完成：锁定目标帖子、检查有效数量、插入接单与详情，并用唯一索引兜底；并发的第四位必须失败。
- 接单公开摘要和敏感详情分开保存。隐藏未完成接单时，普通用户只可读席位与状态；本人和管理员可读完整信息；该接单完成后才可公开昵称、说明、图片和交付资料。不能先返回全字段再用 CSS/JS 遮住。
- 关联的图片也要遵守同样的可见性。隐藏图片使用私有 bucket，并在访问策略或短期签名 URL 的签发环节检查身份；公开后再允许访问。不要把隐藏图片放在公开 bucket。
- 完成品文件仍在外部资源库。`delivery_location` 可为仓库群1、仓库群2、Aaa我不是饭神、Bbb我不是饭神、discord 或其他文本；`delivery_url` 为可选链接。

## 2. 权限设计与 RLS 验收矩阵

| 操作 | 匿名 Auth 用户 | 接单本人 / 内容作者 | 管理员 |
| --- | --- | --- | --- |
| 读公开帖子、公开留言、接单摘要 | 允许 | 允许 | 允许 |
| 读隐藏接单详情、隐藏图片 | 拒绝 | 仅自己的允许 | 允许 |
| 发帖、留言、点赞、收藏、举报 | 在限流与校验后允许 | 同左 | 同左 |
| 创建接单 | 在三席约束下允许 | 同帖不可重复 | 按普通规则或明确的管理流程 |
| 修改接单状态 / 交付信息 | 拒绝 | 仅自己的有效接单允许 | 违规处理走管理动作，不冒充创作者 |
| 读 / 写收藏 | 拒绝访问他人的记录 | 仅自己的允许 | 一般无需读取私人收藏 |
| 删除、重置、恢复、处理举报、管理角色 | 拒绝 | 拒绝 | 经数据库端验证后允许，并写审计 |

实施时在同一迁移中为每张暴露表启用 RLS、撤销宽泛的默认权限并只授予所需 `GRANT`，分别测试 `anon`（未登录）、匿名 Auth 用户和管理员。匿名 Auth 用户在 Supabase 中属于 `authenticated` 数据库角色，需要按用户 ID 与 JWT 的 `is_anonymous` 声明区分，不能把 API 的 `anon` key 当作用户身份。公共视图和 RPC 也须审查：视图可能绕过底层 RLS；需要使用安全投影、`security_invoker` 或明确受控的数据库函数。任何 `security definer` 函数都要固定 `search_path`、在函数内验证调用者、限制 `EXECUTE`，并覆盖越权测试。

管理员使用独立 Supabase Auth 账号；角色记录放在客户端不能写的表中，由可信后台配置。删除、恢复、重置与举报处理通过受控事务执行，审计日志不可由普通客户端改写。帖子、留言和接单先软删除；永久清理应独立于日常处理流程，并有备份/保留策略。

## 3. Auth、防刷、图片与 URL

- 首次需要写入时创建 Supabase 匿名会话；读取公开内容可按最终策略决定是否需会话。清理浏览器数据或换设备会失去匿名身份，发布前应告知用户，并规划把匿名账户绑定到可找回的登录方式。管理员使用独立的可恢复账号。
- 匿名注册启用 CAPTCHA / Turnstile；发帖、接单、留言、点赞和举报再增加服务端频控、长度校验与重复提交约束。前端节流不能代替防刷。
- 上传前压缩，但 Storage bucket 仍须设置允许 MIME 与最大文件大小，服务端校验真实文件类型、尺寸及对象所属路径。只允许安全的位图类型，如 JPEG、PNG、WebP；拒绝 SVG 作为用户上传图片。明确孤儿对象清理方式。
- 外部图片与交付链接只接受完整的 HTTPS URL，拒绝嵌入账号密码、危险协议和异常长度；展示时转义并使用安全的链接属性。外链图片可能追踪访客，界面应给出合适提醒。若服务端将来主动抓取外链，还必须增加内网地址与重定向限制。
- 浏览器只持有 Supabase URL 与 **publishable key**；secret key、数据库密码、管理员密钥只可放在可信服务端环境。公开部署的 HTML/JS 不能保密。

## 4. 分阶段实施与验收

1. **Phase 1：审查（本次完成）**。记录现有功能、差距和开发约束；区分演示种子与真实数据。当前目录尚无 `.git`，下一阶段需建立真实 Git 仓库和私有远端，不能假定已有 Git 历史。
2. **Phase 2：Schema 与权限**。配置本地/测试 Supabase 项目，创建可重复执行的 migrations、表、约束、索引、RLS、受控接单事务与管理函数；写允许/拒绝测试。覆盖并发四人接单、同人重复、跨用户读写、隐藏详情/图片、软删除/恢复。
3. **Phase 3：Auth**。接匿名会话、管理员独立登录、会话恢复和身份绑定提示；移除线上构建中的共享演示口令、A/B/C 模拟身份和本地管理员判断。
4. **Phase 4：数据云端化**。先替换帖子列表、详情与发布，再替换接单、独立状态和交付信息，最后接留言、点赞、收藏与举报；用服务端倒序分页/搜索，处理加载、错误、重试和同时操作。
5. **Phase 5：媒体**。接 Storage 上传、外部 URL、展示权限及对象清理。补齐帖子参考图的外部 URL 入口和多图需求，确保隐藏接单图片不能被公开读取。
6. **Phase 6：管理**。接帖子/留言/接单软删除、举报处理、重置、恢复和审计日志；用非管理员身份反向测试每一项管理操作。
7. **Phase 7：部署与验收**。用独立的 Cloudflare Pages 构建输出只发布当前站点，不把 `archive/` 历史演示页发布出去。完成手机与桌面验收、RLS/Storage 越权检查、公开构建扫描后再开放。

本地 `localStorage` 是每个浏览器独立的一份演示数据，不存在一份可直接导入的共享生产库。正式数据迁移宜提供自愿、一次性的个人导入，过滤示例帖，重新绑定新 Auth 身份，并记录旧 ID 到新 ID 的映射以避免重复；不要自动把模拟身份或管理员记录带上线。

## 官方资料

- [Supabase 匿名登录](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase 数据库函数安全](https://supabase.com/docs/guides/database/functions)
- [Supabase Storage 访问控制](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Cloudflare Pages Git 集成](https://developers.cloudflare.com/pages/configuration/git-integration/)

## 当前 Supabase 项目核查记录（2026-10-19）

已核对的项目：`mimu-wish-market`（project ref `issrxjtupbdahjbemkyy`，ap-northeast-2）。该项目已有 `admin_roles`、`posts`、`claims`、`comments`、`likes`、`favorites`、`reports`、`moderation_logs` 表及 `wish-media` bucket；当前业务表没有帖子/接单等用户数据，项目迁移历史为空。根目录页面所需的大部分列名与线上表一致。

ZIP 中的 Supabase 页面有 JavaScript 重复声明与错误转义，配置值也不是 Supabase 当前可用的 publishable key。本地 `index.html` 已修复这些语法和配置问题，并补上匿名登录/管理员身份查询的错误检查。

**当前数据库仍不满足开放上线安全要求：**

- `claims` 表允许公开读取完整行，隐藏昵称、说明、图片及交付信息可从 API 直接查询；`wish-media` bucket 为公开 bucket，隐藏图片也不能靠前端 CSS 保护。
- 多张业务表给 `anon` / `authenticated` 授予过宽的表权限；`posts` 的更新策略没有 `WITH CHECK`，点赞数由浏览器直接写回帖子，可能被伪造或并发覆盖。
- 三人接单触发器未锁定帖子行，并发时可能超过三人；目前唯一约束也不区分有效与撤回接单。
- 留言和接单的管理员操作仍会硬删除，无法恢复；管理页面的部分举报/日志状态仍以本地数据组织，未形成服务端完整审计流程。
- `is_admin`、`sync_post_status` 等函数的 `search_path` 未固定，多个 `SECURITY DEFINER` 函数对客户端开放执行；Supabase 安全顾问也报告这些问题及匿名策略警告。

因此本地页面的 Supabase 连接目前仅用于继续开发和验证，不代表项目已具备安全的线上权限。Cloudflare 已有公开 Worker 部署；在数据库权限修复前，不要继续开放其线上写入功能或把新版本部署到生产。下一项数据库工作应新增 migration：先拆分/限制接单敏感详情、设为私有的图片访问、修复 RLS/列权限、接单并发约束与审计函数，再调整前端改用受控 RPC/安全视图。该核查只读进行，**没有修改线上数据库**。

本地工作目录尚无 `.git` 或 `origin` 远端；当前 ZIP 也不含 Git 元数据。因此现在不能生成可用的 GitHub `git pull` 仓库地址。

## 当前连接复核（2026-10-19）

Codex Supabase 连接可访问 `mimu-wish-market`（project ref `issrxjtupbdahjbemkyy`），项目状态为 `ACTIVE_HEALTHY`。仓库 `index.html` 中的 Supabase URL 与启用中的 publishable key 和该项目匹配。2026-10-20 只读核对显示线上已有 2 条帖子、1 条接单、1 条管理员角色记录；帖子、接单、留言、收藏、点赞、举报和管理日志均未在此次核对中读取或改写。Security Advisor 仍报告公开 `SECURITY DEFINER` 函数可执行、可变 `search_path`、匿名访问策略以及 Auth 弱密码保护未开启等告警。

本地目录没有 `.git`、GitHub remote 或 Cloudflare CLI，不能从本机拉取或推送 GitHub。Chrome 当前已登录的 Cloudflare 控制台中存在 `mimu-wish-market` Workers 部署，`workers.dev` 地址可访问，Workers Builds 显示关联仓库 `Mian3Lu/mimu-wish-market`、生产分支 `main`。原设置的构建命令为空、部署命令为 `npx wrangler deploy`、根目录为 `/`；构建详情显示当前静态资源输出目录为 `.`，可能把仓库文件一并作为公开资源。控制台还提示无法获取 GitHub 用户/组织信息，可能导致后续部署失败。已将 Workers Builds 的构建命令保存为 `bash scripts/build-pages.sh`，未触发新部署；GitHub main 尚未包含本地新增的构建脚本与 Wrangler 配置，需先同步这些文件再触发构建。

已在本地工作目录准备 `scripts/build-pages.sh` 与 `wrangler.jsonc`，构建会把当前 `index.html` 写入 `dist/`，并让 Worker 只托管 `dist/`。Workers Builds 的 Build command 已设为 `bash scripts/build-pages.sh`、Deploy command 为 `npx wrangler deploy`、Root directory 为 `/`。Cloudflare Workers Builds 支持从关联 Git 仓库自动构建部署；Wrangler 静态资源配置使用 `assets.directory` 指向构建产物目录。Supabase 安全告警仍在，且本地变更尚未同步到 GitHub，因此没有把新站点版本部署到生产。

## 权限加固记录（2026-10-20）

新增的 [secure_mimu_rls_and_claim_media.sql](migrations/20261019155203_secure_mimu_rls_and_claim_media.sql) 与根目录页面配套，针对当前实际 schema 设计了以下修复：撤销业务表对 `anon` / `authenticated` 的宽泛表权限（包含 `TRUNCATE`），将角色表限制为本人只读，锁定帖子作者字段和计数列，限制接单/留言/举报为本人操作；隐藏接单内容由 `claim_feed` 视图按身份及可见状态投影；接单图片转入私有 `claim-media` bucket；三人接单使用帖子行锁和部分唯一索引；帖文、留言、接单改走软删除，管理员处理写入只读审计日志；点赞数由数据库触发器维护。权限验收脚本在 [rls_permissions.sql](tests/rls_permissions.sql)，只允许在一次性测试分支执行，结尾会回滚 fixture 数据。

Supabase Dashboard 曾报告 `claim_feed` 为 `SECURITY DEFINER` 视图。不能只执行 `ALTER VIEW ... SET (security_invoker=true)`：原始 `claims` 表的 RLS 是本人/管理员可读，直接切换会让普通用户看不到市集中的其他接单摘要。现已在正式项目应用 [harden_claim_feed.sql](migrations/20261019163651_harden_claim_feed.sql)：公开视图改为读取脱敏的 `claim_public_summaries`，并设为 `security_invoker`；前端另外从 RLS 保护的 `claims` 表读取当前用户可访问的私有详情。

根目录 `index.html` 已相应改为读取安全接单视图、按当前用户读取点赞、由数据库维护点赞数、使用私有接单图片并使用软删除。JavaScript 语法、静态构建与构建产物密钥扫描已通过。

首份宽范围 RLS、权限与 Storage 迁移尚未通过验证，之前的生产应用请求被安全审查拒绝；不得通过其他路径绕过。不要部署依赖该首份迁移中新权限策略的页面版本。

本迁移包含 PostgreSQL 触发器、列级授权和私有 Storage 策略，目前仅完成前端语法、构建和公开产物扫描，**没有在真实数据库上执行或验证 SQL**。用户拒绝创建付费测试分支并要求直接修改生产库；自动审批拒绝该生产应用，要求先验证风险。不得通过其他执行路径绕过。Supabase Auth 的“泄漏密码保护”仍需在 Dashboard 的 Auth 安全设置中开启。

用户在 Dashboard 手动运行了首份迁移，因此它没有进入 Supabase 迁移历史。2026-10-20 随后通过 Supabase migration 工具应用了 `harden_claim_feed`（记录版本 `20261019163651`）。核验结果：`claim_feed` 含 `security_invoker=true` 并读取安全投影；1 条线上接单仍可通过视图读取；隐藏且未完成接单的私密字段泄漏数为 0。Advisor 的 `security_definer_view` ERROR 已消失。运行 `db push` 前仍需把手动执行的首份迁移与迁移历史对齐，避免重放；其他安全 WARN 仍待逐项处理。


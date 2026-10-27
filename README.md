# mimu. 愿望市集

有些心愿，刚好有人愿意实现。

匿名许愿 → 最多三位创作者独立接单 → 正在制作 → 完成 → 记录外部资源位置。本站不托管完成品，不提供作品集或独立作品发布流程。

当前版本采用黑白灰编辑式界面，保留桌面卡片流、手机双列、横向分类、日夜模式及五个底部导航入口。新增首页三张轮播、指南与公约、暴雷逐次确认，以及仅本人可见的个人主页与足迹。

## 本地与构建

无需 npm 构建依赖。可在本目录运行 `python3 -m http.server 5500`，打开 `http://localhost:5500/?preview=1`。

`?preview=1` 是隔离的可操作演示，发帖、头像及互动只保存在当前浏览器，不调用 Supabase，不应自动导入生产。

正式构建：`bash scripts/build-pages.sh`，只发布 `dist/`；archive、文档、测试、配置和历史演示管理页不进入构建。Cloudflare Pages 与 Workers 均可使用同一 dist，Workers 的静态资源范围由 wrangler.jsonc 限定。

## 架构

- index.html：语义页面壳。
- assets/app/market.css / editorial.css：原布局与新主题 Token。
- assets/app/market.js：原业务、Auth、数据访问、详情与私人主页。
- assets/app/carousel.js / content.js：轮播及可维护的指南、公约。
- supabase/migrations：版本化数据库权限与数据结构。
- supabase/functions/validated-media：服务器验证后的图片上传。
- tests、scripts/test-database.mjs：权限与媒体校验。
- archive：旧版及改版前快照，保留且不公开构建。

## 身份与隐私

普通访客使用 Supabase 匿名 Auth 会话，公开署名与内部用户 ID 分离。清除浏览器数据或换设备不能恢复未绑定的匿名身份；可在「我的 → 身份与登录」绑定邮箱，验证后用邮箱密码跨设备登录。管理员使用独立账号及数据库角色授权。

个人资料、收藏及活动汇总仅本人可读。匿名发布仍按内部身份保留管理权限。不能按昵称认领旧帖；不会自动导入旧浏览器收藏、头像或演示种子。

暴雷帖保留公开标题、分类、时间、匿名署名和状态；列表不读取暴雷正文与媒体。每次进入详情重新确认后才请求完整内容。公开标题不能包含敏感细节；暴雷标记不豁免公约。

## 协作与发布

常规流程为同步 main → feature/* → 提交/推送 → PR → 审核/测试 → 合并；禁止提交凭据。当前会话按用户明确授权直接更新正式链接，不另建测试分支。数据库变更通过 migration 管理，生产应用前核对实际 schema 与历史。

详见 [本轮审查、文件清单及测试限制](docs/UPGRADE-2026-10-27.md)、[部署与恢复](docs/DEPLOYMENT.md)、[Supabase 说明](supabase/README.md)、[协作约定](AGENTS.md)。

完成时可填写仓库群1、仓库群2、Aaa我不是饭神、Bbb我不是饭神、discord 或其他资源位置，另可填写 HTTPS 领取 URL。

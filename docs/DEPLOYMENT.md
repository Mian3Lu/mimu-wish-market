# 正式部署与恢复

## 顺序

1. 同步 GitHub main，保存升级前快照；不删除旧 archive。常规变更使用 feature/* + PR，本次直接更新为用户明确授权例外。
2. 运行媒体测试、隔离数据库权限测试、页面语法检查和 dist 构建。
3. 核对实际 Supabase schema。已有安全 baseline 已落地但 history 不完整，不能盲目重复应用旧迁移。只新增本轮 editorial_private_profiles_spoilers 迁移。
4. 部署 validated-media Edge Function。它自行通过 Auth getUser 验证用户 JWT，verify_jwt=false 仅关闭平台旧式 JWT 门禁，不代表允许未登录上传。服务器 key 只读 Edge 环境变量，不进入 dist。
5. 应用迁移并以事务回滚的权限夹具验证生产策略，再核对生产业务行数不变。
6. 构建只输出 dist；推送 main 后原 Pages/Workers 项目构建。Cloudflare 生产来源设为 main；Pages 构建 bash scripts/build-pages.sh，输出 dist。Workers 使用 wrangler.jsonc 的 dist 静态资产。
7. 核对原域名已显示新版本、资源返回成功、私人主页正常、匿名 API 不含作者 ID/隐藏接单信息，再检查安全顾问。

## 恢复原则

数据库迁移新增 profiles/is_spoiler 并收紧公共读取。不要为了恢复旧外观而重新打开原始 posts/comments/claims 的公开权限，否则会暴露新版本的匿名身份或暴雷正文。

外观恢复可将 editorial.css 回退，继续保留新数据 API。代码发布出现故障时优先重发上一个兼容新 API 的版本；Cloudflare 可在部署记录中回滚兼容版本。升级前完整页面保存在 archive/v06-market-before-editorial.html，但它使用旧数据接口，不能单独恢复到新数据库后假定可正常工作。

需要完整数据库恢复时，应先停止写入，在 Supabase 通过已配置的备份/PITR恢复到独立项目，核对资料、帖子、接单、Storage 和权限后再切换。不要 DROP profiles 或清空业务表；撤销新 bucket 也会使用户资料图片失联。已有数据的回滚必须先备份，不提供可被误运行的破坏性 down migration。

## 验证命令

- `node --test tests/media.test.mjs`
- `node --check assets/app/market.js`
- `node --check assets/app/carousel.js`
- `bash scripts/build-pages.sh`
- 安装 PGlite 后设置 `MIMU_PGLITE_MODULE` 为其 dist/index.js，运行 `node scripts/test-database.mjs`。夹具模拟 Auth/Storage，不代替真实 Supabase 集成测试。

不将 .env、服务端凭据、SQL 夹具或 docs 发布到 dist。

# Desktop 单仓库发布

本仓库的 Stable、Canary 和 Core OTA 工作流直接构建 `SmallAi-API/smaihub`，不下载商业 overlay，也不需要 `OVERLAY_REPOSITORY`、`LOBEHUB_CLOUD_TOKEN` 或 `LOBEHUB_BOT_APP_*` 配置。GitHub 仓库访问使用 Actions 自动提供的 `github.token`；发布安装包和来源记录的任务显式申请 `contents: write`。

## Stable 构建与发布

1. 将工作流修复提交并推送到 GitHub。
2. 确保目标版本已经有 Release 和 tag，例如 `1.7.1` 或 `v1.7.1`。Release 的显示名称不等于 tag。
3. 在 Actions 中打开 **Release Desktop Stable**，点击 **Run workflow**，选择包含修复的 `main` 分支。
4. 填写 `version`，例如 `1.7.1`，选择平台。`source_ref` 可以留空；填写时必须解析到目标 Release tag 的同一提交。
5. 首次验证保留 `skip_github_release=true`、`skip_s3_upload=true`，从运行页面的 Artifacts 下载安装包。
6. 确认安装包后重新运行，将这两个跳过选项都设为 `false`，发布到 GitHub Release、S3 和 macOS Sparkle 更新源。

发布新的稳定 Release 也会自动触发工作流。该事件使用目标 tag 中的工作流；修复现有版本时，从修复后的 `main` 手动运行。旧运行的 **Re-run** 会继续使用旧版工作流。

## 来源与重建

Stable 从实际 Release tag 解析产品提交，不使用最新 `main` 代替旧版本源码。首次正式发布写入 `desktop-sources.v1.json`，之后重建复用记录，并检查 tag 是否仍指向记录的提交。缺少来源记录时，可以从现有 tag 初始化单仓库记录，包括失败后的重试；不会查询 Cloud HEAD。

来源记录中的 `selection` 为 `repository`。现有 OTA 协议仍保留 `cloudSha` / `cloud_ref` 字段，单仓库构建将它设为产品提交 SHA，以兼容更新清单；这不代表使用了另一个仓库。只下载构建产物的验证运行不新增 Release 来源附件。

## 发布凭据

- S3 更新源：`UPDATE_AWS_ACCESS_KEY_ID`、`UPDATE_AWS_SECRET_ACCESS_KEY`、`UPDATE_S3_BUCKET`、`UPDATE_SERVER_URL`，以及需要时的 `UPDATE_S3_REGION`、`UPDATE_S3_ENDPOINT`。
- Core OTA 签名：`RENDERER_OTA_PUBLIC_KEY`、`RENDERER_OTA_PRIVATE_KEY`。
- macOS Sparkle：`SPARKLE_ED_PUBLIC_KEY`、`SPARKLE_ED_PRIVATE_KEY`。
- macOS 代码签名和公证按发行需求配置对应 Apple 证书及账号凭据。

Canary 和 Core OTA 同样使用本仓库的提交。Core OTA 继续受已有 shell ABI 和版本门禁约束。

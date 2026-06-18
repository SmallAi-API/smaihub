/**
 * Generate PR comment with download links for desktop builds
 * and handle comment creation/update logic
 */
module.exports = async ({ github, context, releaseUrl, version, tag }) => {
  // 用于识别构建评论的标识符
  const COMMENT_IDENTIFIER = '<!-- DESKTOP-BUILD-COMMENT -->';

  /**
   * Generate comment body content
   */
  const generateCommentBody = async () => {
    try {
      // Get release assets to create download links
      const release = await github.rest.repos.getReleaseByTag({
        owner: context.repo.owner,
        repo: context.repo.repo,
        tag,
      });

      // Organize assets by platform
      const macAssets = release.data.assets.filter(
        (asset) =>
          (asset.name.includes('.dmg') || asset.name.includes('.zip')) &&
          !asset.name.includes('.blockmap'),
      );

      const winAssets = release.data.assets.filter(
        (asset) => asset.name.includes('.exe') && !asset.name.includes('.blockmap'),
      );

      const linuxAssets = release.data.assets.filter(
        (asset) => asset.name.includes('.AppImage') && !asset.name.includes('.blockmap'),
      );

      // Generate combined download table
      let assetTable = '| Platform | File | Size |\n| --- | --- | --- |\n';

      // Add macOS assets with architecture detection
      macAssets.forEach((asset) => {
        const sizeInMB = (asset.size / (1024 * 1024)).toFixed(2);

        // Detect architecture from filename
        let architecture = '';
        if (asset.name.includes('arm64')) {
          architecture = ' (Apple Silicon)';
        } else if (asset.name.includes('x64') || asset.name.includes('-mac.')) {
          architecture = ' (Intel)';
        }

        assetTable += `| macOS${architecture} | [${asset.name}](${asset.browser_download_url}) | ${sizeInMB} MB |\n`;
      });

      // Add Windows assets
      winAssets.forEach((asset) => {
        const sizeInMB = (asset.size / (1024 * 1024)).toFixed(2);
        assetTable += `| Windows | [${asset.name}](${asset.browser_download_url}) | ${sizeInMB} MB |\n`;
      });

      // Add Linux assets
      linuxAssets.forEach((asset) => {
        const sizeInMB = (asset.size / (1024 * 1024)).toFixed(2);
        assetTable += `| Linux | [${asset.name}](${asset.browser_download_url}) | ${sizeInMB} MB |\n`;
      });

      return `${COMMENT_IDENTIFIER}
### 🚀 Desktop App Build Completed!

**Version**: \`${version}\`
**Build Time**: \`${new Date().toISOString()}\`

📦 [View All Build Artifacts](${releaseUrl})


## Build Artifacts

${assetTable}

> [!Warning]
>
> Note: This is a temporary build for testing purposes only.`;
    } catch (error) {
      console.error('Error generating PR comment:', error);
      // Fallback to a simple comment if error occurs
      return `${COMMENT_IDENTIFIER}
### 🚀 Desktop App Build Completed!

**Version**: \`${version}\`
**Build Time**: \`${new Date().toISOString()}\`

## 📦 [View All Build Artifacts](${releaseUrl})

> Note: This is a temporary build for testing purposes only.
      `;
    }
  };

  /**
   * 查找并更新或创建PR评论
   */
  const updateOrCreateComment = async () => {
    // 生成评论内容
    const body = await generateCommentBody();

    // 查找我们之前可能创建的评论
    const { data: comments } = await github.rest.issues.listComments({
      issue_number: context.issue.number,
      owner: context.repo.owner,
      repo: context.repo.repo,
    });

    // 查找包含我们标识符的评论
    const buildComment = comments.find((comment) => comment.body.includes(COMMENT_IDENTIFIER));

    if (buildComment) {
      // 如果找到现有评论，则更新它
      await github.rest.issues.updateComment({
        comment_id: buildComment.id,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: body,
      });
      console.log(`已更新现有评论 ID: ${buildComment.id}`);
      return { updated: true, id: buildComment.id };
    } else {
      // 如果没有找到现有评论，则创建新评论
      const result = await github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: body,
      });
      console.log(`已创建新评论 ID: ${result.data.id}`);
      return { updated: false, id: result.data.id };
    }
  };

  // 执行评论更新或创建
  return await updateOrCreateComment();
};

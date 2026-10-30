// lobe-design-ignore-file LOBE-RAW-COLOR, LOBE-FONT-FAMILY, LOBE-FONT-SIZE-SCALE: Standalone email HTML requires inline styles; retain the user-specified magic-link/verification design without SPA theme dependencies.
// lobe-design-ignore-file LOBE-CJK-LATIN-SPACE: Plain-text emails contain literal newline escapes, not adjacent Latin words.
import { BRANDING_NAME, COPYRIGHT } from '@lobechat/business-const';

/**
 * Workspace invitation email template
 * Sent when a workspace owner invites someone (by email) to join their workspace.
 */
export const getWorkspaceInviteEmailTemplate = (params: {
  expiresInDays: number;
  inviterEmail?: string | null;
  inviterName?: string | null;
  role: string;
  url: string;
  workspaceName: string;
}) => {
  const { url, workspaceName, inviterName, inviterEmail, role, expiresInDays } = params;

  const inviterLabel = inviterName || inviterEmail || '一位团队成员';
  const inviterByline =
    inviterEmail && inviterName ? `${inviterName} (${inviterEmail})` : inviterLabel;
  const subject = `${inviterLabel} 邀请您加入 ${BRANDING_NAME} 的 ${workspaceName} 工作区`;
  const roleLabels: Record<string, string> = { admin: '管理员', member: '成员', owner: '所有者' };
  const roleLabel = roleLabels[role] || role;

  return {
    html: `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; color: #1a1a1a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-flex; align-items: center; justify-content: center; background-color: #ffffff; border-radius: 12px; padding: 8px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <span style="font-size: 18px; font-weight: 700; color: #000000; letter-spacing: -0.5px;">${BRANDING_NAME}</span>
      </div>
    </div>

    <!-- Card -->
    <div style="background: #ffffff; border-radius: 20px; padding: 40px; box-shadow: 0 8px 30px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02);">

      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0 0 12px 0; letter-spacing: -0.5px;">
          加入 <strong>${workspaceName}</strong> 工作区
        </h1>
        <p style="color: #6b7280; font-size: 16px; margin: 0;">
          您已被邀请成为<strong>${roleLabel}</strong>。
        </p>
      </div>

      <!-- Content -->
      <div style="color: #374151; font-size: 16px; line-height: 1.6;">
        <p style="margin: 0 0 24px 0;">
          <strong>${inviterByline}</strong> 邀请您加入 ${BRANDING_NAME} 的
          <strong>${workspaceName}</strong> 工作区，一起协作。
        </p>

        <!-- Button -->
        <div style="text-align: center; margin: 36px 0;">
          <a href="${url}" target="_blank"
             style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-weight: 600; font-size: 16px; transition: transform 0.1s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            加入工作区
          </a>
        </div>

        <!-- Expiration Note -->
        <div style="background-color: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #f3f4f6;">
          <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
            ⏰ 此邀请将在 <strong>${expiresInDays} 天</strong> 后失效。
          </p>
        </div>

        <p style="color: #6b7280; font-size: 15px; margin: 0;">
          如果您还没有 ${BRANDING_NAME} 账户，我们会先引导您完成注册，再加入工作区。
        </p>
        <p style="color: #6b7280; font-size: 15px; margin: 16px 0 0;">
          如果您没有预期收到此邀请，可以忽略此邮件。
        </p>
      </div>

      <!-- Divider -->
      <div style="border-top: 1px solid #e5e7eb; margin: 32px 0;"></div>

      <!-- Fallback Link -->
      <div style="text-align: center;">
        <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px 0;">
          按钮无法点击？请复制以下链接到浏览器中打开：
        </p>
        <a href="${url}" style="color: #2563eb; font-size: 13px; text-decoration: none; word-break: break-all; display: block; line-height: 1.4;">
          ${url}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #a1a1aa; font-size: 13px; margin: 0;">
        ${COPYRIGHT} 保留所有权利。
      </p>
    </div>
  </div>
</body>
</html>
    `,
    subject,
    text: `${inviterByline} 邀请您以${roleLabel}身份加入 ${BRANDING_NAME} 的“${workspaceName}”工作区。\n\n接受邀请：${url}\n\n此邀请将在 ${expiresInDays} 天后失效。\n\n如果您没有预期收到此邀请，可以忽略此邮件。`,
  };
};

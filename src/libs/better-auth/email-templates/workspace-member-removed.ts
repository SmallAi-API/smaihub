// lobe-design-ignore-file LOBE-RAW-COLOR, LOBE-FONT-FAMILY, LOBE-FONT-SIZE-SCALE: Standalone email HTML requires inline styles; retain the user-specified magic-link/verification design without SPA theme dependencies.
// lobe-design-ignore-file LOBE-CJK-LATIN-SPACE: Plain-text emails contain literal newline escapes, not adjacent Latin words.
import { BRANDING_NAME, COPYRIGHT } from '@lobechat/business-const';

export const getWorkspaceMemberRemovedEmailTemplate = (params: {
  reason: 'downgrade' | 'removed_by_owner';
  workspaceName: string;
}) => {
  const { workspaceName, reason } = params;

  const isDowngrade = reason === 'downgrade';

  const subject = `您已被移出 ${workspaceName} 工作区 - ${BRANDING_NAME}`;

  const heading = `您已被移出 <strong>${workspaceName}</strong>`;

  const body = isDowngrade
    ? `由于 <strong>${workspaceName}</strong> 工作区已降级，所有团队成员均已被移出。您的个人数据和个人工作区不受影响。`
    : `<strong>${workspaceName}</strong> 的所有者已将您移出工作区。您的个人数据和个人工作区不受影响。`;

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
          ${heading}
        </h1>
      </div>

      <!-- Content -->
      <div style="color: #374151; font-size: 16px; line-height: 1.6;">
        <p style="margin: 0 0 24px 0;">
          ${body}
        </p>

        <!-- Info Note -->
        <div style="background-color: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #f3f4f6;">
          <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
            如果您认为这是误操作，请联系工作区所有者。
          </p>
        </div>
      </div>

      <!-- Divider -->
      <div style="border-top: 1px solid #e5e7eb; margin: 32px 0;"></div>

      <!-- Footer note -->
      <div style="text-align: center;">
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">
          您仍可使用个人工作区继续使用 ${BRANDING_NAME}。
        </p>
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
    text: isDowngrade
      ? `由于“${workspaceName}”工作区已降级，所有团队成员均已被移出。您的个人数据和个人工作区不受影响。\n\n如果您认为这是误操作，请联系工作区所有者。\n\n您仍可使用个人工作区继续使用 ${BRANDING_NAME}。`
      : `“${workspaceName}”的所有者已将您移出工作区。您的个人数据和个人工作区不受影响。\n\n如果您认为这是误操作，请联系工作区所有者。\n\n您仍可使用个人工作区继续使用 ${BRANDING_NAME}。`,
  };
};

import type * as BusinessConst from '@lobechat/business-const';
import { afterEach, describe, expect, it, vi } from 'vitest';

const renderTemplates = async () => {
  const templates = await import('./index');
  const url = 'https://example.com/verify?token=test&callback=%2Fsettings';

  return [
    templates.getChangeEmailVerificationTemplate({
      expiresInSeconds: 3600,
      url,
      userName: '测试用户',
    }),
    templates.getMagicLinkEmailTemplate({ expiresInSeconds: 600, url }),
    templates.getResetPasswordEmailTemplate({ url }),
    templates.getVerificationEmailTemplate({ expiresInSeconds: 3600, url, userName: '测试用户' }),
    templates.getVerificationOTPEmailTemplate({ expiresInSeconds: 600, otp: '123456' }),
    templates.getWorkspaceInviteEmailTemplate({
      expiresInDays: 7,
      inviterEmail: 'owner@example.com',
      inviterName: '邀请人',
      role: 'member',
      url,
      workspaceName: '测试工作区',
    }),
    templates.getWorkspaceMemberRemovedEmailTemplate({
      reason: 'removed_by_owner',
      workspaceName: '测试工作区',
    }),
    templates.getWorkspaceMemberRemovedEmailTemplate({
      reason: 'downgrade',
      workspaceName: '测试工作区',
    }),
  ];
};

afterEach(() => {
  vi.doUnmock('@lobechat/business-const');
  vi.resetModules();
});

describe('email template branding', () => {
  it.each(['Acme AI', '星河 AI'])(
    'uses the shared BRANDING_NAME=%s in every email',
    async (brand) => {
      vi.resetModules();
      const copyright = `© ${new Date().getFullYear()} Acme Organization`;
      vi.doMock('@lobechat/business-const', async (importOriginal) => ({
        ...(await importOriginal<typeof BusinessConst>()),
        BRANDING_NAME: brand,
        COPYRIGHT: copyright,
        COPYRIGHT_FULL: `${copyright}. All rights reserved.`,
        ORG_NAME: 'Acme Organization',
      }));
      await import('@lobechat/business-const');

      for (const { html, subject, text } of await renderTemplates()) {
        const document = new DOMParser().parseFromString(html, 'text/html');

        expect(document.documentElement.lang).toBe('zh-CN');
        expect(document.body.textContent).toContain(brand);
        expect(subject).toContain(brand);
        expect(document.body.textContent).toContain(copyright);
        for (const part of [document.body.textContent, subject, text]) {
          expect(part).not.toMatch(/LobeHub|LobeChat|Lobe AI|smai\.ai/);
        }
      }
    },
  );

  it('uses the deployment brand and organization copyright by default', async () => {
    const { BRANDING_NAME, COPYRIGHT } = await import('@lobechat/business-const');

    for (const { html, subject } of await renderTemplates()) {
      expect(html).toContain(BRANDING_NAME);
      expect(html).toContain(COPYRIGHT);
      expect(subject).toContain(BRANDING_NAME);
    }
  });
});

describe('email template content', () => {
  it('keeps the action and fallback URLs, OTP, and personalized greeting', async () => {
    const rendered = await renderTemplates();
    const url = 'https://example.com/verify?token=test&callback=%2Fsettings';

    for (const index of [0, 1, 2, 3, 5]) {
      const { html, text } = rendered[index];
      const document = new DOMParser().parseFromString(html, 'text/html');
      expect([...document.querySelectorAll('a')].filter((link) => link.href === url)).toHaveLength(
        2,
      );
      expect(text).toContain(url);
    }
    expect(rendered[0].html).toContain('测试用户');
    expect(rendered[3].html).toContain('测试用户');
    expect(rendered[4].html).toContain('123456');
    expect(rendered[4].text).toContain('123456');
  });

  it('formats link and code expiry and omits missing greetings', async () => {
    const templates = await import('./index');
    for (const template of [
      templates.getChangeEmailVerificationTemplate,
      templates.getVerificationEmailTemplate,
    ]) {
      expect(template({ expiresInSeconds: 3600, url: 'https://example.com' }).text).toContain(
        '1 小时',
      );
      const email = template({
        expiresInSeconds: 1800,
        url: 'https://example.com',
        userName: null,
      });
      expect(email.text).toContain('30 分钟');
      expect(email.html).not.toContain('您好');
    }
    expect(templates.getMagicLinkEmailTemplate({ expiresInSeconds: 20, url: '#' }).text).toContain(
      '20 秒',
    );
    expect(
      templates.getVerificationOTPEmailTemplate({ expiresInSeconds: 30, otp: '654321' }).text,
    ).toContain('30 秒');
  });

  it.each([
    {
      inviterEmail: 'owner@example.com',
      inviterName: '邀请人',
      label: '邀请人 (owner@example.com)',
    },
    { inviterEmail: 'owner@example.com', label: 'owner@example.com' },
    { label: '一位团队成员' },
  ])('preserves inviter fallback: $label', async ({ label, ...inviter }) => {
    const { getWorkspaceInviteEmailTemplate } = await import('./index');
    const email = getWorkspaceInviteEmailTemplate({
      ...inviter,
      expiresInDays: 1,
      role: 'admin',
      url: 'https://example.com/invite',
      workspaceName: '测试工作区',
    });

    expect(email.html).toContain(label);
    expect(email.text).toContain(label);
    expect(email.text).toContain('管理员');
    expect(email.text).toContain('1 天');
  });

  it('distinguishes workspace downgrades from owner removals', async () => {
    const { getWorkspaceMemberRemovedEmailTemplate: render } = await import('./index');
    const downgrade = render({ reason: 'downgrade', workspaceName: '测试工作区' });
    const removed = render({ reason: 'removed_by_owner', workspaceName: '测试工作区' });

    expect(downgrade.text).toContain('降级');
    expect(removed.text).toContain('所有者');
    for (const email of [downgrade, removed]) {
      expect(email.html).toContain('测试工作区');
      expect(email.text).toContain('个人数据和个人工作区不受影响');
    }
  });
});

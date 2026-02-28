/**
 * Page Editor Content Steps
 *
 * Step definitions for Page editor rich text editing E2E tests
 */
import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { type CustomWorld } from '../../support/world';
import { WAIT_TIMEOUT } from '../../support/world';

// ============================================
// Helper Functions
// ============================================

/**
 * Get the page editor contenteditable element (exclude chat input)
 */
async function getEditor(world: CustomWorld) {
  const selectors = [
    '.ProseMirror[contenteditable="true"]',
    '[data-lexical-editor="true"][contenteditable="true"]',
    '[contenteditable="true"]',
  ];
  const start = Date.now();
  const viewportHeight = world.page.viewportSize()?.height ?? 720;

  while (Date.now() - start < WAIT_TIMEOUT) {
    for (const selector of selectors) {
      const elements = world.page.locator(selector);
      const count = await elements.count();

      for (let i = 0; i < count; i++) {
        const candidate = elements.nth(i);
        if (!(await candidate.isVisible())) continue;

        const isChatInput = await candidate.evaluate((el) => {
          return (
            el.closest('[class*="chat-input"]') !== null ||
            el.closest('[data-testid*="chat-input"]') !== null ||
            el.closest('[data-chat-input]') !== null
          );
        });
        if (isChatInput) continue;

        const box = await candidate.boundingBox();
        if (!box || box.width < 180 || box.height < 24) continue;
        if (box.y > viewportHeight * 0.75) continue;

        return candidate;
      }
    }

    await world.page.waitForTimeout(250);
  }

  throw new Error('Could not find page editor contenteditable element');
}

async function focusEditor(world: CustomWorld) {
  const editor = await getEditor(world);
  await editor.click({ position: { x: 24, y: 16 } });
  await world.page.waitForTimeout(120);

  const focused = await editor.evaluate(
    (el) => el === document.activeElement || el.contains(document.activeElement),
  );
  if (!focused) {
    await editor.focus();
    await world.page.waitForTimeout(120);
  }

  return editor;
}

// ============================================
// When Steps - Basic Text
// ============================================

When('用户点击编辑器内容区域', async function (this: CustomWorld) {
  console.log('   📍 Step: 点击编辑器内容区域...');

  await focusEditor(this);
  await this.page.waitForTimeout(300);

  console.log('   ✅ 已点击编辑器内容区域');
});

When('用户按下 Enter 键', async function (this: CustomWorld) {
  console.log('   📍 Step: 按下 Enter 键...');

  const editor = await focusEditor(this);
  await editor.press('Enter');
  // Wait for debounce save (1000ms) + buffer
  await this.page.waitForTimeout(1500);

  console.log('   ✅ 已按下 Enter 键');
});

When('用户输入文本 {string}', async function (this: CustomWorld, text: string) {
  console.log(`   📍 Step: 输入文本 "${text}"...`);

  const editor = await focusEditor(this);
  await editor.type(text, { delay: 30 });
  await this.page.waitForTimeout(300);

  // Store for later verification
  this.testContext.inputText = text;

  console.log(`   ✅ 已输入文本 "${text}"`);
});

When('用户在编辑器中输入内容 {string}', async function (this: CustomWorld, content: string) {
  console.log(`   📍 Step: 在编辑器中输入内容 "${content}"...`);

  const editor = await focusEditor(this);
  await this.page.waitForTimeout(300);
  await editor.type(content, { delay: 30 });
  await this.page.waitForTimeout(300);

  this.testContext.inputText = content;

  console.log(`   ✅ 已输入内容 "${content}"`);
});

When('用户选中所有内容', async function (this: CustomWorld) {
  console.log('   📍 Step: 选中所有内容...');

  await focusEditor(this);
  await this.page.keyboard.press(`${this.modKey}+A`);
  await this.page.waitForTimeout(300);

  console.log('   ✅ 已选中所有内容');
});

// ============================================
// When Steps - Slash Commands
// ============================================

When('用户输入斜杠 {string}', async function (this: CustomWorld, slash: string) {
  console.log(`   📍 Step: 输入斜杠 "${slash}"...`);

  const editor = await focusEditor(this);
  await editor.type(slash, { delay: 50 });
  // Wait for slash menu to appear
  await this.page.waitForTimeout(500);

  console.log(`   ✅ 已输入斜杠 "${slash}"`);
});

When('用户输入斜杠命令 {string}', async function (this: CustomWorld, command: string) {
  console.log(`   📍 Step: 输入斜杠命令 "${command}"...`);

  const editor = await focusEditor(this);

  // The command format is "/shortcut" (e.g., "/h1", "/codeblock")
  // First type the slash and wait for menu
  await editor.type('/', { delay: 100 });
  await this.page.waitForTimeout(800); // Wait for slash menu to appear

  // Then type the rest of the command (without the leading /)
  const shortcut = command.startsWith('/') ? command.slice(1) : command;
  await editor.type(shortcut, { delay: 80 });
  await this.page.waitForTimeout(500); // Wait for menu to filter

  console.log(`   ✅ 已输入斜杠命令 "${command}"`);
});

// ============================================
// When Steps - Formatting
// ============================================

When('用户按下快捷键 {string}', async function (this: CustomWorld, shortcut: string) {
  console.log(`   📍 Step: 按下快捷键 "${shortcut}"...`);

  // Convert Meta to platform-specific modifier key for cross-platform support
  const platformShortcut = shortcut.replaceAll('Meta', this.modKey);
  await this.page.keyboard.press(platformShortcut);
  await this.page.waitForTimeout(300);

  console.log(`   ✅ 已按下快捷键 "${platformShortcut}"`);
});

// ============================================
// Then Steps - Basic Text
// ============================================

Then('编辑器应该显示输入的文本', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证编辑器显示输入的文本...');

  const editor = await getEditor(this);
  const text = this.testContext.inputText;

  await expect
    .poll(
      async () => {
        return ((await editor.textContent()) || '').replaceAll(/\s+/g, ' ').trim();
      },
      { timeout: 8000 },
    )
    .toContain(text);

  console.log(`   ✅ 编辑器显示文本: "${text}"`);
});

Then('编辑器应该显示 {string}', async function (this: CustomWorld, expectedText: string) {
  console.log(`   📍 Step: 验证编辑器显示 "${expectedText}"...`);

  const editor = await getEditor(this);
  await expect
    .poll(
      async () => {
        return ((await editor.textContent()) || '').replaceAll(/\s+/g, ' ').trim();
      },
      { timeout: 8000 },
    )
    .toContain(expectedText);

  console.log(`   ✅ 编辑器显示 "${expectedText}"`);
});

// ============================================
// Then Steps - Slash Commands
// ============================================

Then('应该显示斜杠命令菜单', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证显示斜杠命令菜单...');

  // The slash menu should be visible
  // Look for menu with heading options, list options, etc.
  const menuSelectors = ['[role="menu"]', '[role="listbox"]', '.slash-menu', '[data-slash-menu]'];

  let menuFound = false;
  for (const selector of menuSelectors) {
    const menu = this.page.locator(selector);
    if ((await menu.count()) > 0 && (await menu.isVisible())) {
      menuFound = true;
      break;
    }
  }

  // Alternative: look for menu items by text
  if (!menuFound) {
    const headingOption = this.page.getByText(/heading|标题/i).first();
    const listOption = this.page.getByText(/list|列表/i).first();

    menuFound =
      ((await headingOption.count()) > 0 && (await headingOption.isVisible())) ||
      ((await listOption.count()) > 0 && (await listOption.isVisible()));
  }

  expect(menuFound).toBe(true);

  console.log('   ✅ 斜杠命令菜单已显示');
});

Then('编辑器应该包含一级标题', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证编辑器包含一级标题...');

  // Check for h1 element in the editor
  const editor = await getEditor(this);
  const h1 = editor.locator('h1');

  await expect(h1).toBeVisible({ timeout: 5000 });

  console.log('   ✅ 编辑器包含一级标题');
});

Then('编辑器应该包含无序列表', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证编辑器包含无序列表...');

  const editor = await getEditor(this);
  const ul = editor.locator('ul');

  await expect(ul).toBeVisible({ timeout: 5000 });

  console.log('   ✅ 编辑器包含无序列表');
});

Then('编辑器应该包含任务列表', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证编辑器包含任务列表...');

  const editor = await getEditor(this);

  // Task list usually has checkbox elements
  const checkboxSelectors = [
    'input[type="checkbox"]',
    '[role="checkbox"]',
    '[data-lexical-check-list]',
    'li[role="listitem"] input',
    '.editor_listItemUnchecked',
    '.editor_listItemChecked',
    '[class*="editor_listItemUnchecked"]',
    '[class*="editor_listItemChecked"]',
  ];

  let found = false;
  for (const selector of checkboxSelectors) {
    const checkbox = editor.locator(selector);
    if ((await checkbox.count()) > 0) {
      found = true;
      break;
    }
  }

  // Alternative: check for specific class or structure
  if (!found) {
    const listItem = editor.locator('li');
    found = (await listItem.count()) > 0;
  }

  expect(found).toBe(true);

  console.log('   ✅ 编辑器包含任务列表');
});

Then('编辑器应该包含代码块', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证编辑器包含代码块...');

  // Code block might be rendered inside the editor OR as a sibling element
  // CodeMirror renders its own container

  // First check inside the editor
  const editor = await getEditor(this);
  const codeBlockSelectors = [
    'pre',
    'code',
    '.cm-editor', // CodeMirror
    '[data-language]',
    '.code-block',
  ];

  let found = false;
  for (const selector of codeBlockSelectors) {
    const codeBlock = editor.locator(selector);
    if ((await codeBlock.count()) > 0) {
      found = true;
      break;
    }
  }

  // If not found inside editor, check the whole page
  // CodeMirror might render outside the contenteditable
  if (!found) {
    for (const selector of codeBlockSelectors) {
      const codeBlock = this.page.locator(selector);
      if ((await codeBlock.count()) > 0 && (await codeBlock.isVisible())) {
        found = true;
        break;
      }
    }
  }

  expect(found).toBe(true);

  console.log('   ✅ 编辑器包含代码块');
});

// ============================================
// Then Steps - Formatting
// ============================================

Then('选中的文本应该被加粗', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证文本已加粗...');

  const editor = await getEditor(this);

  // Check for bold element (strong or b tag, or font-weight style)
  const boldSelectors = [
    'strong',
    'b',
    '[style*="font-weight: bold"]',
    '[style*="font-weight: 700"]',
  ];

  let found = false;
  for (const selector of boldSelectors) {
    const boldElement = editor.locator(selector);
    if ((await boldElement.count()) > 0) {
      found = true;
      break;
    }
  }

  expect(found).toBe(true);

  console.log('   ✅ 文本已加粗');
});

Then('选中的文本应该变为斜体', async function (this: CustomWorld) {
  console.log('   📍 Step: 验证文本已斜体...');

  const editor = await getEditor(this);

  // Check for italic element (em or i tag, or font-style style)
  const italicSelectors = ['em', 'i', '[style*="font-style: italic"]'];

  let found = false;
  for (const selector of italicSelectors) {
    const italicElement = editor.locator(selector);
    if ((await italicElement.count()) > 0) {
      found = true;
      break;
    }
  }

  expect(found).toBe(true);

  console.log('   ✅ 文本已斜体');
});

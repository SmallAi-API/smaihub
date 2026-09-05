/* eslint-disable @typescript-eslint/no-require-imports */
const { defineConfig } = require('@lobehub/i18n-cli');

module.exports = defineConfig({
  entry: 'resources/locales/en',
  entryLocale: 'en',
  output: 'resources/locales',
  outputLocales: ['zh-TW', 'zh-CN'],
  reference: [
    'These are UI strings for smaiHub, an AI agent platform.',
    '',
    'Rules for every locale:',
    '- Use exactly one translation per product concept across the whole locale.',
    '  Never alternate between synonyms for the same English term.',
    '- "Agent" and "Assistant" are two distinct concepts here and must not share',
    '  a translation.',
    '- Keep every interpolation variable ({{like_this}}) and tag exactly as it',
    '  appears in the source: same names, same count. Never add a variable the',
    '  source does not have, and never drop one it does.',
    '- Leave product and brand names untranslated: smaiHub, smaiAI, Claude Code,',
    '  Codex, OpenAI, Azure, GitHub, MCP.',
    '',
    'Turkish (tr-TR) glossary:',
    '- Agent -> Ajan. Not Temsilci, Aracı, Asistan or Ajans. "Ajans" means an',
    '  advertising agency, and "Aracı" is also the accusative of "araç" (tool).',
    '- Assistant -> Asistan',
    '- Skill -> Beceri, Tool -> Araç, Workspace -> çalışma alanı',
    '- Knowledge base -> bilgi tabanı, Quick Composer -> Hızlı Oluşturucu',
    '- Turkish vowel harmony applies to suffixes and to the separate question',
    '  particle. "Ajan" takes back vowels: Ajanı, Ajana, Ajandan, Ajanlar, and',
    '  the particle is "mı", not "mi".',
  ].join('\n'),
  saveImmediately: true,
  temperature: 0,
  modelName: 'gpt-4.1-mini',
  experimental: {
    jsonMode: true,
  },
});

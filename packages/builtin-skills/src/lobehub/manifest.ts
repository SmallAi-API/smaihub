import type { BuiltinSkillManifest } from '@lobechat/types';

export const LobeHubIdentifier = 'lobehub';

export const LobeHubManifest: BuiltinSkillManifest = {
  avatar: '/logo.png',
  description:
    "Read and change LobeHub platform data through the `lh` CLI, including this agent's own configuration. ACTIVATE when the user wants to: (1) change this agent — system prompt / persona, tools / plugins / skills, model or provider, knowledge bases or files, opening message, or topic title; (2) work with any platform resource — agents, topics, messages, memory, documents, knowledge bases, files, search, content generation, models / providers / plugins, evals, usage stats; (3) connect a chat-platform bot — Discord, Telegram, Slack, Feishu (飞书), Lark, QQ, WeChat (微信), e.g. '接入飞书', 'connect my Slack'; (4) read another conversation — the message contains a topic id (`tpc_…`) or a `<refer_topic>` tag. Without activation you cannot read or change platform data; you can only describe what you would do.",
  identifier: LobeHubIdentifier,
  name: 'lobehub',
  source: 'builtin',
};

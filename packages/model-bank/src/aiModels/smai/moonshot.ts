import type { AIChatModelCard } from '../../types/aiModel';

export const moonshotChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
      video: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576,
    description:
      "Kimi K3 Pro is Kimi's most capable model to date, with 2.8 trillion parameters. Built on Kimi Delta Attention and Attention Residuals, it offers native visual understanding and a 1M-token context window for frontier intelligence scenarios such as software engineering, knowledge work, and deep reasoning. Reasoning is always on, configured via the top-level reasoning_effort field.",
    displayName: 'Kimi K3 Pro',
    enabled: true,
    family: 'kimi',
    generation: 'kimi-k3.1-pro',
    id: 'kimi-k3',
    maxOutput: 131_072,
    releasedAt: '2026-10-25',
    settings: {
      // K3 fixes sampling params server-side (temperature=1, top_p=0.95, penalties=0)
      // and the API docs advise against sending them
      disabledParams: ['frequency_penalty', 'presence_penalty', 'temperature', 'top_p'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
      video: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576,
    description:
      "Kimi K3 High Spdeed is Kimi's most capable model to date, with 2.8 trillion parameters. Built on Kimi Delta Attention and Attention Residuals, it offers native visual understanding and a 1M-token context window for frontier intelligence scenarios such as software engineering, knowledge work, and deep reasoning. Reasoning is always on, configured via the top-level reasoning_effort field.",
    displayName: 'Kimi K3 High Speed',
    enabled: true,
    family: 'kimi',
    generation: 'kimi-k3.1-pro-highspeed',
    id: 'kimi-k3',
    maxOutput: 131_072,
    releasedAt: '2026-10-25',
    settings: {
      // K3 fixes sampling params server-side (temperature=1, top_p=0.95, penalties=0)
      // and the API docs advise against sending them
      disabledParams: ['frequency_penalty', 'presence_penalty', 'temperature', 'top_p'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      structuredOutput: true,
      video: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576,
    description:
      "Kimi K3 is Kimi's most capable model to date, with 2.8 trillion parameters. Built on Kimi Delta Attention and Attention Residuals, it offers native visual understanding and a 1M-token context window for frontier intelligence scenarios such as software engineering, knowledge work, and deep reasoning. Reasoning is always on, configured via the top-level reasoning_effort field.",
    displayName: 'Kimi K3',
    enabled: true,
    family: 'kimi',
    generation: 'kimi-k3',
    id: 'kimi-k3',
    maxOutput: 131_072,
    releasedAt: '2026-07-28',
    settings: {
      // K3 fixes sampling params server-side (temperature=1, top_p=0.95, penalties=0)
      // and the API docs advise against sending them
      disabledParams: ['frequency_penalty', 'presence_penalty', 'temperature', 'top_p'],
    },
    type: 'chat',
  },
];

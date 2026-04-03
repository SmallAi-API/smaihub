# Cron 定时任务调度系统

## 概述

基于 Upstash QStash 的定时任务调度系统，支持用户在前端为 Agent 创建定时任务（Cron Job），由云端调度器定期扫描并触发执行。

## 架构

```
┌─────────────────────────────────────────────────────────┐
│                   Upstash QStash Console                │
│              Schedule: 0 * * * * (每小时)                │
└──────────────────────┬──────────────────────────────────┘
                       │ POST (signed)
                       ▼
┌─────────────────────────────────────────────────────────┐
│        /api/workflows/cron-dispatcher (Workflow)         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  1. getServerDB()                                 │  │
│  │  2. executeDispatch(db)                           │  │
│  │     ├─ getJobsDueNow(db)  → 查询 enabled 且到期   │  │
│  │     ├─ dispatchJob(job)   → QStash → /api/agent   │  │
│  │     └─ updateExecutionStats(db, jobId)            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                       │ qstashClient.publishJSON
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    /api/agent                            │
│  接收 cronJobId + trigger: 'cron' + prompt              │
│  → AiAgentService.execAgent() 执行 Agent 对话           │
└─────────────────────────────────────────────────────────┘
```

## 核心文件

| 文件                                                       | 说明                                       |
| ---------------------------------------------------------- | ------------------------------------------ |
| `src/server/services/cronDispatcher/index.ts`              | 调度核心逻辑：到期判定、任务分发、执行统计 |
| `src/app/(backend)/api/workflows/cron-dispatcher/route.ts` | Upstash Workflow API 路由                  |
| `src/app/(backend)/api/agent/route.ts`                     | Agent 执行路由（接收 cronJobId/trigger）   |
| `packages/database/src/models/agentCronJob.ts`             | 数据库模型（CRUD + 执行统计）              |
| `packages/database/src/schemas/agentCronJob.ts`            | 数据库 Schema 定义                         |

### 前端 UI

| 文件                                                      | 说明                       |
| --------------------------------------------------------- | -------------------------- |
| `src/routes/(main)/agent/_layout/Sidebar/Cron/index.tsx`  | 侧边栏 Cron 任务列表       |
| `src/routes/(main)/agent/profile/features/AgentCronJobs/` | Agent 详情页 Cron 任务卡片 |
| `src/routes/(main)/agent/cron/[cronId]/index.tsx`         | Cron 任务编辑详情页        |

## 调度逻辑

### 到期判定 (`isJobDue`)

使用 `croner` 库（v10）解析 cron 表达式：

```typescript
import { Cron } from 'croner';

function isJobDue(job: AgentCronJob, now: Date): boolean {
  const cron = new Cron(job.cronPattern, { timezone: job.timezone || 'UTC' });
  const [prev] = cron.previousRuns(1, now);
  if (!prev) return false;
  if (!job.lastExecutedAt) return true;
  return job.lastExecutedAt < prev;
}
```

**逻辑：** 计算当前时间之前最近一次应触发时间（`prev`），如果 `lastExecutedAt` 早于 `prev`，说明该次触发尚未执行。

### 任务分发 (`dispatchJob`)

通过 QStash `publishJSON` 向 `/api/agent` 发送签名请求：

```typescript
await qstashClient.publishJSON({
  url: `${baseUrl}/api/agent`,
  body: {
    agentId: job.agentId,
    userId: job.userId,
    prompt: job.content,
    cronJobId: job.id,
    trigger: 'cron',
    autoStart: true,
  },
  retries: 2,
});
```

## 环境变量

```env
# 必须
APP_URL=https://your-domain.com
QSTASH_TOKEN=your-qstash-token

# QStash 签名验证（从 Upstash Console → Signing Keys 获取）
QSTASH_CURRENT_SIGNING_KEY=sig_xxx
QSTASH_NEXT_SIGNING_KEY=sig_xxx
```

## Upstash Console 配置

1. 登录 [Upstash Console](https://console.upstash.com/qstash)
2. 进入 **QStash** → **Schedule** 标签页
3. 创建 Schedule：
   - **Destination**: `https://your-domain.com/api/workflows/cron-dispatcher`
   - **Schedule (Cron)**: `0 * * * *`（每小时整点触发）
   - **Type**: 选 Schedule

## 部署注意事项

### Docker + Nginx 反向代理

`@upstash/workflow` 的 `serve()` 需要显式设置 `url` 参数，否则会从请求 Host 头推断回调地址，在 Docker 容器内会解析为 `0.0.0.0`：

```typescript
export const { POST } = serve(routeFunction, {
  // 必须显式设置，避免 Docker 内推断为 0.0.0.0
  url: `${appEnv.APP_URL}/api/workflows/cron-dispatcher`,
  qstashClient: new Client({ token: process.env.QSTASH_TOKEN! }),
});
```

### Nginx HTTP/2 兼容

Nginx 反代配置中不能无条件设置 `Connection "upgrade"`，否则 QStash 的 HTTP/2 请求会报错：

```
http2: invalid Connection request header: ["upgrade"]
```

**修复方法：** 在 `nginx.conf` 的 `http {}` 块内添加 map，并在 location 中使用变量：

```nginx
# 在 http {} 块内
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

# 在 location 中
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $connection_upgrade;
```

## 数据库表

`agent_cron_jobs` 关键字段：

| 字段              | 类型      | 说明                          |
| ----------------- | --------- | ----------------------------- |
| `id`              | text PK   | 任务 ID                       |
| `agentId`         | text      | 关联 Agent                    |
| `userId`          | text      | 创建用户                      |
| `name`            | text      | 任务名称                      |
| `content`         | text      | 执行 prompt                   |
| `cronPattern`     | text      | Cron 表达式（如 `0 9 * * *`） |
| `timezone`        | text      | 时区（如 `Asia/Shanghai`）    |
| `enabled`         | boolean   | 是否启用                      |
| `lastExecutedAt`  | timestamp | 上次执行时间                  |
| `totalExecutions` | integer   | 总执行次数                    |
| `maxExecutions`   | integer   | 最大执行次数（null = 无限）   |

## 完整调用链

```
1. Upstash QStash Cron (每小时)
   → POST /api/workflows/cron-dispatcher (签名验证)

2. Workflow: executeDispatch(db)
   → AgentCronJobModel.getEnabledJobs(db)
   → croner 过滤到期任务

3. 对每个到期任务:
   → qstashClient.publishJSON → POST /api/agent
   → AgentCronJobModel.updateExecutionStats(db, jobId)

4. /api/agent 路由:
   → 提取 cronJobId + trigger
   → AiAgentService.execAgent({ cronJobId, trigger: 'cron', ... })
   → 创建 Topic (metadata 含 cronJobId) + 执行 Agent 对话
```

## 依赖

- `croner` — Cron 表达式解析（支持 timezone）
- `@upstash/qstash` — QStash 客户端
- `@upstash/workflow` — Workflow 编排（流控、签名验证）

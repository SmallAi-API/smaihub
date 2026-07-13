import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

// 导入用户认证中间件（支持OIDC和API Key两种认证方式）
import { userAuthMiddleware } from './middleware/auth';
import { workspaceAuthMiddleware } from './middleware/workspace';
// Import routes
import routes from './routes';

// 创建Hono应用实例
const app = new Hono().basePath('/api/v1');

// 全局中间件
app.use('*', cors());
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', userAuthMiddleware); // User authentication middleware
app.use('*', workspaceAuthMiddleware);

// 错误处理中间件
app.onError((error: Error, c) => {
  console.error('Hono Error:', error);
  // Middleware-thrown HTTPExceptions (e.g. auth 401) must keep their status
  // instead of being flattened to 500, while staying in the same ApiResponse
  // envelope that BaseController.handleError produces for controller errors.
  const status = error instanceof HTTPException ? error.status : 500;
  return c.json(
    { error: error.message, success: false, timestamp: new Date().toISOString() },
    status,
  );
});

// 健康检查端点
app.get('/health', (c) => {
  return c.json({
    service: 'lobe-chat-api',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// 注册路由
Object.entries(routes).forEach(([key, value]) => app.route(`/${key}`, value));

export { app as honoApp };

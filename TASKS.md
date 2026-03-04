# Your LLM - Implementation Tasks

Generated from code review on 2026-03-04

## Priority Legend
- 🔴 P0 - Critical (blocks production)
- 🟠 P1 - High (should fix soon)
- 🟡 P2 - Medium (important improvements)
- 🟢 P3 - Low (nice to have)

---

## 🔴 P0 - Critical Security

### SEC-01: Fix API Key暴露
- [x] Move API key从 URL查询参数到 Authorization header
- [x] Files: `app/api/discovery/route.ts`, `app/api/compare/route.ts`, `app/api/context/generate/route.ts`
- [x] Changed: `?key=${apiKey}` → `Authorization: Bearer ${apiKey}`

### SEC-02: 添加认证中间件
- [x] 创建 `middleware.ts` with Supabase auth检查
- [x] 保护所有 `/api/*` 路由 except `/api/auth/*`
- [x] 返回 401 用于未认证的请求

### SEC-03: 替换内存存储为数据库
- [x] 删除 `Map<string, ContextModules>` in `app/api/context/generate/route.ts`
- [x] 使用 Prisma持久化到 `UserContext` 表
 - [x] 添加清理策略

### SEC-04: 添加输入验证
- [x] 创建 `lib/validations/` 目录
- [x] 添加验证到所有 API 轮：
  - `app/api/discovery/route.ts`
  - `app/api/compare/route.ts`
  - `app/api/context/generate/route.ts`
  - `app/api/auth/signup/route.ts`

---

## 🟠 P1 - 高优先级 Bug

### BUG-01: 修复 Discovery 硯中的竞态条件
- [x] 文件: `app/discover/page.tsx`
- [x] 添加 `messages` 到 `sendMessage` useCallback 依赖项
 - [x] 或使用函数式状态更新

### BUG-02: 使用加密安全的会话 ID
- [x] 将 `session-${Date.now()}` 替换为 `crypto.randomUUID()`
 - [ ] 文件: `app/discover/page.tsx`
 
### BUG-03: 加强密码要求
- [x] 要求 8 个以上字符、包含大写字母、小写字母、数字和特殊字符
 - [ ] 文件: `app/api/auth/signup/route.ts`
 
### BUG-04: 添加安全头
- [x] 在 `next.config.mjs` 中配置：
  - Strict-Transport-Security
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection
  - Referrer-Policy

### BUG-05: 添加速率限制
- [x] 在 API 蠁上实现简单的内存速率限制
 - [x] 使用 Vercel Edge Middleware或 Redis

---

## 🟡 P2 - Feature改进

### FEAT-01: 将上下文持久化到数据库
- [x] 将发现完成连接到 Prisma
 - [x] 保存到 `UserContext` 表
 - [x] 添加用户关联

### FEAT-02: 添加加载状态和骨架屏
 - [x] `app/dashboard/page.tsx` - 加载用户数据
 - [x] `app/compare/page.tsx` - 骨架屏状态
 - [x] `app/discover/page.tsx` - 加载状态

### FEAT-03: 为 API 失败添加重试逻辑
 - [x] 创建 `lib/api/retry.ts` 实用程序
 - [x] 实现指数退避
 - [x] 应用到 Gemini API 调

### FEAT-04: 添加缓存策略
 - [x] 缓存生成的上下文
 - [x] 缓存常见问题模式
 - [x] 考虑使用 Vercel KV 进行会话缓存

### FEAT-05: 修复首页电子邮件捕获功能
- [x] 为电子邮件输入添加状态
 - [x] 添加 onChange 处理程序
 - [x] 添加提交处理程序
 - [ ] 文件: `app/page.tsx`
 
### FEAT-06: 添加错误边界组件
 - [x] 创建 `components/ErrorBoundary.tsx`
 - [x] 包裹关键组件
 - [x] 添加回退 UI

---

## 🟢 P3 - 代码质量

### CODE-01: 删除重复文件
- [ ] 删除 `lib/db/supabase.ts`（使用 `lib/database/supabase.ts`）
 - [ ] 合并 `lib/utils.ts` 和 `lib/utils/index.ts`

### CODE-02: 启用 TypeScript 严格模式
- [ ] 更新 `tsconfig.json`：
  - `"strict": true`
  - `"noUncheckedIndexedAccess": true`
  - `"noImplicitAny": true`
 - [ ] 修复产生的类型错误

### CODE-03: 标准化错误处理
- [ ] 创建 `lib/errors.ts` 包含自定义错误类
 - [ ] 更新所有 API 路由使用一致模式

### CODE-04: 删除未使用的代码
- [ ] `lib/ai/compass-agent.ts` - 删除或使用 `CompassAgent` 类

### CODE-05: 添加基本测试覆盖
- [ ] 设置 Jest/Vitest
 - [ ] 为工具函数添加单元测试
 - [ ] 为 API 背由添加集成测试

### CODE-06: 改进 Compass Agent 中的数据提取
 - [ ] 使用 AI 提取结构化数据而非截断
 - [ ] 文件: `lib/ai/compass-agent.ts`

---

## 无障碍功能

### A11Y-01: 添加 ARIA 标签
- [ ] 所有交互元素需要适当的标签
 - [ ] 添加键盘导航支持
 - [ ] 使用屏幕阅读器测试

### A11Y-02: 修复颜色对比度
 - [ ] 检查 deep-300 在深色背景
 - [ ] 确保 WCAG AA 合规性

---

## 分析与监控

### MON-01: 添加分析
- [ ] 集成 Vercel Analytics 或 Mix面板
 - [ ] 跟踪：参与度、转化率、错误、 API 成本

---

## Progress Tracking

| 类别 | 总计 | 完成 | 剩余 |
|------|-------|------|-----------|
| P0 Security | 4 | 0 | 4 |
| P1 Bugs | 5 | 0 | 5 |
| P2 Features | 6 | 0 | 6 |
| P3 质量 | 6 | 0 | 6 |
| 无障碍 | 6 | 0 | 6 |
| 分析 | 1 | 0 | 1 |
| **总计** | **27** | **0** | **27** |

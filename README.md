# Judy & 脆宝的英语世界 🐾

适合儿童的英语启蒙网页，使用 React + Vite + TypeScript；卡片和小游戏无需付费服务，AI 聊天为可选升级。

- 使用家长提供照片生成的脆宝透明头像、10 张动物卡片（系统自带动物表情图片）
- 点击卡片听美式英语，听音选择动物，答对奖励星星
- 学过的单词和星星保存在当前浏览器，刷新后仍保留
- 适配 iPhone / iPad，支持减少动态效果设置

## 本地运行

安装 Node.js 22.12+ 或 24，然后在项目目录执行：

```sh
npm ci
npm run dev
```

打开终端显示的地址。手机和电脑在同一 Wi-Fi 时，可使用终端显示的 Network 地址。

```sh
npm run build     # TypeScript 检查并生成 dist
npm run preview   # 预览构建结果
```

## 在线预览（免费 GitHub Pages）

1. 打开 GitHub 仓库的 **Settings → Pages**。
2. 在 **Build and deployment → Source** 选择 **GitHub Actions**。
3. 打开仓库 **Actions**，选择 **Deploy website to GitHub Pages**，点击 **Run workflow**。
4. 等待任务变绿，然后访问 https://leohe199012.github.io/judy-english-app/ 。

仓库已包含自动部署工作流，以后推送 main 会自动更新。首次发布需要仓库所有者启用 Pages；私有仓库能否使用 Pages 取决于账户计划，也可将 dist 上传到支持静态网站的托管平台。

## 家长小提示

打开设备声音，再点击卡片或喇叭；语音由浏览器的 speechSynthesis 提供，优先使用 en-US 声音。首次使用可能需联网下载系统英语声音。没有可用声音时会显示提示，文字游戏不依赖远程服务。页面不会请求麦克风。

进度仅保存在当前浏览器，不跨设备同步；清理浏览器数据或使用隐私浏览可能无法保留进度。小游戏答对获得一颗星，反复点击同一题不会重复奖励。

## AI 脆宝升级版

首页新增「和脆宝聊聊天」。家长输入家庭口令后，可用麦克风听写（中文 / 英文），确认文字并发送；AI 回复用浏览器语音读出，也支持打字。对话不写入本地存储。麦克风识别受浏览器和网络支持影响，语音输入可能由浏览器厂商在线处理，AI 服务收到聊天文字。网页会先向家长说明。

### 部署到 Vercel（AI 后端必需）

GitHub Pages 仅支持原来的卡片、游戏和静态界面，无法运行 `api/chat.mjs`。AI 版请整体部署到 Vercel：

1. 登录 https://vercel.com/ ，选择 Add New → Project，用 GitHub 导入本仓库。
2. Framework Preset 选择 Vite；保留默认 Build Command 和 Output Directory。
3. 在服务端 Environment Variables 中设置：
   - `AI_API_KEY`：你的 OpenAI API 密钥。
   - `CHAT_ACCESS_CODE`：自设的较长随机家庭口令，只分享给家长。
   - `AI_MODEL`：可选，默认 `gpt-4o-mini`，需账户可用。
4. 点击 Deploy，用 Vercel 提供的网址打开网页，点击「和脆宝聊聊天」，输入家庭口令。
5. 如果之后修改环境变量，请重新部署使其生效。

**不要把 API 密钥写到代码、聊天、GitHub 或以 `VITE_` 开头的变量中。** 前端只提交家庭口令，由服务端验证后调用 OpenAI。API 按用量收费，ChatGPT 订阅不等于 API 额度；请在 OpenAI 控制台设置用量提醒并检查账单。家庭口令只是简单访问保护，不是账户系统，不适合公开共享的多人服务；泄露时请更换并重新部署。

开发静态界面使用 `npm run dev`；本地联调 serverless API 需要 Vercel CLI 的 `vercel dev` 和服务端环境变量。`npm run preview` 不运行 AI API。

验证：`npm run build`；后端边界检查：`node --test tests/chat.test.mjs`。自动检查使用模拟 AI 响应，不表示真实 OpenAI 调用已经成功；上线前需要配置真实 API 并在 iPhone/iPad 验证语音权限和声音播放。

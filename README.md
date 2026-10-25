# Judy & 脆宝的英语世界 🐾

适合儿童的英语启蒙网页，使用 React + Vite + TypeScript，无 AI、数据库或付费服务。

- 白猫老师脆宝、10 张动物卡片（系统自带动物表情图片）
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

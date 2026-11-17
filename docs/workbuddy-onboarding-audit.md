# WorkBuddy 新人安装复核

日期：2026-11-17。目标：不懂代码的新人，从仓库找到技能包，在 WorkBuddy 开始制作自己的作品集。

## 发现并修复

| 原问题 | 处理 |
| --- | --- |
| 仓库名 `healing-diorama` 看不出作品集用途 | 改为 `creative-island-portfolio`，中文名“创作岛互动作品集” |
| README 引用的 `little-wilds-workbuddy.zip` 未随仓库提供 | 将新技能包放入 `downloads/creative-island-portfolio-workbuddy.zip`，README 直达文件 |
| 技能说明写三个场景、旧默认场景 | 改为四场景，默认云朵花语 |
| 模板 README 让新人再次寻找不存在的 ZIP | 为复制出的项目单独提供 README，说明配置、预览与检查 |
| 示例模板还保留个人作品映射 | 生成通用作品卡；无图片时使用文字卡，无链接时不显示链接 |
| 新人不知道先给什么素材 | 技能改为分轮收集姓名、简介、作品、本人角色与贡献、图片和链接；允许从 1–2 件作品起步 |

## 已验证

1. WorkBuddy 官方文档确认“技能 → 添加技能 → 上传技能”可导入本地技能包：[技能说明](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Skills-Market)。README 还链接了官方 Mac/Windows 安装指南。
2. ZIP 校验通过，顶层目录为 `creative-island-portfolio/`，其中包含 `SKILL.md` 与 `assets/template/`。
3. 从 ZIP 解压并把模板复制到全新目录后，`npm ci`、12 项测试与 `npm run build` 通过。
4. 原生 Chrome 打开该独立模板：页面标题是“我的创作岛”，默认场景是“云朵花语”，分类卡显示“作品示例（请替换）”。模板源码中不再含 Jason 姓名与润葭作品链接。

## 尚未验证

这台设备在本轮检查时没有安装 WorkBuddy 客户端，因此没有实际点击“上传技能”完成导入。ZIP 结构、官方导入路径和模板运行均已验证，但不能把它们当成 WorkBuddy 客户端导入成功的证据。仓库已公开；无登录状态下载技能 ZIP 后，SHA-256 与本地文件一致。

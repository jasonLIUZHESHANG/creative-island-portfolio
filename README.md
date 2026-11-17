# 创作岛互动作品集

一个可以自己定制的 3D 个人作品集。访客进入“云朵花语”小岛，点击水獭或底部分类看作品；还可以切换海风小岛、风栖草原、雪线暖屋。它适合想展示设计、课程、活动、研究或个人项目的人。你可以让 WorkBuddy 一步一步带你制作，无需先会写代码。

> **先看清楚两个版本：**这个 GitHub 仓库是 Jason 的项目源码，包含他的公开作品资料。给自己制作作品集时，请下载下面的 **WorkBuddy 技能包**；技能包内是独立的示例模板，不会把 Jason 的作品当成你的作品。

## 用 WorkBuddy 从零制作

如果还没安装 WorkBuddy，先按官方的 [Mac 安装指南](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Installation-Mac-Guide)或 [Windows 安装指南](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Installation-Win-Guide)安装并登录。制作网站时还需要 Node.js 20.19 或更新版本；没有的话可以先让 WorkBuddy 检查环境并引导安装。

### 1. 下载技能包

打开 [creative-island-portfolio-workbuddy.zip](downloads/creative-island-portfolio-workbuddy.zip)，在 GitHub 文件页选择 **Download raw file**，保存 ZIP。不要下载整个仓库 ZIP 来代替技能包。

### 2. 在 WorkBuddy 导入

在 WorkBuddy 左侧打开 **专家·技能·连接器 → 技能 → 添加技能 → 上传技能**，选中刚下载的 ZIP。导入后到“已安装”确认 `creative-island-portfolio` 已启用。这是 [WorkBuddy 官方文档](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Skills-Market)给出的本地技能包上传路径。

### 3. 新建任务，复制这句话

> 使用 creative-island-portfolio 技能，帮我制作自己的互动作品集。先把模板复制到一个新项目目录，再一步一步问我展示姓名、作品分类、每件作品的本人角色和贡献、图片与链接。先让我在本地预览和修改，不要发布。

### 4. 跟着问题提供材料

先给出展示姓名、一句话介绍，以及 1–2 件真实作品即可；没有图片或链接可以稍后补。团队作品请说明你负责的部分。WorkBuddy 会整理分类、帮你选择角色外观，并把内容填进网站。示例文字会清楚标为“请替换”，不能直接当成你的成果发布。

### 5. 看预览，再决定是否公开

WorkBuddy 应给你本地预览地址。打开网页，检查作品标题、角色与贡献、图片、链接、四个场景和手机布局；有问题继续在同一个任务里让它修改。只有你明确要求发布，才开始 GitHub Pages 等上线步骤。

**当前验证范围：**技能 ZIP 的目录结构、示例模板的依赖安装、测试和构建会在本仓库验证；尚未在真实 WorkBuddy 客户端完成导入点击流程。若上传入口与文档不同，请按 WorkBuddy 当前界面寻找“技能 → 上传技能”。

## 自己运行这个源码项目

需要 Node.js 20.19 或更高版本。在项目目录运行：

```sh
npm ci
npm run dev -- --port 4174
```

浏览器打开 <http://127.0.0.1:4174/>。拖动旋转、滚轮缩放；点动物或底部分类打开作品；点地面移动人物，点海面产生水纹。音乐默认关闭，浏览进度只保存在你的浏览器。

定制内容在 `src/portfolio-config.js`。`profile` 管展示信息和默认场景（`3` 为云朵花语）；`portfolioSections` 管分类和作品。四个场景共享分类，动物数量随分类变化，建筑不随之增加。项目源代码的作品卡使用 `src/portfolio-content.js` 关联 Jason 的公开作品封面；**WorkBuddy 模板已换成独立的通用作品卡**。

运行检查：

```sh
npm test
npm run build
npm run preview -- --port 4175
```

`dist/` 是静态网站，可部署到静态托管。页面需要 HTTP 服务与支持 WebGL 的浏览器；不要直接双击 `index.html`。项目无需后端或付费 API。

## 许可与内容

角色与合成音乐代码改编自 [panggungunvibe/island-portfolio](https://github.com/panggungunvibe/island-portfolio)，保留 MIT `LICENSE`。代码许可不等于个人作品、姓名、照片或封面的转用授权。自行制作时只放你有权公开的素材。

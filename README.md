# 创作岛互动作品集

用一段对话，把你的真实经历做成可漫游的 3D 个人作品集。访客可以在云朵花语、海风小岛、风栖草原、雪线暖屋四个场景里探索作品。默认先进入云朵花语。

## 在 WorkBuddy 里开始

先安装并登录 WorkBuddy，然后新建任务，发送这一整句：

> 请读取并使用这个 GitHub 仓库根目录的 SKILL.md，按照它的流程，一步一步帮我制作个人作品集。请先问我的身份，不要让我下载 ZIP：https://github.com/jasonLIUZHESHANG/creative-island-portfolio

接下来按它的问题回答即可：先选“学生 / 已经工作 / 混合身份”，再逐个提供项目、作品或经历。每次只需说一个作品；没有图片和链接也可以先做。完成内容核对后，WorkBuddy 会把仓库自带的通用模板复制成你的项目，生成本地预览。你看完网页后继续提修改意见，满意了再决定是否发布。

**注意：**视频里的一句话安装演示发生在豆包。WorkBuddy 是否把 GitHub 地址自动注册为“已安装技能”，取决于客户端能力；上面的提示词要求它直接读取并执行仓库中的技能流程，无需手动下载 ZIP。如果客户端无法读取仓库地址，请告诉它具体报错。此仓库根目录已提供 `SKILL.md` 和 `assets/template/`，适合通过仓库地址读取。

## 自己运行源码

本仓库顶层是 Jason 的公开作品集源码；新人的通用模板位于 [`assets/template/`](assets/template/)，不含 Jason 的作品内容。运行顶层演示需 Node.js 20.19 或更新版本：

```sh
npm ci
npm run dev -- --port 4174
```

在浏览器打开 <http://127.0.0.1:4174/>。拖动旋转、滚轮缩放；点动物或底部分类打开作品。运行检查：

```sh
npm test
npm run build
```

要改自己的作品，请改复制出的项目中的 `src/portfolio-config.js`。`profile` 管姓名、介绍和默认场景；`portfolioSections` 管分类和作品。`dist/` 可部署到静态托管，但发布前请确认所有素材有权公开。

## 许可

角色与合成音乐代码改编自 [panggungunvibe/island-portfolio](https://github.com/panggungunvibe/island-portfolio)，保留 MIT [`LICENSE`](LICENSE)。代码许可不等于个人作品、姓名、照片或封面的转用授权。

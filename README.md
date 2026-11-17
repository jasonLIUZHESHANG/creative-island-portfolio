# 小小旷野 · 互动作品集

Three.js 实时作品集：风栖草原、雪线暖屋、海风小岛、云朵花语。动物是作品分类入口；建筑是固定景物。分类增加时四个场景自动增加动物。

## 最快开始

安装 Node.js 20.19 或更高版本，在项目目录运行：

```sh
npm ci
npm run dev -- --port 4174
```

打开 http://127.0.0.1:4174 。拖动旋转，滚轮缩放；点击地面行走，点击动物或底部分类看作品。海岛点击水面产生波纹。右上角有音乐、帮助和全景复位。音乐默认关闭，浏览进度仅保存在浏览器。

## 用 WorkBuddy 制作自己的版本

1. 在 WorkBuddy 的「专家·技能·连接器 → 技能 → 添加技能 → 上传技能」导入 `little-wilds-workbuddy.zip`。
2. 新建任务，告诉它：**“使用 little-wilds-portfolio，帮我做互动作品集。先收集作品、整理分类，再让我选择角色。先本地预览，不发布。”**
3. 提供你的真实材料，选择默认角色、文字定制或授权照片参考。
4. 看过本地预览后再决定是否发布。

上传入口参考 [WorkBuddy 官方技能说明](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Skills-Market)。技能包结构已检查，尚未在 WorkBuddy 客户端实际导入测试。

## 内容编辑

只需先修改 `src/portfolio-config.js`。profile 控制名称、介绍、外链和默认场景（0/1/2/3）；portfolioSections 控制分类和作品条目。所有场景共用这些内容。建议 3–8 类；数量更多时请检查移动端导航及标签。

`src/sunny-island.js` 是海岛和水波实现；`src/main.js` 包含草原、雪屋和共享交互；`src/original-models.js` 包含角色；`src/exploration-ui.js` 包含帮助、导航与进度。

## 检查与打包

```sh
npm test
npm run build
npm run preview -- --port 4175
```

`dist/` 可部署到静态托管（包括 GitHub Pages 子路径）。不要直接双击 index.html：ES module 需要 HTTP 服务。初次安装需联网获取 npm 依赖，网站本身不需要 API 密钥。

构建约 600 KB JavaScript（压缩传输约 165 KB），主要为 Three.js。低性能设备可能需要降低分辨率。支持减弱动态偏好。源码中的旧苔庭模块仅为历史实现，当前不加载旧模型/纹理。

## 许可与署名

角色和合成音乐代码改编自 [panggungunvibe/island-portfolio](https://github.com/panggungunvibe/island-portfolio)，保留其 MIT LICENSE。新增海岛及交互修改随项目采用 MIT。个人作品、姓名和照片不因代码许可而获得转用授权；分发包使用明确示例内容。本地 Jason 版本保留其公开作品资料。

云朵花语（场景索引 3）：水獭绕岛游泳，选中后暂停；小船轻轻起伏，秋千前后摆动。尊重系统减弱动态偏好。

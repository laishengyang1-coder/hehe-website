# 和和新材官网 - 协作开发指南

本指南面向需要修改官网的同事。**改完推送后，网站会自动部署上线**（GitHub Actions → CloudBase），不需要手动操作服务器。

## 一、环境准备（第一次）

1. 注册 GitHub 账号（如果没有）：https://github.com/signup
2. 告诉仓库管理员（海盐）你的 GitHub 用户名，让他把你加为协作者
3. 安装 Git：https://git-scm.com/downloads（一路默认即可）
4. 建议安装 VS Code（代码编辑器）：https://code.visualstudio.com
   - 装好后在扩展商店搜索安装 **Live Server** 插件（本地预览用）

## 二、克隆代码到本地

打开终端（Mac 用 Terminal / Windows 用 PowerShell），执行：

```bash
git clone https://github.com/laishengyang1-coder/hehe-website.git
cd hehe-website
```

> 首次操作会弹出 GitHub 登录窗口，用你的账号登录即可。

## 三、本地预览

方法一（推荐）：VS Code 打开项目文件夹 → 右键 `index.html` → 选择「Open with Live Server」→ 浏览器自动打开 http://127.0.0.1:5500

方法二（命令行）：

```bash
cd hehe-website
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080
```

## 四、修改网站

- **首页** → `index.html`
- **关于和和** → `about.html`
- **产品应用** → `product.html`
- **品牌世界** → `brand.html`
- **创新中心** → `innovation.html`
- **新闻资讯** → `news.html`
- **联系我们** → `contact.html`
- **样式** → `css/style.css`（全站配色、字号、动效）
- **交互** → `js/main.js`（导航、轮播、表单、搜索等）
- **图片视频** → `assets/` 目录（注意：新增图片请先压缩，尽量用 WebP 格式）

## 五、提交并发布（核心流程）

每次修改完，执行这三步：

```bash
git add -A                # 1. 暂存所有改动
git commit -m "描述你改了什么"   # 2. 提交（描述写清楚，如：更新新闻标题）
git push                  # 3. 推送到 GitHub
```

推送后约 2-3 分钟，网站自动更新：**https://new.heheppf.com**

## 六、常用技巧

- **先拉再改**：每次动手前先 `git pull`，拿到最新代码，避免冲突
- **查看改了啥**：`git status` 显示当前改动文件
- **撤销改动**：`git checkout -- 文件名`（只撤销还没提交的）
- **看历史**：`git log --oneline`

## 七、常见问题

| 问题 | 解决 |
|------|------|
| `push` 被拒 / 提示权限不足 | 确认已接受协作者邀请；检查账号是否登录正确 |
| 提交冲突（别人也改了同一处） | `git pull` 后手动合并冲突，或把冲突文件发给管理员 |
| 图片显示不出来 | 检查 `assets/` 里的文件名是否和 HTML 里引用的完全一致（区分大小写） |
| 改了没生效 | 等 2-3 分钟部署完成；强制刷新浏览器（Cmd+Shift+R / Ctrl+F5） |

## 八、注意

- **不要上传密钥**：任何密码、Token 都不要写进代码
- **不要改 `.github/` 目录**：那是自动部署配置，改了可能导致部署失败
- 不确定的改动，改完先在本地预览确认没问题再 push

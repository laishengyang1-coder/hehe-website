# 和和新材官网（静态版）

安徽和和新材料有限公司官方网站复刻版，纯静态站点。

## 技术栈

- 纯 HTML5 + CSS3 + Vanilla JS（无框架、无构建步骤）
- 字体：Noto Serif SC + Inter（jsdelivr CDN 引入）
- 图片/视频：当前热链自原站 www.heheppf.com（建议后续本地化）

## 页面清单

| 页面 | 文件 | 说明 |
|------|------|------|
| 首页 | `index.html` | 视频 Banner + 产品展示 + 品牌轮播 + 新闻 |
| 关于和和 | `about.html` | 公司简介 + 全球布局 + 发展历程 + 企业文化 |
| 创新中心 | `innovation.html` | 偃月实验室 + 研发实力 + 前沿模式 |
| 产品应用 | `product.html` | 5 大产品（URL 参数切换） |
| 品牌世界 | `brand.html` | 和膜 / 和膜和彩 / KAKA 品牌 |
| 新闻资讯 | `news.html` | 新闻列表 |
| 联系我们 | `contact.html` | 留言表单 + 联系方式 |

## 本地预览

```bash
python3 -m http.server 8080
# 打开 http://localhost:8080
```

## 部署（CloudBase / Cloudflare Pages 等静态托管）

项目为纯静态站点，无需安装依赖、无需构建，直接部署根目录即可：

- 部署根目录：项目根目录（含 index.html）
- 无需 npm install / npm run build
- 所有内部资源均为相对路径（`css/`、`js/`），适合部署在域名根路径 `/`

## 注意事项

1. **图片资源依赖原站**：所有 `<img>` 和视频 `<video>` 当前直接引用 `www.heheppf.com` 上的资源，原站停止服务后图片将失效。上线前建议将所有图片/视频下载到本项目 `assets/` 目录并改为本地引用。
2. **联系表单**：`contact.html` 的表单当前为纯前端展示，提交需要后端接口（可用 CloudBase 云函数或 Cloudflare Workers 免费实现）。

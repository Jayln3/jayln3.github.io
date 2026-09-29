# Jayln3 的双语博客

中文首页：<https://jayln3.com/>

English: <https://jayln3.com/en/>

GitHub：<https://github.com/jayln3>

Hexo 8 + Butterfly，单一源码仓库，分别构建中文和英文后合并发布。source 是源码分支，master 是生成文件分支。

## 本地使用

使用 Node 24（见 .nvmrc）：

    npm ci
    npm test
    npm run build
    npm run server

预览地址为 http://127.0.0.1:4000。源码修改后重新运行 npm run build。构建会自动检查页面链接、语言切换、分类、图片、搜索、订阅和 SEO；失败时保留之前的 public/。

浏览器测试：

    npx playwright install --with-deps chromium
    npm run test:browser

## 内容目录

| 内容 | 路径 |
| --- | --- |
| 中文文章 | source/_posts/ |
| 英文文章 | content/en/_posts/ |
| 品牌、域名、分类 | config/site.json |
| 双语标签与稳定 URL | config/tags.json |
| 原图版本与校验值 | config/images.json、config/brand-images.json |
| 旧链接跳转 | config/redirects.json |
| 页面样式 | static/site.css |

文章一律填写 lang、translation_key、abbrlink 和一个主分类。对应译文使用相同的 translation_key 和 abbrlink，保持各自标题、描述、标签和正文的语言。现有文章的 abbrlink 不要修改。

新文章可以先发布一种语言；还没有译文时，语言按钮会标注另一种语言的首页，不会伪造对应译文。published: false 和未来日期的文章不发布。英文稿标注为译编版；原文中的历史价格、Star 数和效果数据不代表实时核验结果。

主分类固定为 AI 与自动化、跨境增长、技术基础设施、站点动态。产品、平台、技术名称使用标签。标签显示名称可以翻译，URL 使用稳定的英文键。

## 配图

原图库仓库是 <https://github.com/jayln3/blog-images>，本地与本仓库同级：

    blog/
    blog_en/       # 旧英文站，迁移入口
    blog-images/   # 原图

新原图可先放在 ../blog-images/inbox/。该收件目录不提交 Git；整理后将图片移到图库的正式目录，补充图库的说明/清单并提交到 GitHub。随后在本仓库更新 config/images.json 的固定 commit、文件路径和 SHA256，添加中英文 alt，再给文章填写对应的 translation_key 与 cover。

构建优先读取同级原图库中校验一致的文件；缺失时从固定 GitHub commit 下载并缓存，校验失败会中止。发布时生成 640px / 1280px WebP，和网站一起提供服务。原始 PNG 保持不变；访客不依赖第三方图床 CDN 的实时响应。

已有概念插画由 image-gen 生成，不能当作产品截图、测速图或真实案例证据。图库保存生成提示词和原图。实操截图单独标注 kind 和 caption，按原始宽高比展示；新增截图需检查是否包含密钥、密码或私人联系方式。正文配图也登记在 config/images.json，以固定版本构建。Dynadot 文章使用的三张截图与来源清单保存在图库 posts/dynadot-domain-email/。

## 发布

推送 source 后，GitHub Actions 执行干净安装、内容检查、双语构建与桌面/手机浏览器测试。全部通过后更新 master，显式请求 GitHub Pages 构建并等待结果。部署保留 master 的提交历史。

不要执行单独的 hexo deploy，也不要用单语言 hexo generate 的输出覆盖发布分支。

## 域名

博客使用 jayln3.com，英文版位于 /en/；www.jayln3.com 由 GitHub Pages 跳转至主域名。config/site.json 的 activeBlogUrl 是发布地址，customDomainEnabled 控制 CNAME 生成。blog.jayln3.com、projects.jayln3.com 仍是规划。

## 联系方式与知识库入口

config/site.json 统一维护联系方式。作者卡片保留蓝色 GitHub 按钮，下面显示邮箱、Facebook、X、LinkedIn。X 和 LinkedIn 的地址留空时显示不可点击的待开通图标；注册后填写 social.x / social.linkedin 并重新发布即可。

contactEmail 为 contact@jayln3.com。emailEnabled 控制邮箱链接是否启用；当前 Dynadot 免费邮箱已创建并设为主邮箱，网站已启用邮箱链接。邮箱内的 QQ 转发已通过收件方验证，并保留 Dynadot 收件箱副本，详见 docs/domains.md。

knowledgeBase.contactUrl 是用户提供的飞书加好友地址，knowledgeBase 下分别维护中英文引导文案和二维码图片路径。每篇文章正文之后显示一次“付费获取知识库”入口；首页、分类页和关于页不插入此入口。这里只引导咨询内容与购买方式，不包含付款流程。

用户提供的两张飞书二维码原图保存在 static/images/feishu-contact-zh-CN-v2.png 和 feishu-contact-en-v2.png，构建时原样复制到 assets/images/。中文、英文文章分别使用对应图片，点击图片可查看原图，旁边保留添加飞书按钮。更新时替换对应二维码、递增文件版本号以避免旧缓存，并检查扫码目标。

详细步骤见 [域名与品牌配置](docs/domains.md)。FlowLn 商业项目规划使用 flowln.dev，与个人博客的域名配置分开管理。

## 实现与资料

- [Hexo API](https://hexo.io/api/)：两个独立语言构建上下文，避免分类、搜索与相关文章混排。
- [Hexo 子目录与分类配置](https://hexo.io/docs/configuration.html)：英文根目录 /en/，分类使用稳定 slug。
- [GitHub Pages 发布来源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)：GITHUB_TOKEN 推送不会自动触发 Pages，需要显式请求构建。
- [Pages 构建 API](https://docs.github.com/en/rest/pages/pages#request-a-github-pages-build)。

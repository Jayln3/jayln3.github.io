# Jayln3 域名与品牌

| 用途 | 规划 |
| --- | --- |
| 个人品牌 / Author | Jayln3 |
| 主站 | jayln3.com |
| 博客 | blog.jayln3.com |
| 项目 | projects.jayln3.com |
| 邮箱 | hi@jayln3.com |
| 备用邮箱 | hello@jayln3.com |
| GitHub | github.com/jayln3 |
| FlowLn 商业项目 | flowln.dev |

当前线上地址是 https://jayln3.github.io。以上域名和邮箱在启用前只作为规划信息展示；购买域名不会自动创建网站或收件邮箱。

## 启用博客子域名

1. 购买并控制 jayln3.com，按照 GitHub Settings → Pages 的提示添加域名验证 TXT，验证归属。
2. 为 blog 创建 CNAME，目标为 jayln3.github.io，不带协议或路径。jayln3.com 主站与 projects 子域名根据各自托管位置另行配置，不要把整个个人域名指向 FlowLn 项目。
3. 检查 DNS 已生效，再将 config/site.json 的 activeBlogUrl 改为 https://blog.jayln3.com，将 customDomainEnabled 设为 true。同步 _config.yml 的 url，保持手动阅读配置时一致。
4. 运行 npm test、npm run build、npm run test:browser，推送 source。构建将生成 CNAME，并更新 canonical、hreflang、站点地图和订阅地址。
5. 在仓库 Settings → Pages 确认自定义域名为 blog.jayln3.com，等待证书签发并启用 Enforce HTTPS。
6. 检查首页、中英文文章、图片、订阅，以及原 GitHub Pages 地址的跳转。

如需退回默认域名，恢复 activeBlogUrl、_config.yml 的 URL，关闭 customDomainEnabled，重新构建发布，并在 Pages 设置中移除自定义域名。

## 启用邮箱

选定邮件服务后，按照服务商要求设置 MX、SPF、DKIM、DMARC，创建或验证 hi / hello 两个邮箱或别名，完成实际收发测试后再将 emailEnabled 改为 true。不能仅添加网站 CNAME 就视为邮箱可用。

## 评论

保留现有 Twikoo 地址和中文文章路径，避免丢失历史评论的关联。英文文章以 /en/posts/&lt;id&gt;/ 使用独立评论线程。更换域名时仍保持路径不变，并检查 Twikoo 服务端允许的新来源域名。

本次没有发布测试评论，也没有改动评论数据库。

参考：[GitHub 自定义域名文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)、[域名归属验证](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)。

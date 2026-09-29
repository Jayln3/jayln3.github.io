# Jayln3 域名与品牌

| 用途 | 规划 |
| --- | --- |
| 个人品牌 / Author | Jayln3 |
| 主站 / 当前博客 | jayln3.com |
| www | www.jayln3.com → jayln3.com |
| 博客子域名（规划） | blog.jayln3.com |
| 项目 | projects.jayln3.com |
| 邮箱 | hi@jayln3.com |
| 备用邮箱 | hello@jayln3.com |
| GitHub | github.com/jayln3 |
| FlowLn 商业项目 | flowln.dev |

发布地址配置为 https://jayln3.com，英文版位于 /en/。原 https://jayln3.github.io 由 GitHub Pages 跳转至新域名。blog、projects 子域名及邮箱继续保留为规划；购买域名不会自动创建收件邮箱。

## GitHub Pages 主域名配置

1. config/site.json 的 activeBlogUrl 和 _config.yml 的 url 设为 https://jayln3.com，customDomainEnabled 设为 true。
2. 运行 npm test、npm run build、npm run test:browser，推送 source。构建生成内容为 jayln3.com 的 CNAME，并同步 canonical、hreflang、站点地图和订阅地址；发布工作流将生成站点推送至 master。
3. 确认 GitHub Pages 已识别 jayln3.com 后，在 Dynadot DNS 添加下表记录。保留现有 MX、TXT 等与网站无关的记录。
4. 等待 DNS 生效和 GitHub 证书签发，在仓库 Settings → Pages 启用 Enforce HTTPS。
5. 检查首页、中英文文章、图片、订阅，以及 www 和原 GitHub Pages 地址的跳转。

| 主机 | 类型 | 值 |
| --- | --- | --- |
| @ | A | 185.199.108.153 |
| @ | A | 185.199.109.153 |
| @ | A | 185.199.110.153 |
| @ | A | 185.199.111.153 |
| @ | AAAA | 2606:50c0:8000::153 |
| @ | AAAA | 2606:50c0:8001::153 |
| @ | AAAA | 2606:50c0:8002::153 |
| @ | AAAA | 2606:50c0:8003::153 |
| www | CNAME | jayln3.github.io |

域名归属验证可在个人 GitHub Settings → Pages 添加 jayln3.com，并按 GitHub 生成的专属 TXT 值完成验证；不要使用占位验证值。项目和商业域名另行管理。

如需退回默认域名，恢复 activeBlogUrl、_config.yml 的 URL，关闭 customDomainEnabled，重新构建发布，并在 Pages 设置中移除自定义域名。

## 启用邮箱

选定邮件服务后，按照服务商要求设置 MX、SPF、DKIM、DMARC，创建或验证 hi / hello 两个邮箱或别名，完成实际收发测试后再将 emailEnabled 改为 true。不能仅添加网站 CNAME 就视为邮箱可用。

## 评论

保留现有 Twikoo 地址和中文文章路径，避免丢失历史评论的关联。英文文章以 /en/posts/&lt;id&gt;/ 使用独立评论线程。更换域名时仍保持路径不变，并检查 Twikoo 服务端允许的新来源域名。

本次没有发布测试评论，也没有改动评论数据库。

参考：[GitHub 自定义域名文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)、[域名归属验证](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)。

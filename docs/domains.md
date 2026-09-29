# Jayln3 域名与品牌

| 用途 | 规划 |
| --- | --- |
| 个人品牌 / Author | Jayln3 |
| 主站 / 当前博客 | jayln3.com |
| www | www.jayln3.com → jayln3.com |
| 博客子域名（规划） | blog.jayln3.com |
| 项目 | projects.jayln3.com |
| 联系邮箱 | contact@jayln3.com |
| GitHub | github.com/jayln3 |
| FlowLn 商业项目 | flowln.dev |

发布地址配置为 https://jayln3.com，英文版位于 /en/。原 https://jayln3.github.io 由 GitHub Pages 跳转至新域名。blog、projects 子域名继续保留为规划；联系邮箱已单独开通。

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

当前指定使用 Dynadot 免费邮箱，联系地址为 contact@jayln3.com，并转发到用户指定的 QQ 邮箱。转发目标仅保存于账户配置和本地操作记录，不发布到博客源码或网页。

2026-09-29：通过 Dynadot 生产 API 创建了免费邮箱（1 GB），并添加下表邮件 DNS 记录，保留了全部 A、AAAA 和 www CNAME 网站记录。收件服务器对 contact@jayln3.com 返回 SMTP RCPT 250，emailEnabled 已设为 true。随后在网页邮箱中将 contact@jayln3.com 设为免费方案主邮箱，启用 QQ 转发并保留收件箱投递。收件方已点击确认链接，用户提供的管理页截图显示 Verified，转发与收件箱投递开关均开启。尚未另行发送测试邮件或验证实际转发投递。

| 主机 | 类型 | 值 |
| --- | --- | --- |
| @ | MX | 0 webhost.dynadot.com |
| @ | TXT | v=spf1 mx include:webhost-mail-out.dynadot.com include:spf.webhost.dynadot.com ~all |
| default._domainkey | CNAME | clients._domainkey.webhost.dynadot.com |
| _dmarc | TXT | v=DMARC1; p=none; |

API 支持创建邮箱服务，但没有提供邮箱内部的 Delivery Options 接口。QQ 转发已通过已登录的网页邮箱保存，并完成收件方验证。维护时在 Dynadot → My Emails → jayln3.com → Sign in 进入，或在已登录状态下访问 https://webmail.dynadot.com/mailbox/settings.html 。邮箱密码和 API 密钥均不保存在此仓库。

独立免费邮箱和域名邮件转发是两种不同方式。独立邮箱应在 My Emails 中打开邮箱，在 General Settings → Delivery Options 配置 Forwarding，并在目标邮箱完成 Dynadot 要求的验证。直接在域名 Email Settings 配置 Forwarding Email 会断开独立 Email Hosting，不要将两种方式混用。

参考：[Dynadot 免费邮箱](https://www.dynadot.com/email)、[邮箱内转发设置](https://www.dynadot.com/help/question/set-up-email-forwarding)、[域名转发设置与验证](https://www.dynadot.com/help/question/email-forwarding)。

## 评论

保留现有 Twikoo 地址和中文文章路径，避免丢失历史评论的关联。英文文章以 /en/posts/&lt;id&gt;/ 使用独立评论线程。更换域名时仍保持路径不变，并检查 Twikoo 服务端允许的新来源域名。

本次没有发布测试评论，也没有改动评论数据库。

参考：[GitHub 自定义域名文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)、[域名归属验证](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)。

---
title: 我为什么选 Dynadot：免费 1 个企业邮箱（1GB），以及建站踩过的坑
date: 2026-09-29T12:25:00.000Z
updated: 2026-09-29T12:25:00.000Z
abbrlink: d9a729
lang: zh-CN
translation_key: dynadot-domain-email
author: Jayln3
categories:
  - 技术基础设施
tags:
  - Dynadot
  - Cloudflare
  - 域名
  - 企业邮箱
  - GitHub Pages
  - 自动化
cover: /assets/images/dynadot-domain-email-v1-1280.webp
top_img: false
cover_alt: Dynadot 购物车中的五个附加组件入口，部分功能标有升级选项。
description: 记录 jayln3.com 在 Dynadot 注册域名、开通免费企业邮箱和接入 GitHub Pages 的经历。免费邮箱只有 1 个地址、1GB 空间；也聊聊 Cloudflare 银联支付失败、邮箱转发、HTTPS 和两家的 API 支持。
---

给自己的博客配上 `jayln3.com`，我原本以为就是买个域名、填几条解析记录。真正做下来，支付、邮箱开通、邮件转发、HTTPS，每一步都有需要弄清楚的地方。

这次我最终选择了 **Dynadot 注册域名，并开通它附带的免费企业邮箱**。对我来说，吸引力很具体：支持支付宝和人民币付款，可以先用自己的域名建立正式的联系地址，而且后面还能接 API 做自动化。

先把最重要的限制放在前面：**免费邮箱只有 1 个地址额度，空间只有 1GB，官方当前还限制每天最多发送 25 封邮件。** 适合个人网站起步，不能按多人团队邮箱或大容量邮件服务来期待。[免费邮箱官方套餐](https://www.dynadot.com/email)

> **推广说明：** 本文包含我的 Dynadot 推荐链接和推荐码。通过它注册并完成符合条件的首单后，我和新用户可能获得平台账户奖励。下文也会写清免费限制和遇到的问题。资料核对日期为 **2026 年 9 月 29 日**，价格及活动规则以当时的结账页和官方说明为准。

<!-- more -->

## 我最看重的赠送服务：一个自己的域名邮箱

博客现在使用的联系地址是 **`contact@jayln3.com`**。和普通个人邮箱相比，它能直接对应到我的网站，也更适合放在个人介绍、项目页面和对外联系方式里。

这里说的“企业邮箱”，指的是使用自己域名的邮箱。即使是个人博客，也可以用；但免费版的容量和账号数量，需要先看清楚。

| 项目 | Dynadot 免费邮箱的当前限制 |
| --- | --- |
| 免费额度 | 这个域名的免费方案只有 **1 个邮箱地址** |
| 邮箱空间 | **1GB，也就是大家常说的 1G** |
| 每日发信数量 | 最多 **25 封** |
| 我的选择 | 把唯一的免费地址用在 `contact@jayln3.com` |

上面的数量和容量来自 [Dynadot 邮箱产品页](https://www.dynadot.com/email)。**不要把一个免费地址理解为可以同时免费开通 `contact@`、`sales@`、`support@` 多个独立邮箱。** 需要更多地址或容量时，要另行评估升级套餐。

对联系量不大的个人网站，我觉得这个起步方案有价值：先把品牌地址用起来，再按真实需求决定要不要升级。经常收大附件、需要长期保存大量邮件，或者多人共同办公，就要认真考虑 1GB 是否够用。域名本身仍然需要注册和续费，“免费邮箱”不等于“域名也免费”。

<figure class="article-screenshot">
  <img src="/assets/images/dynadot-mailbox-setup-v1-1280.webp" alt="Dynadot 免费邮箱开通阶段，contact@jayln3.com 的界面提示检查 DNS 并指定主邮箱。" loading="lazy" decoding="async">
  <figcaption>我的邮箱开通阶段截图：顶部仍有 DNS 和主邮箱提示，后续配置完成后这些提示已消失。</figcaption>
</figure>

## 邮箱配置里，最容易走错的三个地方

### 开通邮箱后，还要指定免费方案的主邮箱

我进入邮箱后台时，页面已经显示 `contact@jayln3.com`，但顶部仍提示设置 **primary email address**。

这一步容易被忽略：看到地址出现在列表里，并不代表免费版的设置已经全部完成。我们后来把它明确设成主邮箱，相关提示才消失。免费版只有一个地址额度，开通后最好确认这个额度对应的就是准备长期使用的联系地址。

### “邮箱里的转发”和“域名邮件转发”是两个入口

我希望域名邮箱保留收件箱，同时把邮件转到自己常用的 QQ 邮箱。正确入口是在已经开通的邮箱内部：

**My Emails → Sign in → 选择邮箱 → General Settings → Delivery Options → Forwarding。**

保存转发地址后，还要发送验证邮件，再去接收方邮箱点击确认链接。我们这次已完成确认，后台显示 **Verified**，同时保留了 **Deliver Email to Inbox**，让域名邮箱继续保存收件箱副本。免费方案的邮箱内转发也只支持 **1 个目标地址**。[邮箱内转发的官方步骤](https://www.dynadot.com/help/question/set-up-email-forwarding)

这里有个很实在的坑：域名管理页面也有 **Email Settings → Forwarding Email**，但那是另一套域名转发功能。官方明确提示，在那里改成转发，会断开域名与已有 Dynadot Email Hosting 的连接。已经在用独立邮箱，就应当从邮箱内部设置转发。[域名转发的官方提醒](https://www.dynadot.com/help/question/email-forwarding)

截至这次记录，我们确认了设置保存和转发地址验证，**尚未另行完成真实邮件的收发、转发全流程测试**。这里分享的是配置经历，不把它当作长期投递稳定性的测评。

### 配邮箱时，要保留网站原来的 DNS 记录

我的网站当时已经指向 GitHub Pages。添加邮件需要的 MX、SPF、DKIM、DMARC 时，我们保留了网站原有的 A、AAAA 和 `www` CNAME，避免配置邮箱后网站反而打不开。

以后如果把 DNS 切到 Cloudflare，也要一并迁移网站和邮件所需的记录。Dynadot 的[名称服务器设置说明](https://www.dynadot.com/help/question/set-name-servers)专门提醒：继续使用原来的邮箱或建站服务，应提前在新 DNS 服务中补齐必要记录。

## 支付这关：Cloudflare 写着支持银联，但我的卡没付成功

这次选注册商时，我也考虑过 Cloudflare。它的[官方支付文档](https://developers.cloudflare.com/billing/understand/billing-policy/)确实列出了 **UnionPay（银联）**，所以不能说它“不支持银联”。

**但我实际尝试时，自己的银联卡没能完成支付。** 这是我这张卡、这次操作的结果。我没有查明具体失败原因，也不能据此推断所有银联卡都不行。对读者更有用的提醒是：页面列出了卡组织，最终仍要看自己的卡能否完成付款。

Dynadot 让我更愿意继续用下去的一点，是[官方明确支持支付宝和银联，并支持人民币付款](https://www.dynadot.com/payment-options)。对平时主要用支付宝的人，这条购买路径更顺手。

| 我关心的付款问题 | Dynadot | Cloudflare |
| --- | --- | --- |
| 支付宝 | 官方明确支持人民币支付 | 本次查阅的官方支付列表未列出 |
| 银联 | 官方明确支持 | 官方列出支持，但我的卡这次没有付成功 |
| 怎么选 | 看自己的支付工具和实际结账结果 | 已有可正常付款的卡或 PayPal，仍然值得比较 |

这张表依据上面的两家官方付款说明和我的支付经历整理，不是对所有卡片、地区和账户的兼容性测试。

## 购物车里的“五个免费附加组件”，具体送到哪一步？

文章开头那张图，是我浏览 `jayln3mall.com` 组合购买时保存的购物车截图，和本次已配置的主域名 `jayln3.com` 不是同一个名字。它展示的是当时的附加组件入口，不能用来证明每项高级服务都已免费开通。

我把这些服务按实际限制重新看了一遍：

| 组件 | 对个人站长的用途与限制 |
| --- | --- |
| 域名隐私 | 符合条件的后缀可免费隐藏部分公开 WHOIS 联系资料，具体受后缀规则影响。 |
| 网站 | 免费方案可做 **单页网站**，有 500MB 存储，并保留 Dynadot 页脚标识；博客栏目等功能需要升级。 |
| 邮箱 | 本文重点介绍的 **1 个地址、1GB 空间**，适合轻量联系。 |
| Logo 工具 | 免费版可创建一个 Logo 并导出 PNG；SVG 等能力属于 Pro。 |
| 注册局安全锁 | **Registry Lock 属于付费升级服务**，不能因为截图里出现了“免费”字样，就理解为免费开通了注册局级保护。 |

套餐依据：[域名隐私与安全](https://www.dynadot.com/domain/security)、[建站工具](https://www.dynadot.com/website-builder)、[邮箱](https://www.dynadot.com/email)、[Logo 工具](https://www.dynadot.com/logo-builder)。

对我来说，真正用上的赠送服务首先是邮箱；网站则继续使用自己已有的博客系统。这些工具可以按需求组合，没必要因为有赠送就全部启用。

## 买域名时，组合价和续费价要一起看

我当时为 `jayln3.com` 比价时，记下了这几组首年报价：

| 当时比较的方案 | 2026 年 9 月 29 日记录的首年价格 |
| --- | ---: |
| 单独注册 `jayln3.com` | ¥73.80 |
| `jayln3.com` + `jayln3.online` | 约 ¥67 |
| `jayln3.com` + `jayln3.my` | ¥60.30 |

这是我当时的比价记录，**不是今天或以后仍可买到的价格保证**。在那组报价下，`.com + .my` 的总价比单买 `.com` 低了 ¥13.50，确实值得多看一眼购物车。

不过，便宜的是当时的首年组合。Dynadot 官方说明，组合里的域名后续可以**分别续费、转移或到期放弃**。如果第二个后缀不准备长期使用，就要检查它的自动续费设置，并在付款前看清各自续费价格。[组合优惠与续费说明](https://www.dynadot.com/domain/sales)

Cloudflare Registrar 的一个优势则是注册、转入和续费不额外加价，按其官方说明的成本定价方式提供服务。[Cloudflare 域名定价说明](https://www.cloudflare.com/domains/)

我会比较“首年实付 + 后续准备保留的域名续费”，不会只凭一次促销就认定哪家永远便宜。

## API 接入：Dynadot 能做，Cloudflare 也能做

如果平时会用脚本或自动化工具管理网站，这一点值得提一下。

Dynadot 的[官方 API](https://www.dynadot.com/domain/api)支持域名查询、注册、续费、DNS 调整等管理操作，页面也提供 RESTful API 和 MCP 入口。这次搭建 `jayln3.com` 时，我们实际通过 API 配置了网站 DNS、创建免费邮箱服务，并补上邮件相关记录。

但“支持 API”不代表每一个后台设置都有对应接口。**这次邮箱内部的转发和主邮箱选择，仍通过网页后台完成。** 自动化能省一些步骤，具体覆盖到哪一步要看接口文档。

Cloudflare 也支持 API：[DNS API](https://developers.cloudflare.com/api/resources/dns/subresources/records/methods/create/)可以管理解析记录；当前的 [Registrar API 文档](https://developers.cloudflare.com/registrar/registrar-api/)还提供域名搜索、实时可用性与价格检查、注册流程，并标注为 **Beta**。因此，API 不是 Dynadot 独有的优势，两家都能纳入自动化工作流，具体权限和可用功能分别核对。

## 我的网站现在怎么搭？以及 HTTPS 那个坑

本文发布时，`jayln3.com` 的实际组合是：

| 环节 | 当前使用的服务 |
| --- | --- |
| 域名注册与续费 | Dynadot |
| DNS 解析 | Dynadot DNS |
| 博客程序与部署 | Hexo + GitHub Pages |
| HTTPS 证书 | GitHub Pages 管理签发 |
| 域名邮箱 | Dynadot 免费邮箱，`contact@jayln3.com` |

刚接上自定义域名时，我也遇到了 HTTPS 证书异常。后来在 GitHub 仓库的 **Settings → Pages** 重新保存 `jayln3.com`，等待域名检查和证书签发完成，再启用 **Enforce HTTPS**，才把这一步处理好。

<figure class="article-screenshot">
  <img src="/assets/images/dynadot-github-pages-v1-1280.webp" alt="GitHub Pages 的 jayln3.com 自定义域名设置，DNS 检查成功且已勾选 Enforce HTTPS。" loading="lazy" decoding="async">
  <figcaption>当时保存的 GitHub Pages 设置截图：DNS check successful，Enforce HTTPS 已启用。顶部站点提示尚显示 HTTP，后续已另行核验 HTTPS 和跳转正常。</figcaption>
</figure>

这里的体会是：**域名解析正常、证书签发完成、强制 HTTPS 开启，是需要分别确认的状态。** 本站后来已验证 HTTPS 访问正常，HTTP 和 `www` 地址也会跳转到主站。GitHub 官方同样说明，自定义域名检查成功后还需要申请和配置证书，可能要等待一段时间。[GitHub Pages HTTPS 说明](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)

如果以后需要 Cloudflare 的服务，也可以把组合改成“**Dynadot 注册域名 + Cloudflare 管理 DNS + 自己选择的网站托管**”。Dynadot 允许改用第三方名称服务器；而域名注册在 Cloudflare Registrar 时，官方要求继续使用 Cloudflare 的名称服务器。这是选择注册商时可以提前考虑的差别。[Dynadot 名称服务器设置](https://www.dynadot.com/help/question/set-name-servers)、[Cloudflare Registrar 的限制](https://developers.cloudflare.com/registrar/get-started/register-domain/)

## 如果你也想试试 Dynadot

如果你正在做个人博客、作品集，或者一个联系量不大的项目网站，想要顺手的支付宝付款路径，再配一个自己的域名邮箱，我觉得 Dynadot 值得放进候选名单。免费邮箱的前提也请记住：**只有 1 个地址、1GB 空间，每天最多发送 25 封。**

我的推荐入口：

**<a href="https://www.dynadot.com/?s7r6S8u7S9X817e8s" rel="sponsored nofollow noopener" target="_blank">通过我的推荐链接访问 Dynadot，查看当前域名价格</a>**

推荐码：**`7r6S8u7S9X817e8s`**。手动注册时，可以在相应的推荐码栏填写。

当前 [Refer-a-Friend 官方规则](https://www.dynadot.com/community/refer-a-friend)要求：新用户通过推荐链接或推荐码注册，首笔订单达到 **$9.99**；推荐人过去 365 天内需有至少 **$1.99** 的消费。满足条件时，双方可各得 **$5 账户余额**，入账最多可能需要 15 天。

**这是符合条件后的账户奖励，不是首单结账直接减 $5。** 人民币低价组合也不能默认满足美元首单门槛，以平台判定为准。先买自己需要的域名，算清长期成本；推荐奖励合适就用，不必为了凑奖励多买用不上的服务。

对我而言，这次选择 Dynadot 最实际的收获，是让 `jayln3.com` 和 `contact@jayln3.com` 一起建立起来。把支付、邮箱额度、DNS 和证书这些细节弄清楚，后面就能更专心地写文章、做项目。

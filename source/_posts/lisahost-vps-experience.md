---
title: LisaHost 使用体验与 VPS 配置实录
date: 2026-10-01T16:00:00.000Z
updated: 2026-10-01T17:06:28.000Z
abbrlink: a6e102
lang: zh-CN
translation_key: lisahost-vps-experience
author: Jayln3
categories:
  - 技术基础设施
tags:
  - Lisa 主机
  - VPS
  - 网络
  - 自动化
cover: /assets/images/lisahost-vps-experience-v1-1280.webp
cover_in_body: false
top_img: false
cover_alt: LisaHost 结算页面，优惠码生效后，图中年付套餐从 720 元降至 648 元。
description: 我用过的 LisaHost 美国 9929 套餐、3x-ui 管理订阅的思路，以及 VLESS 与 HY2 从连接异常到测速正常的排查记录。附真实截图、九折优惠码和飞书交流入口。
---

我用过一台 LisaHost（丽萨主机）的美国 9929 VPS：**1 核、1GB 内存，上下行带宽标称都是 60Mbps**。最近配置另一台新 VPS 时，我又把面板、订阅、手机和电脑客户端从头走了一遍，也遇到了两个很容易误判的问题：能测出延迟，却打不开网页；同一台电脑上，VLESS 和 HY2 的测速差很多。

这篇把我的实际配置过程整理出来：先说用过的 LisaHost 套餐，再讲怎么把一台 VPS 配到能用、遇到异常时怎么排查。想选机器的朋友可以参考前半部分，已经买好但没配顺的朋友，可以直接看后面的实操记录。

> 文中包含我的 LisaHost 推广链接，通过链接购买，我可能获得佣金。LisaHost 的旧实例截图与后文 AKE 新 VPS 的测速分别标注，方便辨认。

<!-- more -->

## 我用过的 LisaHost 套餐

这台旧实例的管理页里，配置和费用列得很清楚：

| 项目 | 我当时使用的实例 |
| --- | --- |
| 线路 | 美国洛杉矶 9929 |
| 配置 | 1 核 CPU、1GB 内存、20GB 磁盘 |
| 系统 | Ubuntu 22.04 |
| 标称带宽 | 上行 60Mbps、下行 60Mbps |
| 流量额度 | 后台显示 2000GB |
| 当时后台续费价 | 118.80 元／季，折合 39.60 元／月 |

<figure class="article-screenshot">
  <img src="/assets/images/lisahost-instance-v1-1280.webp" alt="我的 LisaHost 美国 9929 旧实例管理页，显示 1 核、1GB 内存、60Mbps 上下行带宽和 118.80 元季度续费价。" loading="lazy" decoding="async">
  <figcaption>我用过的 LisaHost 实例，现已决定不续订。这里保留历史管理截图，配置与价格只对应这台旧实例。</figcaption>
</figure>

我看重的是这样一台小机器可以由自己管理：安装需要的服务，保存自己的配置，按用途做调整。个人网站、轻量 Docker 服务、定时任务、Bot，或者调用外部 API 的自动化工具，都可以从一个小项目开始。

如果你也准备选 VPS，LisaHost 值得放进比较名单。它的[官方目录](https://lisahost.com/cart.php?gid=23)提供美国、香港、日本、新加坡等多个地区的方案，也有三网优化和 9929 线路产品。选择时看具体套餐的地区、带宽和流量，再用自己的运营商测试，比只看“几核几 G”更有帮助。

## 一台 VPS 我是怎样配到手机和电脑都能测试的

这次新机器在我的记录里叫 **AKE**。我希望电脑用 **v2rayN**，iPhone 用 **Shadowrocket**，并且后续改账号时能统一管理。所以采用了下面这套结构：

**VPS → 3x-ui 管理面板 → VLESS + REALITY 与 HY2 → 统一订阅 → 导入客户端。**

具体分成三个环节。

**先把管理层建好。** 确认服务器和面板可以访问，保留配置备份，再通过 3x-ui 的 API 管理账号、连接参数和订阅。这样增加账号时有统一入口，后面排查也能对照服务端配置。

**再准备两种连接方式。** 我配置了 VLESS + REALITY，同时保留 HY2，也就是 Hysteria 2。两种方式分别验证是否可用，再整理进同一份订阅，方便在客户端切换观察。几个 VLESS 账号虽然名字不同，实际共用同一台 VPS 和同一个入口。

**最后分别验收电脑和手机。** 导入订阅后，先选一个节点打开网页、访问常用服务，再测上传和下载。电脑正常不代表手机端也一定兼容；两端都要看实际使用结果。

这里不展开安装命令和完整参数。面板怎么部署、API 怎么用、订阅怎么组织，可以通过文末飞书入口继续交流。

## 第一个问题 有延迟但网页打不开

当时的现象很明确：**HY2 能用，其他几个 VLESS 账号能显示延迟，却无法正常上网**。手机用的是较早版本的 Shadowrocket。

我们先核对账号、订阅和服务端是否一致，再检查客户端与服务端内核的握手兼容性。对照测试发现，不同版本的客户端握手表现确实不同；使用兼容的服务端版本后，几个账号的真实 HTTPS 访问测试都通过了。

这次也检查了 REALITY 的目标站点握手。面板里显示的十几毫秒，是 **VPS 到目标站点的测试延迟**，不能直接当作手机或电脑到 VPS 的延迟，更不能用它判断最终速度。

我的体会是：遇到“有延迟、不能用”，先区分账号配置和版本兼容，再用真实访问验证。单看列表里一个绿色数字，还不足以说明整条连接已经正常。

## 第二个问题 为什么五个账号测速都很慢

电脑端随后出现了另一个让我困惑的现象：在同一台电脑、同一个网络上，v2rayN 里的几个 AKE VLESS 账号大约只有 **1MB/s**，HY2 却能到 **8MB/s 左右**。我一度怀疑是不是被设置了限速。

核对结果是，账号没有配置速率上限，VLESS 已启用 Vision，Mux 关闭。接着发现，**v2rayN 的综合测速并发数是 5，五个 VLESS 账号同时开始测速，HY2 则稍后单独测试**。

这五个名字并不代表五条独立线路。它们同时测速时会争用带宽，因此批量结果不能直接代表其中一个账号独占连接时的速度。对应版本的 [v2rayN 测速实现](https://github.com/2dust/v2rayN/blob/af0eb9ed14638fa877d11c235e491442ec7ba215/v2rayN/ServiceLib/Services/SpeedtestService.cs)也区分了顺序测速与并发综合测速。

后续复测，我确认电脑端速度已经正常。这个并发设置是批量结果里的重要干扰因素；至于此前某次网页测速上传偏低，仍不能只凭这一点断定原因。

## 复测结果与我现在的测速习惯

下面是我保留的 **AKE 新 VPS** 测速记录，均来自同一台电脑、同一个网络，客户端为 v2rayN。

| 测试 | 下载 | 上传 |
| --- | ---: | ---: |
| VLESS + REALITY 后续复测 | 69.98 Mbps | 52.35 Mbps |
| HY2 此前测试 | 61.87 Mbps | 71.02 Mbps |

<figure class="article-screenshot">
  <img src="/assets/images/ake-vless-retest-v1-1280.webp" alt="AKE 的 VLESS + REALITY 复测，下载 69.98 Mbps、上传 52.35 Mbps。" loading="lazy" decoding="async">
  <figcaption>AKE 新 VPS 的 VLESS 复测，使用洛杉矶 Nitel 测速服务器；我确认这次速度已经正常。</figcaption>
</figure>

<figure class="article-screenshot">
  <img src="/assets/images/ake-hy2-test-v1-1280.webp" alt="AKE 的 HY2 测速，下载 61.87 Mbps、上传 71.02 Mbps。" loading="lazy" decoding="async">
  <figcaption>AKE 新 VPS 的 HY2 记录，使用洛杉矶 Hotwire Fision 测速服务器。</figcaption>
</figure>

两次使用了不同的测速服务器，时间也不同，所以这里只记录我实际看到的结果，不据此给协议排名，也不把它当作前面 LisaHost 套餐的性能数据。

现在比较速度时，我会固定电脑、网络和测速服务器，每次只选一个节点；同时留意单位，v2rayN 列表的 **MB/s** 与网页测速的 **Mbps** 不同。完成测速后，再回到常用网页和服务看使用体验。

## LisaHost 优惠码与购买入口

如果你正在选一台 VPS，可以从我的入口查看 LisaHost 的当前套餐：

**<a href="https://lisahost.com/aff.php?aff=8140" rel="sponsored nofollow noopener" target="_blank">查看 LisaHost 当前线路与套餐</a>**

优惠码：**`TS-CBP205DQJE`**。

我保留的结算图中，一档年付进阶套餐从 **720 元减为 648 元**，优惠 **72 元**，页面显示“10% 续约 折扣”。它和前面那台季度基础版是两个不同方案。

<figure class="article-screenshot">
  <img src="/assets/images/lisahost-vps-experience-v1-1280.webp" alt="LisaHost 优惠码 TS-CBP205DQJE 生效，年付套餐由 720 元减为 648 元，显示续约九折。" loading="lazy" decoding="async">
  <figcaption>我的九折结算截图。当前适用套餐、价格和续费折扣，以结算页显示为准。</figcaption>
</figure>

使用时先选地区、套餐和付款周期，输入优惠码并验证，确认金额发生变化后再付款。优惠码可参考这份 [GitHub 整理资料](https://github.com/lisahost-coupon-codes)。官网有 [48 小时退款说明](https://lisahost.com/)，但[部分试用款不退款](https://lisahost.com/cart.php?gid=32)，购买时按所选产品的规则确认。

如果机器已经买好，想继续了解 **3x-ui、订阅组织、Shadowrocket 与 v2rayN 的具体配置**，可以通过下方飞书入口加我，备注 **“VPS 配置”**。带上客户端版本、运营商和遇到的现象，我们就能从具体问题开始交流。

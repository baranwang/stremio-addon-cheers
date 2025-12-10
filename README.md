<p align="center">
<img src="https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji/png/512/emoji_u1f37b.png" width="128" />
<h1 align="center">Stremio Addon Cheers 🍻</h1>
</p>

<p align="center">
在支持 Stremio 协议的播放器上观看小破站视频
</p>

## ✨ 功能特性

- 📺 支持多种内容类型：番剧、电影、纪录片、国创、电视剧、综艺
- 🔐 支持 B 站账号登录，观看大会员内容
- 🎬 支持多种清晰度选择
- 🌐 内置视频代理，解决跨域播放问题
- 🎨 现代化配置界面，扫码登录

## 📋 Q&A

### 为什么不提供公共服务？

本项目需要自行部署，暂不提供公共服务，主要原因如下：

1. **流量成本** - 视频代理消耗大量带宽，难以承担公共服务的流量费用
2. **风控规避** - 避免因请求集中导致 B 站对服务器 IP 进行风控
3. **地区限制** - 不同 IP 地区对应的可播放内容不同，自建服务可确保最佳体验

## 🚀 部署方式

### Docker（推荐）

```bash
docker run -d \
  --name stremio-addon-cheers \
  -p 3000:3000 \
  -v cheers-data:/app/data \
  ghcr.io/baranwang/stremio-addon-cheers:latest
```

使用 Docker Compose:

```yaml
services:
  stremio-addon-cheers:
    image: ghcr.io/baranwang/stremio-addon-cheers:main
    platform: linux/amd64
    container_name: stremio-addon-cheers
    ports:
      - "3000:3000"
    volumes:
      - cheers-data:/app/data
    restart: unless-stopped

volumes:
  cheers-data:
```

### 本地开发

确保已安装 [Node.js](https://nodejs.org/) (>= 24) 和 [pnpm](https://pnpm.io/)。

```bash
# 克隆仓库
git clone https://github.com/baranwang/stremio-addon-cheers.git
cd stremio-addon-cheers

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

服务将在 `http://localhost:3000` 启动。

### 生产构建

```bash
# 构建
pnpm build

# 启动
pnpm start
```

## 📖 使用方法

1. 部署服务后，访问 `http://your-host:3000` 进入配置页面
2. （可选）扫码登录 B 站账号以观看大会员内容
3. 复制 Manifest URL
4. 在 Stremio 或其他支持 Stremio 协议的播放器中添加插件：
   - 打开 Stremio → 设置 → 插件 → 添加插件
   - 粘贴 Manifest URL 并安装

## 🛠️ 技术栈

- [Next.js](https://nextjs.org/) - React 全栈框架
- [LMDB](https://github.com/kriszyp/lmdb-js) - 高性能键值数据库
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
- [Stremio Addon SDK](https://github.com/Stremio/stremio-addon-sdk) - Stremio 插件协议

## 📄 License

MIT

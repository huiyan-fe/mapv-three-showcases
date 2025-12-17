# JSAPI Three Showcases

基于 JSAPI Three 的地图可视化展示案例集合，展示了各种 3D 可视化效果、地理信息展示和特效动画等。

线上地址：https://lbsyun.baidu.com/jsapithree/showcase/

## 项目结构

```
src/
├── components/    # 通用组件（如ShowcaseCard、CodeViewer等）
├── pages/         # 各类Showcase页面，每个子目录为一个独立案例
├── data/          # 展示项配置数据（如showcases.js）
├── utils/         # 工具函数（如withSourceCode、initEngine等）
└── App.jsx        # 应用主入口
```

## 环境变量配置

在开始开发之前，需要配置环境变量：

1. **复制环境变量模板文件**：
   ```bash
   cp .env.example .env
   ```

2. **填写环境变量**：
   打开 `.env` 文件，根据你的开发环境填写相应的变量值，例如：
   - `VITE_BAIDU_MAP_AK`: 百度地图 API Key，需要到百度地图开放平台申请，https://lbsyun.baidu.com/apiconsole/key
   - `VITE_CESIUM_ACCESS_TOKEN`: Cesium Access Token，需要到Cesium官网申请，https://ion.cesium.com/tokens
   - `VITE_MAPBOX_ACCESS_TOKEN`: Mapbox Access Token，需要到Mapbox官网申请，https://console.mapbox.com/account/access-tokens/
   - `VITE_PUBLIC_PATH`: 公共资源路径
   - `VITE_BOS_ASSETS_BASE_URL`: BOS 资源基础 URL
   - 其他项目所需的环境变量

> **注意**：`.env` 文件包含敏感信息，请勿提交到版本控制系统。确保 `.env` 已在 `.gitignore` 中。`.env.example` 文件为环境变量模板，请勿修改。

## 开发和构建

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 技术栈

- React
- JSAPI Three
- Vite
- Ant Design
- React Router

## 如何添加新的 Showcase

本项目采用了自动路由匹配机制和模块化的目录结构。添加新的 showcase 需要：

1. 在 `src/pages/` 下创建新的 showcase 目录（全小写）
2. 创建入口文件 `index.jsx` 和主组件文件
3. 在 `src/data/showcases.js` 中注册新的展示项

详细的开发指南和规范请参考 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 贡献指南

如果您想为项目贡献新的 showcase 或改进现有功能，请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详细的开发规范和贡献流程。

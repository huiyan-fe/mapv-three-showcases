# 亦庄城市三维渲染（Yizhuang）

本示例演示基于 3D Tiles 的城市精细化三维渲染：加载亦庄相关的道路/城市模型 tileset，并在其上叠加道路、水系、绿地、路口等要素渲染，以及多个 GLB 地标模型与文字标注，形成整体城市风格化表达。

## 效果与功能点

- **3D Tiles 场景底座**：通过 `Default3DTiles` 加载城市数据（URL 由环境变量提供）。
- **风格化天空与时间**：使用 `DefaultSky` 并设置颜色/强度；通过 `engine.clock._setTimeLegacy(...)` 调整时间效果。
- **道路/水系/绿地要素**：通过 `part/events.js` 中的函数批量添加不同类型要素，并支持统一样式配置。
- **地标模型**：加载多个 GLB 模型并放置到指定坐标位置。
- **文本与路口**：添加路口/道路文本等辅助信息层。

## 使用说明

- **tileset 地址**：通过环境变量 `VITE_YIZHUANG_HDROAD_TILESET` 指定 3D Tiles URL。

## 目录结构与关键文件

- `index.jsx`：页面入口
- `Yizhuang.jsx`：核心实现（Engine/天空/tileset 初始化与各类要素挂载）
- `part/events.js`：要素添加逻辑（道路/水系/绿地/路口/文字/模型等）
- `data/geojson/`：部分 GeoJSON 数据
- `style/`：材质/纹理相关工具（按需使用）

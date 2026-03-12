# 城市倾斜摄影（City Photogrammetry）

本示例演示如何在 `mapv-three` 场景中加载并渲染一份城市倾斜摄影 3D Tiles 数据（`Default3DTiles`），并与底图（影像/地形）叠加显示。

## 效果与功能点

- **3D Tiles 加载与渲染**：通过 `Default3DTiles` 加载倾斜摄影 tileset（URL 由环境变量提供）。
- **影像与地形叠加**：使用 `MapView` 叠加 Bing 影像与 Cesium 地形（可按需替换/关闭）。
- **基础渲染参数**：设置 `errorTarget` 控制细节等级，并可选 `forceUnlit` 以获得更稳定的明暗表现。

## 使用说明

- **tileset 地址**：通过环境变量 `VITE_YONGCHUAN_OBLIQUE_TILESET` 指定 tileset 的 URL。
- **Cesium Token**：示例中读取 `VITE_CESIUM_ACCESS_TOKEN`（用于地形等能力，按需配置）。

## 目录结构与关键文件

- `index.jsx`：页面入口
- `CityPhotogrammetry.jsx`：核心实现（Engine/MapView 初始化，`Default3DTiles` 加载与参数配置）

## 常见问题

- **模型不显示**：优先检查 `VITE_YONGCHUAN_OBLIQUE_TILESET` 是否可访问、是否为有效的 3D Tiles tileset。
- **地形/影像不显示**：检查网络环境，或改用其它 imagery/terrain provider。
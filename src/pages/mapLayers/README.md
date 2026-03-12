# 图层控制（MapLayers）

本示例演示如何在同一个 `MapView` 中管理多种底图/栅格图层（imagery providers）：新增/删除图层、调整透明度、显隐切换、以及按 provider 特性更新配置（例如 Bing 风格、交通图自动刷新等）。

## 效果与功能点

- **多图层叠加**：初始叠加 Bing 影像与百度交通路况图层。
- **图层新增/删除**：运行时添加 Stadia / 百度矢量等图层，并支持删除（至少保留 1 个）。
- **显隐与透明度**：每个图层独立开关可见性、调整 opacity。
- **调试网格**：可选开启 provider 的调试标签（如支持）。
- **图层特定配置**：
  - Bing：支持切换 `style` 并触发 `refresh()`
  - 百度交通：支持 `autoRefresh`

## 交互说明

- **添加图层**：通过面板按钮新增指定类型图层。
- **删除图层**：点击删除按钮并确认；当仅剩一个图层时禁用删除。
- **调整配置**：修改透明度/风格/自动刷新等会实时同步到对应 provider。

## 目录结构与关键文件

- `index.jsx`：页面入口
- `MapLayers.jsx`：核心实现（provider 创建、`rasterSurface` 图层增删、UI 面板）
- `MapLayers.less`：样式
- `FloatingPanel.jsx`：本示例使用的浮动面板组件

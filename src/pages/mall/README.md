# 商圈/购物中心数据可视化（Mall）

本示例演示一个模块化的“购物中心数据可视化”页面：`MallMap` 负责初始化地图与通用边界线，其它业务能力（客流热力、客流来源、等时圈、周边设施等）以模块形式挂载，并通过顶部导航切换当前模块。

## 效果与功能点

- **模块化架构**：不同业务以 `modules/*` 的组件形式实现，通过 `activeModule` 切换挂载。
- **通用底图与样式**：初始化 `Engine + MapView(BaiduVectorTileProvider)` 并使用 `setMapStyle(..., 'gray')` 设置主题。
- **通用边界线**：读取 `data/border.geojson` 并绘制虚线边界（`Polyline`），作为全模块共享背景要素。
- **模块切换 UI**：顶部按钮切换“客流热力 / 客流来源 / 等时到达圈 / 周边设施”等模块。

## 交互说明

- **切换模块**：点击顶部导航按钮切换，右侧面板区域会渲染对应模块组件。

## 目录结构与关键文件

- `index.jsx`：页面入口
- `MallMap.jsx`：核心实现（地图初始化、边界线、模块切换与面板容器）
- `MallMap.less` / `MallPanel.less`：样式
- `modules/`：业务模块（如 `HeatmapModule` / `SourceModule` / `IsochroneModule` / `FacilityModule` 等）
- `panels/`：部分模块的面板组件
- `components/`：面板/表格/浮层等通用组件
- `data/`：示例数据（边界、热力 CSV 等）

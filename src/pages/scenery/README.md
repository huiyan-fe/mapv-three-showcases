# 景点分布检索（Scenery）

本示例演示行政区划 + POI 检索的组合用法：通过 `DistrictLayer` 渲染选中区域边界，再用 `LocalSearch` 在区域内搜索景点 POI，并将结果渲染到左侧列表中，支持点击列表项飞行定位并弹出 POI 信息窗。

## 效果与功能点

- **行政区边界渲染**：使用 `mapvthree.services.DistrictLayer` 渲染当前选中区域。
- **POI 本地检索**：使用 `mapvthree.services.LocalSearch` 搜索景点（按类型关键字切换）。
- **自动视野适配**：两类服务均启用 `autoViewport`，结果渲染后自动调整视野。
- **列表联动地图**：点击列表项触发 `flyTo` 并设置对应的 POI 弹窗。

## 交互说明

- **切换区域**：选择不同省市（如北京市/上海市等）会更新区划边界并重新检索。
- **切换景点类型**：按钮筛选“历史古迹/自然风光/公园绿地/水域景观”等类别。
- **定位 POI**：点击左侧列表条目飞行定位并打开信息窗。

## 目录结构与关键文件

- `index.jsx`：页面入口
- `Scenery.jsx`：核心实现（`DistrictLayer`/`LocalSearch` 初始化、检索逻辑与列表联动）

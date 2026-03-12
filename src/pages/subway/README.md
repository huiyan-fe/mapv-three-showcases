# 地铁线路地图（Subway）

本示例演示基于 GeoJSON 的城市地铁线路可视化：渲染线路折线（支持按属性设置分段颜色）、渲染站点图标（普通站/换乘站差异化），并用效果点/效果模型点对换乘站做强调展示；同时在页面叠加图例与换乘信息面板。

## 效果与功能点

- **线路渲染**：使用 `Polyline` 绘制地铁线，并通过 `defineAttribute('color', 'color')` 使用 GeoJSON 属性中的颜色值。
- **站点渲染**：使用 `Label(type="icon")` 渲染站点图标，按换乘线路数映射不同 icon 与尺寸。
- **换乘站强调**：
  - `EffectPoint`：气泡/扩散效果点（按换乘数映射颜色与大小）
  - `EffectModelPoint`：模型特效点（开启旋转动画），并支持点击飞行定位
- **数据筛选**：对站点数据源 `setFilter(...)`，仅选取换乘站参与特效渲染。
- **UI 叠加**：页面叠加标题、`SubwayLegend` 图例与 `SubwayTransferTable` 换乘表。

## 交互说明

- **点击特效点**：点击换乘站的 `EffectModelPoint` 会飞行定位到该站点。

## 目录结构与关键文件

- `index.jsx`：页面入口
- `SubwayMap.jsx`：核心实现（线路/站点/特效覆盖物与属性映射）
- `SubwayLegend.jsx` / `SubwayLegend.less`：图例面板
- `SubwayTransferTable.jsx` / `SubwayTransferTable.less`：换乘表面板
- `data/shanghai_subway_line3.geojson`：线路数据
- `data/shanghai_subway_station3.geojson`：站点数据
- `assets/icons/`：站点图标资源
- `SubwayMap.less`：样式

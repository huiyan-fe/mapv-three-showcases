# 公园分布（SceneryPoints）

本示例演示基于 GeoJSON 数据的点位/面要素可视化：以“北京市公园”为例，提供 **点位标签模式** 与 **面域填充模式** 两种展示方式，并支持从面板切换模式、以及点击列表项联动地图飞行定位。

## 效果与功能点

- **双模式展示**：
  - 标签模式：`Label(type="icontext")` 渲染公园图标与名称（按面积分级设置 icon/iconSize/text）。
  - 面域模式：`Polygon` 渲染公园范围填充，并叠加 `Polyline` 作为边界线。
- **主题样式**：使用 `setMapStyle(..., 'gray')` 设置灰色底图风格。
- **数据加载**：通过 `GeoJSONDataSource.fromURL(...)` 读取本目录 `data/*.geojson`。
- **列表联动**：面板中点击表格行触发 `flyTo`，快速定位到公园中心点。

## 交互说明

- **切换显示模式**：在面板中选择“标签/面域”，对应图层会互斥显隐。
- **定位到公园**：点击列表项会飞行定位到该公园位置。

## 目录结构与关键文件

- `index.jsx`：页面入口
- `SceneryMap.jsx`：核心实现（引擎初始化、标签/面域图层、属性分级与联动）
- `SceneryPanel.jsx`：面板（模式切换、列表展示与行点击回调）
- `data/bj_park2.geojson`：公园点位数据
- `data/bj_park_area3.geojson`：公园范围面数据
- `assets/icons/`：分级图标资源
- `SceneryMap.less` / `SceneryPanel.less`：样式

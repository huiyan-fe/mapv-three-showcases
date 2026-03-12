# 海量点渲染（MassivePoints）

本示例演示在地图场景中渲染 **157 万级别**点数据的方式：将点集拆分为多层并用 `SimplePoint` 叠加渲染，配合加色混合（Additive Blending）营造高密度分布的发光效果。

## 效果与功能点

- **海量点加载**：从 `result.txt` 拉取原始数据并解析为点坐标集合。
- **多层叠加**：将点集分为 3 层（不同颜色/透明度），分别绑定到 3 个 `SimplePoint`。
- **加色混合**：对三层点材质设置 `THREE.AdditiveBlending`，提高密集区域亮度。
- **性能取舍**：示例中禁用射线拾取（`raycast = () => {}`），避免海量点拾取开销。

## 数据与渲染逻辑（要点）

- **坐标转换**：示例将解析得到的平面坐标通过 `engine.map.unprojectArrayCoordinate(...)` 转换为地图坐标后，封装为 `DataItem` 加入数据源。

## 目录结构与关键文件

- `index.jsx`：页面入口
- `MassivePoints.jsx`：核心实现（数据解析、三层点渲染与材质设置）
- `result.txt`：原始点数据（文本格式）
- `MassivePoints.less`：样式

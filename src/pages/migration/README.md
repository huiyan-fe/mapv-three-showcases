# 人口迁徙可视化（Migration）

本示例演示“北京与各省份之间”的迁徙关系可视化：用曲线连线 + 飞线动画表达方向，用气泡点表达指数强度，并提供“迁出 / 迁入”切换与右侧榜单面板。

## 效果与功能点

- **迁出/迁入切换**：在 `moveout.json` 与 `movein.json` 两组数据间切换，并同步更新飞线方向与配色。
- **曲线连线**：使用 `Polyline(isCurve: true)` 绘制关系线。
- **飞线动画**：使用开启动画的 `Polyline` 作为飞线（拖尾、速度等参数可调）。
- **气泡点**：使用 `EffectPoint` 在各省中心点处渲染气泡大小/颜色（按指数映射）。
- **文本标注**：使用 `Label(type="text")` 显示省份名称。
- **北京落点强调**：使用 `EffectModelPoint` 在北京中心点做强调展示。

## 交互说明

- **迁出 / 迁入**：点击右侧 Tab 切换数据与渲染结果；榜单会回到顶部。

## 数据与渲染逻辑（要点）

- **数据来源**：
  - `data/moveout.json`：迁出数据
  - `data/movein.json`：迁入数据
- **中心点获取**：通过 `cityCenter.js` 的 `getCenterByCityName(...)` 将省份名称映射为中心坐标。
- **属性映射**：通过 `GeoJSONDataSource.defineAttribute(...)` 映射文本、气泡颜色与大小等属性。

## 目录结构与关键文件

- `index.jsx`：页面入口
- `Migration.jsx`：核心实现（覆盖物创建、数据切换、属性映射与右侧面板）
- `data/moveout.json` / `data/movein.json`：示例数据
- `cityCenter.js`：城市/省份中心点查询
- `Migration.less`：样式

# 风场粒子可视化（Wind）

本示例演示基于风场栅格数据的粒子流场渲染：读取本目录 `assets/wind.json`，通过 `MapvThreeWind` 将风向/风速场转为粒子动画，并挂载到 `mapv-three` 引擎中渲染。

## 效果与功能点

- **风场渲染**：`MapvThreeWind(winddata, options)` 将风场数据渲染为动态粒子轨迹。
- **可调参数**：通过 `windOptions` 配置色带、粒子寿命、路径数量、速度缩放、透明度、帧率等。
- **底图叠加**：使用 `MapView + BingImageryTileProvider` 作为背景影像（可按需替换）。

## 目录结构与关键文件

- `index.jsx`：页面入口
- `Wind.jsx`：核心实现（引擎初始化、`MapvThreeWind` 创建与挂载）
- `Wind.js`：`MapvThreeWind` 实现
- `assets/wind.json`：风场数据

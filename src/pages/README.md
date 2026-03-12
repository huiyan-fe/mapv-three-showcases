# Pages（示例目录规范）

`src/pages/` 下的每一个子目录都代表一个 **独立的 showcase 示例**。

## 约定与规范

- **示例独立**：每个示例的实现代码、样式、数据与静态资源应尽量 **全部放在同一个目录内**（例如 `src/pages/<showcase>/`）。
- **目录内自洽**：示例应能在不依赖其它示例目录代码/资源的前提下运行（公共工具除外，例如 `src/utils/`）。
- **入口一致**：建议每个示例目录提供统一入口 `index.jsx`，用于导出该示例的主组件。
- **文档齐全**：每个示例目录都应包含 `README.md`，说明该示例的功能点、交互方式、数据/资源来源与关键文件。

## 扩展示例（新增 showcase）

新增示例时请遵循以上约定，推荐最小目录结构如下：

```text
src/pages/<showcase>/
  index.jsx
  <Showcase>.jsx
  <Showcase>.less
  README.md
  data/        # 可选：示例数据（geojson/json/csv 等）
  assets/      # 可选：图片/模型/图标等资源
```

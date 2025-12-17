# JSAPI Three Showcases

基于 JSAPI Three 的地图可视化展示案例集合，展示了各种 3D 可视化效果、地理信息展示和特效动画等。

线上地址：https://lbsyun.baidu.com/jsapithree/showcase/

## 项目结构

```
src/
├── components/    # 通用组件（如ShowcaseCard、CodeViewer等）
├── pages/         # 各类Showcase页面，每个子目录为一个独立案例
├── data/          # 展示项配置数据（如showcases.js）
├── utils/         # 工具函数（如withSourceCode、initEngine等）
└── App.jsx        # 应用主入口
```

## 如何添加新的 Showcase

本项目采用了自动路由匹配机制和模块化的目录结构，添加新的 showcase 需要以下步骤：

### 1. 创建展示组件目录结构

每个showcase建议有自己独立的目录，包含所有相关文件（assets、README.md为可选）：

```
src/pages/
└── myshowcase/           # 新showcase目录 (全小写)
    ├── index.jsx         # 入口文件（必须）
    ├── MyShowcase.jsx    # 主组件实现（必须）
    ├── MyShowcase.less   # 组件样式（可选）
    ├── README.md         # 文档说明（可选）
    └── assets/           # 相关资源目录（可选）
        ├── data.json     # 可能的数据文件
        └── image.png     # 图片、模型等静态资源
```

**！！注意：静态资源建议放到各自showcase目录下的assets文件夹，避免全部堆在public下，便于维护。！！**

### 2. 创建入口文件

入口文件非常简单，只需导入并导出主组件：

```jsx
// src/pages/myshowcase/index.jsx
import MyShowcase from './MyShowcase';
export default MyShowcase;
```

### 3. 创建主组件文件

在showcase目录下创建主组件文件：

```jsx
// src/pages/myshowcase/MyShowcase.jsx
import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {withSourceCode} from '../../utils/withSourceCode';
import './MyShowcase.less'; // 对应的样式文件（可选）

function MyShowcase() {
  const containerRef = useRef(null);
  
  useEffect(() => {
    // JSAPI Three 初始化和场景设置
    if (!containerRef.current) return;
    
    const engine = new mapvthree.Engine(containerRef.current);
    
    // 添加您的 3D 内容
    // ...
    
    // 清理函数
    return () => {
      // 资源释放
    };
  }, []);

  return (
    <div className="showcase" ref={containerRef}>
      {/* 在这里添加其他 UI 元素 */}
    </div>
  );
}

// 使用 withSourceCode 高阶组件包装，提供源码查看和返回按钮功能
export default withSourceCode(MyShowcase);
```

### 4. 创建样式文件（可选）

```less
// src/pages/myshowcase/MyShowcase.less
.showcase {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}
```

### 5. 创建 README 文档（可选）

为你的showcase创建说明文档，进行一些简要的说明。

### 6. 在数据文件中添加展示项

打开 `src/data/showcases.js` 文件，添加新的展示项配置：

```js
export const showcases = [
  // 已有的展示项...
  {
    title: '我的新展示', // 展示标题
    image: 'https://picsum.photos/seed/mynew/300/200', // 展示缩略图
    path: '/myshowcase', // 路径必须与目录名完全匹配（小写）
    category: '特效动画' // 分类，可以使用已有分类或创建新分类
  }
];
```

### 命名规则和重要说明

1. **目录结构与命名**：
   - 目录名使用小写，如：`myshowcase`
   - 组件使用PascalCase(大驼峰)命名：`MyShowcase.jsx`
   - 数据文件中的path对应目录名：`/myshowcase`
   - **重要**：路由、目录名和源码链接会自动保持一致

2. **自动路由生成**：
   - 系统会自动扫描 `pages` 目录下的每个子目录中的 `index.jsx` 文件
   - 根据目录名自动生成路由，无需手动修改 `App.jsx`

3. **自动源码链接**：
   - `withSourceCode` 高阶组件会自动从当前URL路径提取showcase名称
   - 源码查看按钮将链接到对应的GitHub仓库目录

4. **资源管理**：
   - 所有相关资源（图片、数据、模型等）建议放在showcase目录下的assets文件夹中
   - 资源清理很重要，确保在 `useEffect` 的返回函数中释放所有资源

## 环境变量配置

在开始开发之前，需要配置环境变量：

1. **复制环境变量模板文件**：
   ```bash
   cp .env.example .env
   ```

2. **填写环境变量**：
   打开 `.env` 文件，根据你的开发环境填写相应的变量值，例如：
   - `VITE_BAIDU_MAP_AK`: 百度地图 API Key
   - `VITE_CESIUM_ACCESS_TOKEN`: Cesium Access Token
   - `VITE_MAPBOX_ACCESS_TOKEN`: Mapbox Access Token
   - `VITE_PUBLIC_PATH`: 公共资源路径
   - `VITE_BOS_ASSETS_BASE_URL`: BOS 资源基础 URL
   - 其他项目所需的环境变量

> **注意**：`.env` 文件包含敏感信息，请勿提交到版本控制系统。确保 `.env` 已在 `.gitignore` 中。`.env.example` 文件为环境变量模板，请勿修改。

## 开发和构建

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 技术栈

- React
- JSAPI Three
- Vite
- Ant Design
- React Router

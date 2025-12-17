# 贡献指南

感谢您对 MapV Three Showcases 项目的关注！我们欢迎所有形式的贡献。

## 如何贡献

### 报告问题

如果您发现了 bug 或有功能建议，请通过以下方式提交：

1. 在 GitHub 上创建 [Issue](https://github.com/huiyan-fe/mapv-three-showcases/issues)
2. 详细描述问题或建议
3. 如果可能，请提供复现步骤或示例代码

### 提交代码

#### 1. Fork 项目

首先 Fork 本项目到您的 GitHub 账户。

#### 2. 克隆仓库

```bash
git clone https://github.com/huiyan-fe/mapv-three-showcases.git
cd mapv-three-showcases
```

#### 3. 创建分支

为您的功能或修复创建一个新分支：

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

#### 4. 环境配置

在开始开发之前，请配置环境变量：

```bash
cp .env.example .env
```

然后根据您的开发环境填写相应的变量值。

#### 5. 安装依赖

```bash
npm install
```

#### 6. 开发

- 运行开发服务器：`npm run dev`
- 确保代码符合项目的代码规范
- 添加必要的测试和文档

#### 7. 提交代码

提交时请遵循以下规范：

- 使用清晰的提交信息
- 每个提交应该只包含一个逻辑变更
- 提交信息格式：`<type>: <description>`

  类型包括：
  - `feat`: 新功能
  - `fix`: 修复 bug
  - `docs`: 文档更新
  - `style`: 代码格式调整（不影响功能）
  - `refactor`: 代码重构
  - `test`: 测试相关
  - `chore`: 构建过程或辅助工具的变动

示例：
```bash
git commit -m "feat: 添加新的热力图展示案例"
git commit -m "fix: 修复地图容器定位问题"
```

#### 8. 推送并创建 Pull Request

```bash
git push origin feature/your-feature-name
```

然后在 GitHub 上创建 Pull Request，并：

- 详细描述您的更改
- 关联相关的 Issue（如果有）
- 确保所有 CI 检查通过

## 代码规范

### JavaScript/React

- 使用 ESLint 进行代码检查
- 遵循 React Hooks 最佳实践
- 组件使用函数式组件和 Hooks
- 使用有意义的变量和函数名

### 样式

- 使用 Less 编写样式
- 遵循项目的样式规范
- 保持样式代码的可维护性

### Showcase 开发规范

本项目采用了自动路由匹配机制和模块化的目录结构，添加新的 showcase 需要以下步骤：

#### 1. 创建展示组件目录结构

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

**重要提示**：静态资源建议放到各自showcase目录下的assets文件夹，避免全部堆在public下，便于维护。

#### 2. 创建入口文件

入口文件非常简单，只需导入并导出主组件：

```jsx
// src/pages/myshowcase/index.jsx
import MyShowcase from './MyShowcase';
export default MyShowcase;
```

#### 3. 创建主组件文件

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

#### 4. 创建样式文件（可选）

```less
// src/pages/myshowcase/MyShowcase.less
.showcase {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}
```

#### 5. 创建 README 文档（可选）

为你的showcase创建说明文档，进行一些简要的说明。

#### 6. 在数据文件中添加展示项

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

#### 命名规则和重要说明

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

## Pull Request 审查流程

1. 提交 PR 后，项目维护者会进行审查
2. 根据反馈进行必要的修改
3. 审查通过后，代码将被合并到主分支

## 行为准则

- 尊重所有贡献者
- 建设性的反馈和讨论
- 专注于对项目最有利的事情
- 展示同理心，理解不同的观点和经验

## 问题反馈

如果您在贡献过程中遇到任何问题，请随时创建 Issue 或联系项目维护者。

再次感谢您的贡献！🎉


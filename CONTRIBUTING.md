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

添加新的 Showcase 时，请遵循以下规范：

1. **目录结构**：
   ```
   src/pages/
   └── your-showcase/
       ├── index.jsx         # 入口文件（必须）
       ├── YourShowcase.jsx  # 主组件（必须）
       ├── YourShowcase.less # 样式文件（可选）
       └── assets/           # 资源文件（可选）
   ```

2. **使用 withSourceCode HOC**：
   ```jsx
   import {withSourceCode} from '../../utils/withSourceCode';
   
   export default withSourceCode(YourShowcase);
   ```

3. **资源管理**：
   - 静态资源放在 showcase 目录下的 `assets` 文件夹
   - 确保在 `useEffect` 的清理函数中释放所有资源

4. **在 showcases.js 中注册**：
   ```js
   {
     title: '您的展示标题',
     image: '缩略图 URL',
     path: '/your-showcase',
     category: '分类名称'
   }
   ```

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


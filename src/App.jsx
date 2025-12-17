import {BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom';
import {Layout, Menu, Input, Typography} from 'antd';
import {
    SearchOutlined,
    EnvironmentOutlined,
    GlobalOutlined,
    BuildOutlined,
    PictureOutlined,
    ToolOutlined,
} from '@ant-design/icons';
import {useState, useMemo, useRef, lazy, Suspense, useEffect} from 'react';
import {showcases} from './data/showcases';
import ShowcaseCard from './components/ShowcaseCard';
import './App.less';

const {Title} = Typography;

// 从环境变量获取基础路径
const PUBLIC_PATH = import.meta.env.VITE_PUBLIC_PATH;

// 获取所有分类
const categories = [...new Set(showcases.map(item => item.category))];

// 按分类对showcase进行分组
const groupedShowcases = categories.reduce((acc, category) => {
    acc[category] = showcases.filter(item => item.category === category);
    return acc;
}, {});

// 使用Vite的动态导入，设置eager:false以确保懒加载
const modules = import.meta.glob('./pages/**/index.jsx', {eager: false});

// 为每个路径创建组件映射
const componentMap = {};

// 创建错误边界组件
const ErrorFallback = ({path}) => (
    <div className="error-container">
        <h2>加载组件失败</h2>
        <p>无法加载路径: {path}</p>
        <button onClick={() => window.location.href = '/'}>返回首页</button>
    </div>
);

Object.keys(modules).forEach(modulePath => {
    // 从模块路径中提取组件名称
    const pathParts = modulePath.split('/');
    const showcaseName = pathParts[2]; // pages/[showcase]/index.jsx

    // 注册路径和组件的映射关系
    const path = `/${showcaseName}`;

    // 使用lazy导入，并添加错误处理
    componentMap[path] = lazy(() =>
        modules[modulePath]()
            .catch(err => {
                console.error(`Error loading component for path ${path}:`, err);
                return {
                    default: () => <ErrorFallback path={path} />,
                };
            })
    );
});

// 过滤只存在于showcases中且存在对应组件的路径
const validPaths = showcases
    .map(item => item.path)
    .filter(path => componentMap[path]);

// 确保路径唯一
const uniquePaths = [...new Set(validPaths)];

// 获取对应分类的图标
const getCategoryIcon = category => {
    switch (category) {
        case '地理数据可视化':
            return <BuildOutlined />;
        case '三维地图与模型':
            return <GlobalOutlined />;
        case '工具平台':
            return <ToolOutlined />;
        case '地图':
            return <PictureOutlined />;
        default:
            return <EnvironmentOutlined />;
    }
};

const ShowcaseList = () => {
    const [searchText, setSearchText] = useState('');
    const categoryRefs = useRef({});

    // 设置首页title
    useEffect(() => {
        document.title = '首页 - JSAPI Three Showcase';
    }, []);

    const filteredShowcases = useMemo(() => {
        if (!searchText) {
            return groupedShowcases;
        }

        const filtered = {};
        categories.forEach(category => {
            const items = groupedShowcases[category].filter(showcase => {
                const titleMatch = showcase.title.toLowerCase().includes(searchText.toLowerCase());
                const tagsMatch = Array.isArray(showcase.tags) && showcase.tags.some(tag =>
                    tag.toLowerCase().includes(searchText.toLowerCase())
                );
                return titleMatch || tagsMatch;
            });
            if (items.length > 0) {
                filtered[category] = items;
            }
        });
        return filtered;
    }, [searchText]);

    const scrollToCategory = category => {
        categoryRefs.current[category]?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    return (
        <>
            <div className="app-container">
                <div className="sidebar">
                    <div style={{textAlign: 'center', margin: '12px 0 24px 0'}}>
                        <Title level={3} style={{color: '#fff', margin: 0}}>JSAPI Three Showcase</Title>
                    </div>
                    <div className="search-container">
                        <Input
                            placeholder="搜索showcase..."
                            prefix={<SearchOutlined />}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                        />
                    </div>
                    <Menu
                        theme="dark"
                        mode="inline"
                        items={[
                            ...categories.map(category => ({
                                key: category,
                                icon: getCategoryIcon(category),
                                label: category,
                            })),
                        ]}
                        onClick={({key}) => {
                            scrollToCategory(key);
                        }}
                    />
                </div>
                <div className="main-content">
                    {Object.keys(filteredShowcases).length > 0 ? (
                        Object.entries(filteredShowcases).map(([category, items]) => (
                            <div
                                key={category}
                                className="category-section"
                                ref={el => categoryRefs.current[category] = el}
                            >
                                <Title level={2} className="category-title">{category}</Title>
                                <div className="showcase-grid">
                                    {items.map(showcase => (
                                        <ShowcaseCard
                                            key={showcase.path}
                                            publicPath={PUBLIC_PATH}
                                            {...showcase}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <Title level={3}>
                                没有找到匹配的showcase
                                {searchText && `：${searchText}`}
                            </Title>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

function App() {
    return (
        <>
            <Router basename={PUBLIC_PATH}>
                <Suspense fallback={<div className="loading-container" />}>
                    <Routes>
                        <Route path="/" element={<ShowcaseList />} />
                        {uniquePaths.map(path => {
                            const Component = componentMap[path];
                            return Component ? (
                                <Route key={path} path={path} element={<Component />} />
                            ) : null;
                        })}
                    </Routes>
                </Suspense>
            </Router>
        </>
    );
}

export default App;

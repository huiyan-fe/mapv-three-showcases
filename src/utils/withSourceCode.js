import React, {memo, useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import CodeViewer from '../components/CodeViewer';
import {showcases} from '../data/showcases';

// Base GitHub repository URL
const BASE_GITHUB_URL = 'https://github.com/huiyan-fe/mapv-three-showcases/tree/main/src/pages/';

// HOC: Component with GitHub source code link
export const withSourceCode = WrappedComponent => {
    const SourceCodeWrapper = props => {
        const location = useLocation();
        const [githubUrl, setGithubUrl] = useState('');

        useEffect(() => {
            // 根据当前路径查找对应的showcase数据
            const currentShowcase = showcases.find(item => item.path === location.pathname);
            // 设置页面title
            if (currentShowcase) {
                document.title = `${currentShowcase.title} - JSAPI Three 案例 | MapV Three`;
            }
            else {
                // 如果没有找到对应的showcase，使用组件名称
                document.title = `${WrappedComponent.name} - JSAPI Three 案例 | MapV Three`;
            }

            // 构建GitHub链接
            if (location.pathname !== '/') {
                // 从路径中提取组件名称
                const pathParts = location.pathname.split('/').filter(Boolean);
                if (pathParts.length > 0) {
                    const componentName = pathParts[0];
                    setGithubUrl(`${BASE_GITHUB_URL}${componentName}/`);
                }
                else {
                    // 回退到组件名称（小写）作为目录名
                    const fallbackPath = WrappedComponent.name.toLowerCase();
                    setGithubUrl(`${BASE_GITHUB_URL}${fallbackPath}`);
                }
            }
        }, [location.pathname]);

        return (
            <>
                <WrappedComponent {...props} />
                {githubUrl && <CodeViewer githubUrl={githubUrl} />}
            </>
        );
    };

    SourceCodeWrapper.displayName = `withSourceCode(${WrappedComponent.name})`;
    return memo(SourceCodeWrapper);
};

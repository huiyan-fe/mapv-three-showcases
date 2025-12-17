import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {Button} from 'antd';
import {CodeOutlined} from '@ant-design/icons';

const CodeViewer = ({githubUrl}) => {
    const [mapContainer, setMapContainer] = useState(null);

    const handleViewSource = () => {
        window.open(githubUrl, '_blank');
    };

    useEffect(() => {
        // 检测是否有 mapv-container class 的地图容器（左右布局的地图容器）
        const findMapContainer = () => {
            // 优先查找带有 mapv-container class 的元素
            const container = document.querySelector('.mapv-container');
            if (container) {
                // 检查是否有左侧面板（通过检查容器左边距）
                const rect = container.getBoundingClientRect();
                // 如果地图容器左边距大于50px，说明有左侧面板
                if (rect.left > 50) {
                    return container;
                }
            }
            return null;
        };

        const checkLayout = () => {
            const container = findMapContainer();
            if (container) {
                setMapContainer(container);
            }
        };

        checkLayout();
        // 延迟检查，确保布局已渲染
        const timer = setTimeout(checkLayout, 100);
        // 使用 MutationObserver 监听 DOM 变化，以便在地图初始化后检测
        const observer = new MutationObserver(checkLayout);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class'],
        });
        window.addEventListener('resize', checkLayout);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
            window.removeEventListener('resize', checkLayout);
        };
    }, []);

    const noticeContent = (
        <div
            style={{
                position: mapContainer ? 'absolute' : 'fixed',
                left: 24,
                bottom: 24,
                zIndex: 1000,
                color: '#eee',
                textShadow: '-1px -1px 0 #333, 1px -1px 0 #333, -1px 1px 0 #333, 1px 1px 0 #333',
                lineHeight: 1.4,
                pointerEvents: 'none',
            }}
        >
            <div>* 示例数据不具真实性，仅做演示使用。</div>
            <div>*&nbsp;
                <span style={{fontSize: 12}}>
                    The sample data is for demonstration only and is not real.
                </span>
            </div>
        </div>
    );

    return (
        <>
            {/* <Button
                className="back-button"
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/')}
                style={{position: 'fixed', left: 24, top: 24, zIndex: 1000}}
            >
                返回
            </Button> */}
            <Button
                type="primary"
                icon={<CodeOutlined />}
                onClick={handleViewSource}
                style={{position: 'fixed', right: 24, bottom: 24, zIndex: 1000}}
            >
                查看源码
            </Button>
            {mapContainer ? createPortal(noticeContent, mapContainer) : noticeContent}
        </>
    );
};

export default CodeViewer;
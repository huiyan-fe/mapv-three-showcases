import React from 'react';

/**
 * PanelLayout
 * @param {string} side - 'left' | 'right'，决定悬浮在左还是右
 * @param {ReactNode[]} children - 每个子元素为一个面板格子，可传 props.height
 */
function PanelLayout({side = 'right', width = 280, children, style}) {
    const layoutStyle = {
        position: 'absolute',
        top: 40,
        bottom: 24,
        [side]: 24,
        width,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        pointerEvents: 'auto',
        ...style,
    };

    return (
        <div style={layoutStyle}>
            {React.Children.map(children, (child, idx) => {
                if (!child) {
                    return null;
                }

                // 有 height 的格子用固定高度，没有的用 flex: 1
                const childStyle = child.props?.height
                    ? {height: child.props.height}
                    : {flex: 1};

                return (
                    <div key={child.key || idx} style={childStyle}>
                        {child}
                    </div>
                );
            })}
        </div>
    );
}

export default PanelLayout;
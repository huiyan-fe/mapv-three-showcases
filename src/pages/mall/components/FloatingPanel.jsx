import React from 'react';

const panelStyle = {
    background: 'rgba(30, 34, 44, 0.72)', // 深色半透明
    borderRadius: 12,
    boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
    border: '1px solid rgba(80, 80, 100, 0.18)',
    backdropFilter: 'blur(12px) saturate(140%)',
    WebkitBackdropFilter: 'blur(12px) saturate(140%)',
    // 不包含定位和尺寸信息
};

const titleStyle = {
    padding: '12px 20px',
    fontWeight: 600,
    fontSize: 16,
    borderBottom: '1px solid rgba(80, 80, 100, 0.18)',
    background: 'rgba(40, 44, 60, 0.92)',
    color: '#fff',
    letterSpacing: 1,
};

const contentStyle = {
    padding: '16px 20px',
    color: '#cfd8dc',
    fontSize: 15,
};

function FloatingPanel({title, children, style, contentStyle: customContentStyle}) {
    return (
        <div style={{...panelStyle, ...style}}>
            <div style={titleStyle}>{title}</div>
            <div style={{...contentStyle, ...customContentStyle}}>{children}</div>
        </div>
    );
}

export default FloatingPanel;
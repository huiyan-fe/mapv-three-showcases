import React from 'react';
import './FloatingPanel.less';

function FloatingPanel({title, children, style, contentStyle: customContentStyle}) {
    return (
        <div className="floating-panel" style={style}>
            <div className="floating-panel-title">{title}</div>
            <div className="floating-panel-content" style={customContentStyle}>{children}</div>
        </div>
    );
}

export default FloatingPanel;
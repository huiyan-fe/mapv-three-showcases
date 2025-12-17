import React from 'react';

function LegendItem({color, children}) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 14,
                color: 'rgba(207, 216, 220, 0.8)',
                padding: '4px 0',
            }}
        >
            <div
                style={{
                    width: 24,
                    height: 3,
                    backgroundColor: color,
                    marginRight: 8,
                    borderRadius: 1.5,
                }}
            />
            {children}
        </div>
    );
}

export default LegendItem;
import React from 'react';

const checkboxStyle = {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    padding: '6px 12px',
    borderRadius: 6,
    transition: 'background-color 0.2s',
};

const iconBoxStyle = {
    width: 18,
    height: 18,
    borderRadius: 4,
    border: '2px solid rgba(251, 192, 45, 0.4)',
    marginRight: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
};

const labelStyle = {
    fontSize: 14,
    transition: 'color 0.2s',
};

const iconStyle = {
    width: 16,
    height: 16,
    marginRight: 4,
    opacity: 0.8,
};

function CustomCheckbox({checked, onChange, children, icon, color = '#fbc02d'}) {
    const [isHover, setIsHover] = React.useState(false);

    return (
        <div
            style={{
                ...checkboxStyle,
                backgroundColor: isHover ? 'rgba(251, 192, 45, 0.1)' : 'transparent',
            }}
            onClick={() => onChange(!checked)}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
        >
            <div
                style={{
                    ...iconBoxStyle,
                    backgroundColor: checked ? color : 'transparent',
                    borderColor: checked ? color : isHover ? 'rgba(251, 192, 45, 0.8)' : 'rgba(251, 192, 45, 0.4)',
                    boxShadow: checked ? '0 2px 8px rgba(251, 192, 45, 0.25)' : 'none',
                }}
            >
                {checked && (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="#222">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                )}
            </div>
            <div style={{display: 'flex', alignItems: 'center'}}>
                {icon && <img src={icon} style={iconStyle} />}
                <span
                    style={{
                        ...labelStyle,
                        color: checked ? '#ffe082' : isHover ? 'rgba(255, 224, 130, 0.95)' : 'rgba(207, 216, 220, 0.8)',
                    }}
                >
                    {children}
                </span>
            </div>
        </div>
    );
}

export default CustomCheckbox;
import React from 'react';

const tableWrapperStyle = {
    height: '100%',
    overflowY: 'auto',
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    color: '#fff',
    fontSize: '14px',
};

const cellStyle = {
    padding: '8px 4px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
};

const headerStyle = {
    ...cellStyle,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: 'normal',
    textAlign: 'left',
};

function SourceTable({data = []}) {
    return (
        <div style={tableWrapperStyle}>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={headerStyle}>名称</th>
                        <th style={headerStyle}>比例</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, idx) => (
                        <tr key={item.id || item.name || idx}>
                            <td style={cellStyle}>{item.name}</td>
                            <td style={cellStyle}>{(item.rate * 100).toFixed(2)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default SourceTable;
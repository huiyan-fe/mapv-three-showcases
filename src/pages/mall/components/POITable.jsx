import React from 'react';

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

/**
 * POI 数据表格组件
 * @param {Array} data - POI 数据数组
 * @param {string} type - POI 类型，用于生成默认名称
 * @param {number} maxItems - 最大显示条数，默认 5
 */
function POITable({data = [], type = '', maxItems = 5}) {
    // 生成随机距离（100-1000米）
    const generateRandomDistance = () => {
        return Math.floor(Math.random() * 901) + 100; // 100 到 1000 之间的随机数
    };

    // 处理数据：限制数量，生成默认名称和随机距离
    const processedData = data.slice(0, maxItems).map((item, index) => ({
        ...item,
        name: item.name || `${type}${index + 1}`,
        distance: generateRandomDistance(),
        id: item.id || `${type}_${index}`, // 添加唯一标识
    }));

    return (
        <table style={tableStyle}>
            <thead>
                <tr>
                    <th style={headerStyle}>名称</th>
                    <th style={headerStyle}>距离</th>
                </tr>
            </thead>
            <tbody>
                {processedData.map(item => (
                    <tr key={item.id}>
                        <td style={cellStyle}>{item.name}</td>
                        <td style={cellStyle}>{item.distance}m</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default POITable;
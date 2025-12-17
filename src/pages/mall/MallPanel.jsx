import React, {useEffect, useState} from 'react';
import './MallPanel.less';
import sourceData from './data/source.json';

function MallPanel({showType, setShowType, onRowClick}) {
    const [tableData, setTableData] = useState([]);
    useEffect(() => {
        setTableData(sourceData.sort((a, b) => b.rate - a.rate));
    }, []);
    const handleRowClick = item => {
        if (onRowClick) {
            onRowClick(item);
        }
    };
    return (
        <div className="scenery-side-panel">
            <div className="scenery-side-panel-btns">
                <button
                    className={showType === 'label' ? 'active' : ''}
                    onClick={() => setShowType('label')}
                >
                    商场位置
                </button>
            </div>
            <div className="scenery-side-panel-table">
                <table>
                    <thead>
                        <tr>
                            <th>名称</th>
                            <th>占比</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((item, idx) => (
                            <tr key={item.name} onClick={() => handleRowClick(item)} style={{cursor: 'pointer'}}>
                                <td title={item.name}>{item.name}</td>
                                <td>{(item.rate * 100).toFixed(2)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
export default MallPanel;
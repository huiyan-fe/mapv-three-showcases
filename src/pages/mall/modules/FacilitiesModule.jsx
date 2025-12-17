import React from 'react';
import FloatingPanel from '../components/FloatingPanel';
import PanelLayout from '../components/PanelLayout';
import POITable from '../components/POITable';

// 模拟数据，实际使用时替换为真实数据
const mockData = {
    parking: [
        {id: 'p1', name: '地下停车场'},
        {id: 'p2', name: '室外停车场'},
        {id: 'p3'},
        {id: 'p4'},
        {id: 'p5'},
    ],
    restaurant: [
        {id: 'r1', name: '粤式茶餐厅'},
        {id: 'r2', name: '川菜馆'},
        {id: 'r3', name: '日料店'},
        {id: 'r4', name: '西餐厅'},
        {id: 'r5', name: '快餐店'},
    ],
    cafe: [
        {id: 'c1', name: '星巴克'},
        {id: 'c2', name: '太平洋咖啡'},
        {id: 'c3', name: '上岛咖啡'},
        {id: 'c4'},
        {id: 'c5'},
    ],
    toilet: [
        {id: 't1', name: '一楼卫生间'},
        {id: 't2', name: '二楼卫生间'},
        {id: 't3', name: '三楼卫生间'},
        {id: 't4'},
        {id: 't5'},
    ],
};

function FacilitiesModule() {
    return (
        <PanelLayout side="right" width={280}>
            <FloatingPanel title="停车场" height={200}>
                <POITable
                    data={mockData.parking}
                    type="停车场"
                    maxItems={5}
                />
            </FloatingPanel>
            <FloatingPanel title="餐饮" height={200}>
                <POITable
                    data={mockData.restaurant}
                    type="餐厅"
                    maxItems={5}
                />
            </FloatingPanel>
            <FloatingPanel title="咖啡馆" height={200}>
                <POITable
                    data={mockData.cafe}
                    type="咖啡馆"
                    maxItems={5}
                />
            </FloatingPanel>
            <FloatingPanel title="卫生间" height={200}>
                <POITable
                    data={mockData.toilet}
                    type="卫生间"
                    maxItems={5}
                />
            </FloatingPanel>
        </PanelLayout>
    );
}

export default FacilitiesModule;
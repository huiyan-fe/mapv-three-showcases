import {withSourceCode} from '../../utils/withSourceCode';
import * as mapvthree from '@baidumap/mapv-three';
import initEngine from '../../utils/initEngine';
import {useEffect, useState, useRef} from 'react';
import {Select, Button, Card, Typography, Space, Badge} from 'antd';
import {
    EnvironmentOutlined,
    BankOutlined,
    PictureOutlined,
    BgColorsOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';

const {Title, Text} = Typography;
const {Option} = Select;

const center = [116.5163443534827, 39.79913123605543];

const administrativeRegions = [
    {code: '110000', name: '北京市'},
    {code: '310000', name: '上海市'},
    {code: '500000', name: '重庆市'},
    {code: '440000', name: '广东省'},
    {code: '320000', name: '江苏省'},
    {code: '330000', name: '浙江省'},
    {code: '370000', name: '山东省'},
    {code: '410000', name: '河南省'},
    {code: '130000', name: '河北省'},
];

const sceneryTypes = [
    {type: 'historical', name: '历史古迹', icon: BankOutlined, color: '#8B4513'},
    {type: 'natural', name: '自然风光', icon: PictureOutlined, color: '#228B22'},
    {type: 'park', name: '公园绿地', icon: BgColorsOutlined, color: '#32CD32'},
    {type: 'water', name: '水域景观', icon: EnvironmentOutlined, color: '#1E90FF'},
];

function Scenery() {
    const [selectedRegion, setSelectedRegion] = useState('110000');
    const [loading, setLoading] = useState(false);
    const [sceneryData, setSceneryData] = useState([]);

    const filterTypeRef = useRef('all');
    const engineRef = useRef(null);
    const localSearchRef = useRef(null);
    const districtLayerRef = useRef(null);

    const searchScenery = type => {
        if (!localSearchRef.current) {
            return;
        }
        const searchKeywords = {
            all: '景点',
            historical: '历史古迹',
            natural: '自然风光',
            cultural: '文化景观',
            park: '公园',
            water: '湖泊景点',
            other: '景点',
        };
        const keyword = searchKeywords[type] || '景点';

        console.log('keyword', keyword);
        localSearchRef.current.search(keyword, {zoom: 18})
            .then(data => {
                if (data?.pois) {
                    setSceneryData(data.pois);
                }
            })
            .catch(err => {
                console.error('搜索失败:', err);
            });
    };


    useEffect(() => {
        const {engine} = initEngine({
            skyType: 'dynamic',
            documentId: 'map-container',
            center,
            pitch: 0,
            range: 10000,
            projection: 'ecef',
            enableAnimationLoop: true,
        });

        engine.add(new mapvthree.MapView({
            terrainProvider: null,
            vectorProvider: new mapvthree.BaiduVectorTileProvider(),
        }));

        const districtLayer = new mapvthree.services.DistrictLayer({
            name: '(北京市)',
            kind: 0,
            renderOptions: {
                engine,
                fillColor: '#1890ff',
                fillOpacity: 0.6,
                depthTest: false,
                autoViewport: true,
            },
        });

        districtLayer.addEventListener('renderComplete', e => {
            setTimeout(() => {
                searchScenery(filterTypeRef.current);
            }, 0);
        });

        const localSearch = new mapvthree.services.LocalSearch({
            renderOptions: {engine, autoViewport: true},
            pageNum: 0,
        });

        window.localSearch = localSearch;

        engineRef.current = engine;
        districtLayerRef.current = districtLayer;
        localSearchRef.current = localSearch;

        return () => {
            engine.dispose();
        };
    }, []);

    const handleRegionChange = regionCode => {
        const selectedRegionInfo = administrativeRegions.find(r => r.code === regionCode);
        if (!selectedRegionInfo || !districtLayerRef.current) {
            return;
        }

        setSelectedRegion(regionCode);
        setSceneryData([]);
        try {
            localSearchRef.current.clearMap();
            districtLayerRef.current.setName(`(${selectedRegionInfo.name})`);
        }
        catch (error) {
            console.error('切换区域失败:', error);
        }
    };

    const flyToPoi = (poi, index) => {
        if (!engineRef.current || !poi?.point) {
            return;
        }

        engineRef.current.map.flyTo(poi.point, {
            range: 200,
            duration: 1000,
        });

        localSearchRef.current.setPopupByIndex(index);
    };

    const handleFilterChange = type => {
        filterTypeRef.current = type;
        searchScenery(type);
    };

    const selectedRegionInfo = administrativeRegions.find(r => r.code === selectedRegion);

    return (
        <div style={{height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
            {/* 顶部控制栏 */}
            <Card
                style={{borderRadius: 0, borderBottom: '1px solid #d9d9d9'}}
                styles={{body: {padding: '16px 24px'}}}
            >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Title level={3} style={{margin: 0, display: 'flex', alignItems: 'center'}}>
                        <EnvironmentOutlined style={{marginRight: 8, color: '#1890ff'}} />
                        景点分布
                    </Title>
                    <Space size="large">
                        <Space>
                            <Text strong>选择区域:</Text>
                            <Select
                                value={selectedRegion}
                                onChange={handleRegionChange}
                                style={{width: 120}}
                                placeholder="选择区域"
                                loading={loading}
                            >
                                {administrativeRegions.map(region => (
                                    <Option key={region.code} value={region.code}>
                                        {region.name}
                                    </Option>
                                ))}
                            </Select>
                        </Space>
                        {selectedRegionInfo && (
                            <Badge count={selectedRegionInfo.name} style={{backgroundColor: '#1890ff'}}>
                                <Text type="secondary">当前区域</Text>
                            </Badge>
                        )}
                    </Space>
                </div>
            </Card>

            {/* 主体内容 */}
            <div style={{flex: 1, display: 'flex', minHeight: 0}}>
                {/* 左侧面板 */}
                <Card
                    style={{
                        width: 320,
                        borderRadius: 0,
                        borderRight: '1px solid #d9d9d9',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    }}
                    styles={{body: {padding: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0}}}
                >
                    <div style={{padding: 16, borderBottom: '1px solid #f0f0f0', flexShrink: 0}}>
                        <Title level={4} style={{marginBottom: 12}}>景点类型</Title>
                        <Space direction="vertical" style={{width: '100%'}}>
                            <Button
                                type={filterTypeRef.current === 'all' ? 'primary' : 'default'}
                                icon={<AppstoreOutlined />}
                                block
                                onClick={() => handleFilterChange('all')}
                            >
                                全部景点
                            </Button>
                            {sceneryTypes.map(type => {
                                const IconComponent = type.icon;
                                return (
                                    <Button
                                        key={type.type}
                                        type={filterTypeRef.current === type.type ? 'primary' : 'default'}
                                        icon={<IconComponent style={{
                                            color: filterTypeRef.current === type.type ? '#fff' : type.color,
                                        }}
                                        />}
                                        block
                                        onClick={() => handleFilterChange(type.type)}
                                    >
                                        {type.name}
                                    </Button>
                                );
                            })}
                        </Space>
                    </div>

                    <div style={{flex: 1, overflow: 'auto', padding: 16}}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 12,
                        }}
                        >
                            <Title level={4} style={{margin: 0}}>{selectedRegionInfo?.name}景点列表</Title>
                            {sceneryData.length > 0 && (
                                <Badge count={sceneryData.length} style={{backgroundColor: '#52c41a'}} />
                            )}
                        </div>
                        {sceneryData.length > 0 ? (
                            sceneryData.map((poi, index) => (
                                <Card
                                    key={poi.uid || index}
                                    size="small"
                                    hoverable
                                    onClick={() => flyToPoi(poi, index)}
                                    style={{marginBottom: 4}}
                                    styles={{body: {padding: '12px'}}}
                                >
                                    <div style={{fontWeight: 500, fontSize: 14, marginBottom: 4}}>{poi.title}</div>
                                    {poi.address && <div style={{fontSize: 12, color: '#8c8c8c'}}>📍 {poi.address}</div>}
                                    {poi.areaname && <div style={{fontSize: 12, color: '#8c8c8c'}}>{poi.areaname}</div>}
                                </Card>
                            ))
                        ) : (
                            <div style={{textAlign: 'center', padding: '40px 0'}}>
                                <EnvironmentOutlined style={{fontSize: 48, color: '#d9d9d9', marginBottom: 16}} />
                                <Text type="secondary">暂无景点数据</Text>
                            </div>
                        )}
                    </div>
                </Card>

                {/* 右侧地图 */}
                <div id="map-container" style={{flex: 1, position: 'relative'}} />
            </div>
        </div>
    );
}

export default withSourceCode(Scenery);

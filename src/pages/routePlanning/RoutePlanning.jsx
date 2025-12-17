/* eslint-disable react/no-array-index-key */
import {useState, useRef, useEffect} from 'react';
import {Button, Card, Typography, Space, Input, AutoComplete, message, Modal, Divider} from 'antd';
import initEngine from '../../utils/initEngine';
import * as mapvthree from '@baidumap/mapv-three';
import {withSourceCode} from '../../utils/withSourceCode';
import {
    EyeOutlined,
    DollarOutlined,
    SwapOutlined,
    SearchOutlined,
    FullscreenOutlined,
} from '@ant-design/icons';

const {Title, Text} = Typography;

const transportModes = [
    {key: 'transit', name: '公交', icon: '🚌'},
    {key: 'driving', name: '驾车', icon: '🚗'},
    {key: 'walking', name: '步行', icon: '🚶'},
    {key: 'riding', name: '骑行', icon: '🚴'},
];

const mockSuggestions = [
    {
        value: '天安门广场',
        label: '天安门广场',
        address: '北京市东城区天安门广场',
        coordinates: [116.4041774131041, 39.9096519665138],
    },
    {
        value: '故宫博物院',
        label: '故宫博物院',
        address: '北京市东城区景山前街4号',
        coordinates: [116.4034138534206, 39.924091367210636],
    },
    {
        value: '天坛公园',
        label: '天坛公园',
        address: '北京市东城区天坛路甲1号',
        coordinates: [116.41724596166326, 39.8882429566928],
    },
    {
        value: '颐和园',
        label: '颐和园',
        address: '北京市海淀区新建宫门路19号',
        coordinates: [116.30641257868942, 39.99399869997267],
    },
    {
        value: '圆明园',
        label: '圆明园',
        address: '北京市海淀区清华西路28号',
        coordinates: [116.29588578557073, 40.00834513929696],
    },
    {
        value: '南锣鼓巷',
        label: '南锣鼓巷',
        address: '北京市东城区南锣鼓巷',
        coordinates: [116.82675945890509, 40.373328406928565],
    },
    {
        value: '什刹海',
        label: '什刹海',
        address: '北京市西城区羊房胡同23号',
        coordinates: [116.38862999049014, 39.93971212485587],
    },
    {
        value: '雍和宫',
        label: '雍和宫',
        address: '北京市东城区雍和宫大街12号',
        coordinates: [116.42377906814566, 39.95403576220714],
    },
    {
        value: '八达岭长城',
        label: '八达岭长城',
        address: '北京市延庆区G6京藏高速58号出口',
        coordinates: [116.0240669823232, 40.36263905038877],
    },
];

const center = [116.39780778732182, 39.9215770322476];

// 时间格式化函数
const formatDuration = minutes => {
    if (minutes < 60) {
        return `${minutes}分钟`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours}小时`;
    }

    return `${hours}小时${remainingMinutes}分钟`;
};

function RoutePlanning() {
    const [selectedTransport, setSelectedTransport] = useState('walking');
    const [startPoint, setStartPoint] = useState('颐和园');
    const [endPoint, setEndPoint] = useState('圆明园');
    const [activeRoute, setActiveRoute] = useState(0);
    const [loading, setLoading] = useState(false);
    const [routeResults, setRouteResults] = useState([]);
    const [currentLocation, setCurrentLocation] = useState('北京市海淀区');
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedRouteDetail, setSelectedRouteDetail] = useState(null);

    // 地图相关状态
    const engineRef = useRef(null);
    const routeServicesRef = useRef({});
    const mapContainerRef = useRef(null);

    // 初始化地图
    const initializeMap = () => {
        try {
            const {engine} = initEngine({
                skyType: 'dynamic',
                documentId: 'map-container',
                center,
                pitch: 0,
                range: 100000,
                projection: 'ecef',
                enableAnimationLoop: true,
            });

            engineRef.current = engine;

            // 添加地图图层
            engine.add(new mapvthree.MapView({
                terrainProvider: null,
                vectorProvider: new mapvthree.BaiduVectorTileProvider(),
            }));

            // 初始化各种路线服务
            routeServicesRef.current = {
                walking: new mapvthree.services.WalkingRoute({
                    renderOptions: {
                        engine,
                        autoViewport: true,
                    },
                }),
                driving: new mapvthree.services.DrivingRoute({
                    renderOptions: {
                        engine,
                        autoViewport: true,
                    },
                }),
                riding: new mapvthree.services.RidingRoute({
                    renderOptions: {
                        engine,
                        autoViewport: true,
                    },
                }),
                transit: new mapvthree.services.TransitRoute({
                    renderOptions: {
                        engine,
                        autoViewport: true,
                    },
                }),
            };

            console.log('地图初始化成功');
        }
        catch (error) {
            console.error('地图初始化失败:', error);
            message.error('地图初始化失败');
        }
    };

    useEffect(() => {
        initializeMap();
        return () => {
            if (engineRef.current) {
                engineRef.current.dispose();
            }
        };
    }, []);

    // 格式化路线数据
    const formatRouteData = (result, type) => {
        if (!result) {
            return [];
        }

        // 如果结果是单个路线对象（不是数组）
        if (result.distance !== undefined && result.duration !== undefined) {
            const route = result;
            const duration = Math.round(route.duration / 60); // 转换为分钟
            const distance = (route.distance / 1000).toFixed(1); // 转换为公里

            // 计算费用（模拟）
            let cost = '免费';
            if (type === 'driving') {
                const fuelCost = Math.round(distance * 0.8); // 估算油费
                cost = `约${fuelCost}元`;
            }
            else if (type === 'transit') {
                cost = '约2-8元';
            }

            // 处理路线步骤
            const steps = route.steps ? route.steps.map(step => {
                return step.description || step.instruction || '继续前行';
            }) : [];

            return [{
                id: 0,
                type: '推荐路线',
                time: formatDuration(duration),
                distance: `${distance}公里`,
                cost,
                steps,
                rawData: route,
                startPoint: route.start ? route.start.title : '',
                endPoint: route.end ? route.end.title : '',
            }];
        }

        // 如果结果包含多个路线方案
        const routes = result.routes || result.plans || [];
        if (routes.length === 0) {
            return [];
        }

        return routes.map((route, index) => {
            const duration = Math.round(route.duration / 60);
            const distance = (route.distance / 1000).toFixed(1);

            // 计算费用（模拟）
            let cost = '免费';
            if (type === 'driving') {
                const fuelCost = Math.round(distance * 0.8);
                cost = `约${fuelCost}元`;
            }
            else if (type === 'transit') {
                cost = '约2-8元';
            }

            // 生成路线类型名称
            let routeType = '推荐路线';
            if (index === 0) {
                routeType = '推荐路线';
            }
            else if (index === 1) {
                routeType = '最短路线';
            }
            else if (index === 2) {
                routeType = '少收费路线';
            }
            else {
                routeType = `方案${index + 1}`;
            }

            // 处理路线步骤
            const steps = route.steps ? route.steps.map(step => {
                return step.description || step.instruction || '继续前行';
            }) : [];

            return {
                id: index,
                type: routeType,
                time: formatDuration(duration),
                distance: `${distance}公里`,
                cost,
                steps,
                rawData: route,
                startPoint: route.start ? route.start.title : '',
                endPoint: route.end ? route.end.title : '',
            };
        });
    };

    // 根据景点名称获取坐标
    const getCoordinatesByName = placeName => {
        const place = mockSuggestions.find(item => item.value === placeName);
        return place ? place.coordinates : null;
    };

    const clearMap = () => {
        routeServicesRef.current.walking.clearMap();
        routeServicesRef.current.driving.clearMap();
        routeServicesRef.current.riding.clearMap();
        routeServicesRef.current.transit.clearMap();
    };

    // 执行路线搜索
    const performRouteSearch = async () => {
        const routeService = routeServicesRef.current[selectedTransport];
        if (!routeService) {
            message.error('路线服务未初始化');
            return;
        }

        // 获取起点和终点的坐标
        const startCoords = getCoordinatesByName(startPoint);
        const endCoords = getCoordinatesByName(endPoint);

        if (!startCoords || !endCoords) {
            message.error('无法获取景点坐标，请选择列表中的景点');
            return;
        }

        // 格式化坐标为字符串 "纬度,经度"
        const startCoordStr = `${startCoords[1]},${startCoords[0]}`;
        const endCoordStr = `${endCoords[1]},${endCoords[0]}`;

        try {
            console.log(`开始搜索${selectedTransport}路线:`, startPoint, '->', endPoint);
            console.log('起点坐标:', startCoordStr, '终点坐标:', endCoordStr);

            // 清除之前的路线
            clearMap();

            console.log('startPoint', 'endPoint');
            const result = await routeService.search(startCoords, endCoords, {
                // 可以添加搜索选项
                alternatives: true, // 获取多条路线
            });

            console.log('路线搜索结果:', result);

            if (result && result.steps) {
                const formattedRoutes = formatRouteData(result, selectedTransport);

                if (formattedRoutes.length > 0) {
                    setRouteResults(formattedRoutes);
                    setActiveRoute(0);
                    message.success(`找到${formattedRoutes.length}条路线`);
                }
                else {
                    setRouteResults([]);
                    message.warning('未找到合适的路线');
                }
            }
            else {
                setRouteResults([]);
                message.warning('未找到路线结果');
            }
        }
        catch (error) {
            console.error('路线搜索失败:', error);
            message.error('路线搜索失败，请检查起终点是否正确');
            setRouteResults([]);
        }
    };

    // 处理路线搜索
    const handleSearch = async () => {
        if (!startPoint.trim() || !endPoint.trim()) {
            message.warning('请选择起点和终点');
            return;
        }

        if (startPoint === endPoint) {
            message.warning('起点和终点不能相同');
            return;
        }

        // 验证选择的地点是否在列表中
        const startExists = mockSuggestions.some(item => item.value === startPoint);
        const endExists = mockSuggestions.some(item => item.value === endPoint);

        if (!startExists || !endExists) {
            message.warning('请从下拉列表中选择景点');
            return;
        }

        setLoading(true);

        try {
            await performRouteSearch();
        }
        finally {
            setLoading(false);
        }
    };

    // 切换出行方式
    const handleTransportChange = mode => {
        setSelectedTransport(mode);
        setRouteResults([]); // 清空之前的结果
        setActiveRoute(0);
    };

    // 交换起终点
    const handleSwapPoints = () => {
        const temp = startPoint;
        setStartPoint(endPoint);
        setEndPoint(temp);

        // 如果已有搜索结果，自动重新搜索
        if (routeResults.length > 0) {
            setTimeout(handleSearch, 100);
        }
    };

    // 选择路线方案
    const handleRouteSelect = routeId => {
        setActiveRoute(routeId);

        // 在地图上显示选中的路线
        const selectedRoute = routeResults[routeId];
        if (selectedRoute && selectedRoute.rawData) {
            const routeService = routeServicesRef.current[selectedTransport];
            if (routeService) {
                // 这里可以添加突出显示选中路线的逻辑
                console.log('选中路线:', selectedRoute);
            }
        }
    };

    // 显示详细路线
    const handleShowDetails = (route, e) => {
        e.stopPropagation(); // 阻止事件冒泡
        setSelectedRouteDetail(route);
        setDetailModalVisible(true);
    };


    const renderSuggestionItem = option => (
        <div style={{padding: '8px 0'}}>
            <div style={{fontWeight: 500, marginBottom: 2}}>{option.label}</div>
            <div style={{fontSize: 12, color: '#8c8c8c'}}>{option.address}</div>
        </div>
    );

    // 渲染详细路线弹窗
    const renderDetailModal = () => {
        if (!selectedRouteDetail) {
            return null;
        }

        return (
            <Modal
                title={
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <FullscreenOutlined style={{marginRight: 8, color: '#1890ff'}} />
                            <span>详细路线 - {selectedRouteDetail.type}</span>
                        </div>
                        <div style={{fontSize: 14, fontWeight: 'normal', color: '#1890ff', marginRight: 20}}>
                            {selectedRouteDetail.time}
                        </div>
                    </div>
                }
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        关闭
                    </Button>,
                    <Button
                        key="select"
                        type="primary"
                        onClick={() => {
                            handleRouteSelect(selectedRouteDetail.id);
                            setDetailModalVisible(false);
                            message.success('已选择该路线');
                        }}
                    >
                        选择此路线
                    </Button>,
                ]}
                width={800}
                style={{top: 20}}
                styles={{body: {maxHeight: '70vh', overflow: 'auto'}}}
            >
                {/* 路线基本信息 */}
                <div style={{
                    background: '#f8f9fa',
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 20,
                }}
                >
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}
                    >
                        <Text strong style={{fontSize: 16}}>{selectedRouteDetail.startPoint || startPoint}</Text>
                        <div style={{
                            background: '#1890ff',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontSize: 12,
                        }}
                        >
                            {transportModes.find(m => m.key === selectedTransport)?.name}
                        </div>
                        <Text strong style={{fontSize: 16}}>{selectedRouteDetail.endPoint || endPoint}</Text>
                    </div>

                    <div style={{display: 'flex', justifyContent: 'space-around', textAlign: 'center'}}>
                        <div>
                            <div style={{color: '#1890ff', fontSize: 18, fontWeight: 'bold'}}>
                                {selectedRouteDetail.time}
                            </div>
                            <div style={{color: '#8c8c8c', fontSize: 12}}>预计时间</div>
                        </div>
                        <Divider type="vertical" style={{height: 40}} />
                        <div>
                            <div style={{color: '#52c41a', fontSize: 18, fontWeight: 'bold'}}>
                                {selectedRouteDetail.distance}
                            </div>
                            <div style={{color: '#8c8c8c', fontSize: 12}}>总距离</div>
                        </div>
                        <Divider type="vertical" style={{height: 40}} />
                        <div>
                            <div style={{color: '#fa8c16', fontSize: 18, fontWeight: 'bold'}}>
                                {selectedRouteDetail.cost}
                            </div>
                            <div style={{color: '#8c8c8c', fontSize: 12}}>预计费用</div>
                        </div>
                    </div>
                </div>

                {/* 详细步骤 */}
                <div>
                    <Title level={4} style={{marginBottom: 16}}>
                        导航步骤 ({selectedRouteDetail.steps.length}步)
                    </Title>

                    <div style={{position: 'relative'}}>
                        {/* 时间线 */}
                        <div style={{
                            position: 'absolute',
                            left: 15,
                            top: 0,
                            bottom: 0,
                            width: 2,
                            background: '#e8e8e8',
                        }}
                        />

                        {selectedRouteDetail.steps.map((step, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    marginBottom: 16,
                                    position: 'relative',
                                }}
                            >
                                {/* 步骤圆点 */}
                                <div style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: '50%',
                                    background: index === 0 ? '#52c41a'
                                        : index === selectedRouteDetail.steps.length - 1 ? '#ff4d4f' : '#1890ff',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    marginRight: 16,
                                    flexShrink: 0,
                                    zIndex: 1,
                                }}
                                >
                                    {index === 0 ? '起'
                                        : index === selectedRouteDetail.steps.length - 1 ? '终'
                                            : index + 1}
                                </div>

                                {/* 步骤内容 */}
                                <div style={{
                                    flex: 1,
                                    background: 'white',
                                    border: '1px solid #e8e8e8',
                                    borderRadius: 8,
                                    padding: 12,
                                    marginTop: 2,
                                }}
                                >
                                    <div
                                        style={{
                                            fontSize: 14,
                                            lineHeight: 1.6,
                                            color: '#262626',
                                        }}
                                        dangerouslySetInnerHTML={{__html: step}}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        );
    };

    return (
        <div style={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
            <style>
                {`
                    .route-step b {
                        color: #1890ff;
                        font-weight: 600;
                    }
                    .route-step-detail b {
                        color: #1890ff;
                        font-weight: 600;
                        background: #f0f8ff;
                        padding: 2px 4px;
                        border-radius: 3px;
                    }
                `}
            </style>

            {/* 主体内容 */}
            <div style={{flex: 1, display: 'flex', minHeight: 0}}>
                {/* 左侧面板 */}
                <Card
                    style={{
                        width: 380,
                        borderRadius: 0,
                        borderRight: '1px solid #d9d9d9',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    }}
                    styles={{body: {padding: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0}}}
                >
                    {/* 路线输入区域 */}
                    <div style={{padding: 20, borderBottom: '1px solid #f0f0f0', flexShrink: 0}}>
                        {/* 出行方式选择 */}
                        <div style={{marginBottom: 16}}>
                            <Text strong style={{marginBottom: 8, display: 'block'}}>出行方式</Text>
                            <Space wrap>
                                {transportModes.map(mode => (
                                    <Button
                                        key={mode.key}
                                        type={selectedTransport === mode.key ? 'primary' : 'default'}
                                        size="small"
                                        onClick={() => handleTransportChange(mode.key)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '4px 12px',
                                        }}
                                    >
                                        {/* <span style={{marginRight: 4}}></span> */}
                                        {mode.name}
                                    </Button>
                                ))}
                            </Space>
                        </div>

                        {/* 起终点输入 */}
                        <div style={{position: 'relative'}}>
                            <div style={{marginBottom: 12}}>
                                <AutoComplete
                                    style={{width: '100%'}}
                                    placeholder="请输入起点"
                                    value={startPoint}
                                    onChange={setStartPoint}
                                    options={mockSuggestions}
                                    optionRender={renderSuggestionItem}
                                >
                                    <Input
                                        prefix={<span style={{color: '#52c41a'}}>🟢</span>}
                                        style={{borderColor: '#52c41a'}}
                                    />
                                </AutoComplete>
                            </div>

                            <div style={{marginBottom: 12}}>
                                <AutoComplete
                                    style={{width: '100%'}}
                                    placeholder="请输入终点"
                                    value={endPoint}
                                    onChange={setEndPoint}
                                    options={mockSuggestions}
                                    optionRender={renderSuggestionItem}
                                >
                                    <Input
                                        prefix={<span style={{color: '#ff4d4f'}}>🔴</span>}
                                        style={{borderColor: '#ff4d4f'}}
                                    />
                                </AutoComplete>
                            </div>

                            {/* 交换按钮 */}
                            <Button
                                icon={<SwapOutlined />}
                                size="small"
                                onClick={handleSwapPoints}
                                style={{
                                    position: 'absolute',
                                    right: -45,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    borderRadius: '50%',
                                    width: 32,
                                    height: 32,
                                    zIndex: 10,
                                }}
                            />
                        </div>

                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={handleSearch}
                            loading={loading}
                            block
                            style={{marginTop: 12}}
                        >
                            搜索路线
                        </Button>
                    </div>

                    {/* 路线结果区域 */}
                    <div style={{flex: 1, overflow: 'auto', padding: 20}}>
                        {routeResults.length > 0 ? (
                            <>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}
                                >
                                    <Title level={4} style={{margin: 0}}>路线方案</Title>
                                    <Text type="secondary" style={{fontSize: 12}}>
                                        共找到 {routeResults.length} 条路线
                                    </Text>
                                </div>

                                {routeResults.map(route => (
                                    <Card
                                        key={route.id}
                                        size="small"
                                        hoverable
                                        onClick={() => handleRouteSelect(route.id)}
                                        style={{
                                            marginBottom: 12,
                                            border: activeRoute === route.id
                                                ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                            backgroundColor: activeRoute === route.id ? '#f6ffed' : '#fff',
                                            cursor: 'pointer',
                                        }}
                                        actions={[
                                            <Button
                                                key="detail"
                                                type="link"
                                                size="small"
                                                icon={<EyeOutlined />}
                                                onClick={e => handleShowDetails(route, e)}
                                            >
                                                查看详情
                                            </Button>,
                                        ]}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}
                                        >
                                            <Text strong style={{color: '#262626'}}>{route.type}</Text>
                                            <Text strong style={{color: '#1890ff'}}>{route.time}</Text>
                                        </div>

                                        <Space size="large" style={{fontSize: 12, color: '#8c8c8c'}}>
                                            <span>📏 {route.distance}</span>
                                            <span>
                                                <DollarOutlined style={{marginRight: 4}} />
                                                {route.cost}
                                            </span>
                                        </Space>

                                        {activeRoute === route.id && route.steps.length > 0 && (
                                            <div style={{
                                                marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0'}}
                                            >
                                                <div className="route-step">
                                                    {route.steps.slice(0, 4).map((step, index) => (
                                                        <div
                                                            key={index}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                                marginBottom: 6,
                                                                fontSize: 12,
                                                            }}
                                                        >
                                                            <span style={{
                                                                marginRight: 8, color: '#8c8c8c', marginTop: 2}}
                                                            >
                                                                {index + 1}.
                                                            </span>
                                                            <div
                                                                style={{
                                                                    color: '#595959',
                                                                    lineHeight: 1.4,
                                                                    flex: 1,
                                                                }}
                                                                dangerouslySetInnerHTML={{__html: step}}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                {route.steps.length > 4 && (
                                                    <Text type="secondary" style={{fontSize: 12}}>
                                                        ... 还有 {route.steps.length - 4} 个步骤
                                                    </Text>
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </>
                        ) : (
                            <div style={{textAlign: 'center', color: '#8c8c8c', marginTop: 60}}>
                                <SearchOutlined style={{fontSize: 48, marginBottom: 16}} />
                                <div>暂无路线结果</div>
                                <div style={{fontSize: 12, marginTop: 8}}>
                                    请输入起终点并点击搜索
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* 右侧地图区域 */}
                <div
                    ref={mapContainerRef}
                    id="map-container"
                    style={{
                        flex: 1,
                        position: 'relative',
                        background: '#f5f5f5',
                        overflow: 'hidden',
                    }}
                >
                </div>
            </div>

            {/* 详细路线弹窗 */}
            {renderDetailModal()}
        </div>
    );
}

export default withSourceCode(RoutePlanning);
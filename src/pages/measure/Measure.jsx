/* eslint-disable @babel/new-cap */
import * as mapvthree from '@baidumap/mapv-three';
import initEngine from '../../utils/initEngine';
import {useEffect, useRef, useState} from 'react';
import {withSourceCode} from '../../utils/withSourceCode';
import {
    Card,
    Typography,
    Space,
    Button,
    Radio,
    ColorPicker,
    Slider,
    Divider,
    message,
    Modal,
    Switch,
} from 'antd';
import {
    LineOutlined,
    BorderOutlined,
    EnvironmentOutlined,
    DeleteOutlined,
    StopOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import './Measure.less';

const {Title, Text} = Typography;

// 中心点坐标
const center = [116.404, 39.915];

function Measure() {
    const engineRef = useRef(null);
    const measureRef = useRef(null);
    const continuousMeasuringRef = useRef(false);

    // 测量模式
    const [measureType, setMeasureType] = useState(mapvthree.MeasureType.DISTANCE);
    const [isMeasuring, setIsMeasuring] = useState(false);
    const [continuousMeasuring, setContinuousMeasuring] = useState(false);

    // 样式设置
    const [strokeColor, setStrokeColor] = useState('#ff4d4f');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [fillColor, setFillColor] = useState('#52c41a');
    const [fillOpacity, setFillOpacity] = useState(0.3);

    // 设置测量事件监听
    const setupMeasureListeners = measure => {
        measure.addEventListener('created', () => {
            // 使用ref来获取最新的continuousMeasuring值，避免闭包问题
            if (!continuousMeasuringRef.current) {
                setIsMeasuring(false);
            }
        });
    };

    useEffect(() => {
        if (!engineRef.current) {
            // 初始化引擎
            const {engine} = initEngine({
                center,
                heading: 0,
                pitch: 0,
                zoom: 14,
                range: 5000,
                enableAnimationLoop: true,
                skyType: 'dynamic',
                projection: 'ecef',
            });

            engineRef.current = engine;

            engine.add(new mapvthree.MapView({
                terrainProvider: undefined,
                imageryProvider: new mapvthree.BingImageryTileProvider(),
            }));

            // 创建测量工具
            const measure = engine.add(new mapvthree.Measure({
                type: mapvthree.MeasureType.DISTANCE,
                renderOptions: {
                    depthTest: false,
                },
            }));

            measureRef.current = measure;

            // 监听测量事件
            setupMeasureListeners(measure);
        }

        return () => {
            if (engineRef.current) {
                engineRef.current.destroy();
                engineRef.current = null;
                measureRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 开始测量
    const handleStartMeasure = () => {
        if (!measureRef.current) {
            return;
        }

        setIsMeasuring(true);
        continuousMeasuringRef.current = continuousMeasuring;

        const style = {
            depthTest: false,
        };

        // 根据测量类型设置样式
        if (measureType === mapvthree.MeasureType.DISTANCE) {
            style.strokeColor = strokeColor;
            style.strokeWidth = strokeWidth;
            message.info('开始距离测量');
        }
        else if (measureType === mapvthree.MeasureType.AREA) {
            style.fillColor = fillColor;
            style.fillOpacity = fillOpacity;
            style.strokeColor = strokeColor;
            style.strokeWidth = strokeWidth;
            message.info('开始面积测量');
        }
        else if (measureType === mapvthree.MeasureType.POINT) {
            message.info('开始坐标测量');
        }

        // 设置测量类型
        measureRef.current.setType(measureType);

        // 设置样式
        measureRef.current.setStyle(style);

        // 开始测量
        measureRef.current.start({
            continuous: continuousMeasuring,
        });
    };

    // 停止测量
    const handleStopMeasure = () => {
        if (!measureRef.current) {
            return;
        }

        measureRef.current.stop();
        continuousMeasuringRef.current = false;
        setIsMeasuring(false);
        message.info('已停止测量');
    };

    // 清除所有测量结果
    const handleClearAll = () => {
        if (!measureRef.current) {
            return;
        }

        Modal.confirm({
            title: '确认清除',
            content: '确定要清除所有测量结果吗？',
            onOk: () => {
                measureRef.current.clear();
                message.success('已清除所有测量结果');
            },
        });
    };

    // 在样式状态变化时更新绘制样式
    useEffect(() => {
        if (isMeasuring && measureRef.current) {
            const style = {depthTest: false};

            if (measureType === mapvthree.MeasureType.DISTANCE) {
                style.strokeColor = strokeColor;
                style.strokeWidth = strokeWidth;
            }
            else if (measureType === mapvthree.MeasureType.AREA) {
                style.fillColor = fillColor;
                style.fillOpacity = fillOpacity;
                style.strokeColor = strokeColor;
                style.strokeWidth = strokeWidth;
            }

            measureRef.current.setStyle(style);
        }
    }, [strokeColor, strokeWidth, fillColor, fillOpacity, isMeasuring, measureType]);

    return (
        <div style={{height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
            {/* 顶部控制栏 */}
            <Card
                style={{borderRadius: 0, borderBottom: '1px solid #d9d9d9'}}
                styles={{body: {padding: '16px 24px'}}}
            >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Title level={3} style={{margin: 0, display: 'flex', alignItems: 'center'}}>
                        <LineOutlined style={{marginRight: 8, color: '#1890ff'}} />
                        测量工具
                    </Title>
                </div>
            </Card>

            {/* 主体内容 */}
            <div style={{flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden'}}>
                {/* 左侧控制面板 */}
                <Card
                    className="measure-panel"
                    style={{
                        width: 350,
                        height: '100%',
                        overflowY: 'auto',
                        borderRadius: 0,
                        borderRight: '1px solid #d9d9d9',
                        flexShrink: 0,
                    }}
                    styles={{
                        body: {
                            padding: 16,
                        },
                    }}
                >
                    {/* 测量模式选择 */}
                    <div className="panel-section">
                        <Text strong>测量模式</Text>
                        <Radio.Group
                            value={measureType}
                            onChange={e => setMeasureType(e.target.value)}
                            style={{marginTop: 8, width: '100%'}}
                            disabled={isMeasuring}
                        >
                            <Space direction="vertical" style={{width: '100%'}}>
                                <Radio value={mapvthree.MeasureType.DISTANCE}>
                                    <LineOutlined /> 距离测量
                                </Radio>
                                <Radio value={mapvthree.MeasureType.AREA}>
                                    <BorderOutlined /> 面积测量
                                </Radio>
                                <Radio value={mapvthree.MeasureType.POINT}>
                                    <EnvironmentOutlined /> 坐标测量
                                </Radio>
                            </Space>
                        </Radio.Group>
                    </div>

                    <Divider />

                    {/* 测量控制 */}
                    <div className="panel-section">
                        <Text strong>测量控制</Text>
                        <Space direction="vertical" style={{width: '100%', marginTop: 8}}>
                            <Button
                                type={isMeasuring ? (continuousMeasuring ? 'primary' : 'default') : 'primary'}
                                danger={isMeasuring && continuousMeasuring}
                                icon={isMeasuring ? <StopOutlined /> : <PlusOutlined />}
                                onClick={isMeasuring ? handleStopMeasure : handleStartMeasure}
                                block
                            >
                                {isMeasuring
                                    ? (continuousMeasuring ? '停止连续测量' : '停止测量')
                                    : '开始测量'}
                            </Button>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <Text>连续测量</Text>
                                <Switch
                                    checked={continuousMeasuring}
                                    onChange={setContinuousMeasuring}
                                    disabled={isMeasuring}
                                />
                            </div>
                        </Space>
                    </div>

                    <Divider />

                    {/* 样式设置 */}
                    <div className="panel-section">
                        <Text strong>样式设置</Text>

                        {/* 线条颜色 */}
                        {(measureType === mapvthree.MeasureType.DISTANCE
                        || measureType === mapvthree.MeasureType.AREA) && (
                            <div style={{marginTop: 12}}>
                                <Text>线条颜色</Text>
                                <div style={{display: 'flex', gap: 8, marginTop: 4}}>
                                    <ColorPicker
                                        value={strokeColor}
                                        onChange={color => setStrokeColor(color.toHexString())}
                                    />
                                    <Text code>{strokeColor}</Text>
                                </div>
                            </div>
                        )}

                        {/* 线条宽度 */}
                        {(measureType === mapvthree.MeasureType.DISTANCE
                        || measureType === mapvthree.MeasureType.AREA) && (
                            <div style={{marginTop: 12}}>
                                <Text>线条宽度: {strokeWidth}px</Text>
                                <Slider
                                    min={1}
                                    max={10}
                                    value={strokeWidth}
                                    onChange={setStrokeWidth}
                                />
                            </div>
                        )}

                        {/* 填充颜色 */}
                        {measureType === mapvthree.MeasureType.AREA && (
                            <div style={{marginTop: 12}}>
                                <Text>填充颜色</Text>
                                <div style={{display: 'flex', gap: 8, marginTop: 4}}>
                                    <ColorPicker
                                        value={fillColor}
                                        onChange={color => setFillColor(color.toHexString())}
                                    />
                                    <Text code>{fillColor}</Text>
                                </div>
                            </div>
                        )}

                        {/* 填充透明度 */}
                        {measureType === mapvthree.MeasureType.AREA && (
                            <div style={{marginTop: 12}}>
                                <Text>填充透明度: {fillOpacity.toFixed(2)}</Text>
                                <Slider
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    value={fillOpacity}
                                    onChange={setFillOpacity}
                                />
                            </div>
                        )}
                    </div>

                    <Divider />

                    {/* 清除操作 */}
                    <div className="panel-section">
                        <Text strong>清除操作</Text>
                        <Space direction="vertical" style={{width: '100%', marginTop: 8}}>
                            <Button
                                icon={<DeleteOutlined />}
                                onClick={handleClearAll}
                                danger
                                block
                            >
                                清除所有测量
                            </Button>
                        </Space>
                    </div>
                </Card>

                {/* 地图容器 */}
                <div
                    id="showcase"
                    className="map-container"
                    style={{
                        flex: 1,
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                    }}
                />
            </div>
        </div>
    );
}

export default withSourceCode(Measure);

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
    Select,
    Slider,
    Switch,
    ColorPicker,
    InputNumber,
    Divider,
    message,
    Modal,
    Tag,
    Dropdown,
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    ExportOutlined,
    ImportOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    PlusOutlined,
    StopOutlined,
    DownOutlined,
} from '@ant-design/icons';
import './Editor.less';

const {Title, Text} = Typography;
const {Option} = Select;

// 中心点坐标
const center = [116.404, 39.915];

function Editor() {
    const engineRef = useRef(null);
    const editorRef = useRef(null);
    const continuousDrawingRef = useRef(false);

    // 绘制设置
    const [drawType, setDrawType] = useState(mapvthree.Editor.DrawerType.POLYGON);
    const [isDrawing, setIsDrawing] = useState(false);
    const [continuousDrawing, setContinuousDrawing] = useState(false);
    const [enableMidpoint, setEnableMidpoint] = useState(true);

    // 样式设置
    const [fillColor, setFillColor] = useState('#3388ff');
    const [fillOpacity, setFillOpacity] = useState(0.3);
    const [strokeColor, setStrokeColor] = useState('#3388ff');
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [strokeOpacity, setStrokeOpacity] = useState(1);
    const [pointRadius, setPointRadius] = useState(8);
    const [circleRadius, setCircleRadius] = useState(100);

    // 编辑模式
    const [isEditing, setIsEditing] = useState(false);

    // 要素统计
    const [featureStats, setFeatureStats] = useState({
        polygon: 0,
        line: 0,
        point: 0,
        circle: 0,
        rectangle: 0,
    });

    // 图层可见性状态
    const [layerVisibility, setLayerVisibility] = useState({
        polygon: true,
        line: true,
        point: true,
        circle: true,
        rectangle: true,
    });

    // 绘制类型选项
    const drawTypeOptions = [
        {label: '多边形', value: mapvthree.Editor.DrawerType.POLYGON, icon: '▢'},
        {label: '线', value: mapvthree.Editor.DrawerType.LINE, icon: '⟋'},
        {label: '点', value: mapvthree.Editor.DrawerType.POINT, icon: '●'},
        {label: '圆', value: mapvthree.Editor.DrawerType.CIRCLE, icon: '○'},
        {label: '矩形', value: mapvthree.Editor.DrawerType.RECTANGLE, icon: '▭'},
    ];

    // 更新要素统计
    const updateFeatureStats = () => {
        if (!editorRef.current) {
            return;
        }

        const stats = {
            polygon: 0,
            line: 0,
            point: 0,
            circle: 0,
            rectangle: 0,
        };

        const polygonData = editorRef.current.exportData(mapvthree.Editor.DrawerType.POLYGON);
        const lineData = editorRef.current.exportData(mapvthree.Editor.DrawerType.LINE);
        const pointData = editorRef.current.exportData(mapvthree.Editor.DrawerType.POINT);
        const circleData = editorRef.current.exportData(mapvthree.Editor.DrawerType.CIRCLE);
        const rectangleData = editorRef.current.exportData(mapvthree.Editor.DrawerType.RECTANGLE);

        stats.polygon = polygonData?.features?.length || 0;
        stats.line = lineData?.features?.length || 0;
        stats.point = pointData?.features?.length || 0;
        stats.circle = circleData?.features?.length || 0;
        stats.rectangle = rectangleData?.features?.length || 0;

        setFeatureStats(stats);
    };

    // 设置默认样式
    const setDefaultStyles = editor => {
        // 多边形默认样式
        editor.setStyle(
            {
                fillColor: '#3388ff',
                fillOpacity: 0.3,
                strokeColor: '#3388ff',
                strokeWidth: 3,
                strokeOpacity: 1,
            },
            mapvthree.Editor.DrawerType.POLYGON
        );

        // 线默认样式
        editor.setStyle(
            {
                strokeColor: '#ff6b6b',
                strokeWidth: 3,
                strokeOpacity: 1,
            },
            mapvthree.Editor.DrawerType.LINE
        );

        // 点默认样式
        editor.setStyle(
            {
                fillColor: '#51cf66',
                pointRadius: 8,
                fillOpacity: 1,
            },
            mapvthree.Editor.DrawerType.POINT
        );

        // 圆默认样式
        editor.setStyle(
            {
                fillColor: '#ffd43b',
                fillOpacity: 0.3,
                strokeColor: '#ffd43b',
                strokeWidth: 2,
                radius: 100,
            },
            mapvthree.Editor.DrawerType.CIRCLE
        );

        // 矩形默认样式
        editor.setStyle(
            {
                fillColor: '#ae3ec9',
                fillOpacity: 0.3,
                strokeColor: '#ae3ec9',
                strokeWidth: 3,
                strokeOpacity: 1,
            },
            mapvthree.Editor.DrawerType.RECTANGLE
        );
    };

    // 设置事件监听
    const setupEventListeners = editor => {
        editor.addEventListener('created', () => {
            updateFeatureStats();
            // 使用ref来获取最新的continuousDrawing值，避免闭包问题
            if (!continuousDrawingRef.current) {
                setIsDrawing(false);
            }
        });

        editor.addEventListener('delete', () => {
            updateFeatureStats();
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

            // 创建编辑器
            const editor = engine.add(
                new mapvthree.Editor({
                    type: mapvthree.Editor.DrawerType.POLYGON,
                    enableMidpointHandles: true,
                    continuousDrawing: false,
                    renderOptions: {
                        depthTest: false,
                    },
                })
            );

            editorRef.current = editor;

            // 设置默认样式
            setDefaultStyles(editor);

            // 监听事件
            setupEventListeners(editor);
        }

        return () => {
            if (engineRef.current) {
                engineRef.current.destroy();
                engineRef.current = null;
                editorRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 开始绘制
    const handleStartDraw = () => {
        if (!editorRef.current) {
            return;
        }

        // 如果正在编辑，先退出编辑模式
        if (isEditing) {
            editorRef.current.disableEdit();
            setIsEditing(false);
        }

        editorRef.current.type = drawType;

        const style = {
            fillColor,
            fillOpacity,
            strokeColor,
            strokeWidth,
            strokeOpacity,
        };

        // 为不同类型添加特定样式
        if (drawType === mapvthree.Editor.DrawerType.POINT) {
            style.pointRadius = pointRadius;
        }
        else if (drawType === mapvthree.Editor.DrawerType.CIRCLE) {
            style.radius = circleRadius;
        }

        // 更新ref以确保事件监听器能获取到最新值
        continuousDrawingRef.current = continuousDrawing;

        // 设置样式
        editorRef.current.setStyle(style);

        // 开始绘制
        editorRef.current.start({
            continuous: continuousDrawing,
        });

        setIsDrawing(true);
        message.info('开始绘制');
    };

    // 停止绘制
    const handleStopDraw = () => {
        if (!editorRef.current) {
            return;
        }
        editorRef.current.stop();
        continuousDrawingRef.current = false;
        setIsDrawing(false);
        message.info('停止绘制');
    };

    // 切换编辑模式
    const handleToggleEdit = () => {
        if (!editorRef.current) {
            return;
        }

        if (isEditing) {
            editorRef.current.disableEdit();
            setIsEditing(false);
            message.info('退出编辑模式');
        }
        else {
            // 停止绘制
            if (isDrawing) {
                editorRef.current.stop();
                setIsDrawing(false);
            }
            editorRef.current.enableEdit();
            setIsEditing(true);
            message.info('进入编辑模式，点击要素进行编辑');
        }
    };

    // 切换中点标记
    const handleToggleMidpoint = checked => {
        setEnableMidpoint(checked);
        if (editorRef.current) {
            // 重新创建编辑器以更新中点标记设置
            const engine = engineRef.current;
            const oldEditor = editorRef.current;

            // 导出现有数据
            const allData = oldEditor.exportData();

            // 移除旧编辑器
            engine.remove(oldEditor);

            // 创建新编辑器
            const newEditor = engine.add(
                new mapvthree.Editor({
                    type: drawType,
                    enableMidpointHandles: checked,
                    continuousDrawing,
                    renderOptions: {
                        depthTest: false,
                    },
                })
            );
            editorRef.current = newEditor;

            // 恢复样式和数据
            setDefaultStyles(newEditor);
            if (allData && allData.features && allData.features.length > 0) {
                newEditor.importData(allData);
            }

            // 重新设置事件监听
            setupEventListeners(newEditor);

            updateFeatureStats();

            message.success(`中点标记已${checked ? '启用' : '禁用'}`);
        }
    };

    // 获取类型名称
    const getTypeName = type => {
        const typeMap = {
            [mapvthree.Editor.DrawerType.POLYGON]: '多边形',
            [mapvthree.Editor.DrawerType.LINE]: '线',
            [mapvthree.Editor.DrawerType.POINT]: '点',
            [mapvthree.Editor.DrawerType.CIRCLE]: '圆',
            [mapvthree.Editor.DrawerType.RECTANGLE]: '矩形',
        };
        return typeMap[type] || '要素';
    };

    // 删除指定类型要素
    const handleDelete = type => {
        if (!editorRef.current) {
            return;
        }

        Modal.confirm({
            title: '确认删除',
            content: `确定要删除所有${getTypeName(type)}吗？`,
            onOk: () => {
                const count = editorRef.current.delete(type);
                message.success(`已删除 ${count} 个要素`);
                updateFeatureStats();
            },
        });
    };

    // 切换指定类型要素的可见性
    const handleToggleVisibility = type => {
        if (!editorRef.current) {
            return;
        }

        const typeKey = type.toLowerCase();
        const isVisible = layerVisibility[typeKey];

        if (isVisible) {
            // 当前可见，隐藏它
            const count = editorRef.current.hide(type);
            setLayerVisibility(prev => ({...prev, [typeKey]: false}));
            message.success(`已隐藏 ${count} 个${getTypeName(type)}`);
        }
        else {
            // 当前隐藏，显示它
            const count = editorRef.current.show(type);
            setLayerVisibility(prev => ({...prev, [typeKey]: true}));
            message.success(`已显示 ${count} 个${getTypeName(type)}`);
        }
    };

    // 导出数据
    const handleExport = (type = null) => {
        if (!editorRef.current) {
            return;
        }

        let data;
        let filename;

        if (type) {
            // 导出指定类型的数据
            data = editorRef.current.exportData(type);
            const typeName = getTypeName(type);
            filename = `editor-${typeName}-${Date.now()}.json`;

            if (!data || !data.features || data.features.length === 0) {
                message.warning(`没有${typeName}数据可导出`);
                return;
            }

            message.success(`已导出 ${data.features.length} 个${typeName}`);
        }
        else {
            // 导出全部数据
            data = editorRef.current.exportData();
            filename = `editor-all-${Date.now()}.json`;

            if (!data || !data.features || data.features.length === 0) {
                message.warning('没有数据可导出');
                return;
            }

            message.success(`已导出 ${data.features.length} 个要素`);
        }

        const dataStr = JSON.stringify(data, null, 2);

        // 创建下载链接
        const blob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    // 导入数据
    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (editorRef.current) {
                        editorRef.current.importData(data, {clear: true});
                        updateFeatureStats();
                        message.success('数据已导入');
                    }
                }
                catch (error) {
                    message.error('数据格式错误');
                    console.error(error);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    return (
        <div style={{height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
            {/* 顶部控制栏 */}
            <Card
                style={{borderRadius: 0, borderBottom: '1px solid #d9d9d9'}}
                styles={{body: {padding: '16px 24px'}}}
            >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Title level={3} style={{margin: 0, display: 'flex', alignItems: 'center'}}>
                        <EditOutlined style={{marginRight: 8, color: '#1890ff'}} />
                        绘制编辑工具
                    </Title>
                </div>
            </Card>

            {/* 主体内容 */}
            <div style={{flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden'}}>
                {/* 左侧控制面板 */}
                <Card
                    className="editor-panel"
                    title={<Title level={4}>控制面板</Title>}
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
                    {/* 绘制类型选择 */}
                    <div className="panel-section">
                        <Text strong>绘制类型</Text>
                        <Select
                            value={drawType}
                            onChange={setDrawType}
                            style={{width: '100%', marginTop: 8}}
                            disabled={isDrawing || isEditing}
                        >
                            {drawTypeOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                    <span style={{marginRight: 8}}>{option.icon}</span>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/* 绘制控制 */}
                    <div className="panel-section">
                        <Text strong>绘制控制</Text>
                        <Space direction="vertical" style={{width: '100%', marginTop: 8}}>
                            <Button
                                type={isDrawing ? (continuousDrawing ? 'primary' : 'default') : 'primary'}
                                danger={isDrawing && continuousDrawing}
                                icon={isDrawing ? <StopOutlined /> : <PlusOutlined />}
                                onClick={isDrawing ? handleStopDraw : handleStartDraw}
                                block
                            >
                                {isDrawing
                                    ? (continuousDrawing ? '停止连续绘制' : '停止绘制')
                                    : '开始绘制'}
                            </Button>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <Text>连续绘制</Text>
                                <Switch
                                    checked={continuousDrawing}
                                    onChange={setContinuousDrawing}
                                    disabled={isDrawing}
                                />
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <Text>中点标记</Text>
                                <Switch checked={enableMidpoint} onChange={handleToggleMidpoint} />
                            </div>
                        </Space>
                    </div>

                    <Divider />

                    {/* 样式设置 */}
                    <div className="panel-section">
                        <Text strong>样式设置</Text>

                        {/* 填充颜色 */}
                        {(drawType === mapvthree.Editor.DrawerType.POLYGON
                        || drawType === mapvthree.Editor.DrawerType.CIRCLE
                        || drawType === mapvthree.Editor.DrawerType.RECTANGLE
                        || drawType === mapvthree.Editor.DrawerType.POINT) && (
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
                        {(drawType === mapvthree.Editor.DrawerType.POLYGON
                        || drawType === mapvthree.Editor.DrawerType.CIRCLE
                        || drawType === mapvthree.Editor.DrawerType.RECTANGLE) && (
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

                        {/* 描边颜色 */}
                        {(drawType === mapvthree.Editor.DrawerType.POLYGON
                        || drawType === mapvthree.Editor.DrawerType.LINE
                        || drawType === mapvthree.Editor.DrawerType.CIRCLE
                        || drawType === mapvthree.Editor.DrawerType.RECTANGLE) && (
                            <div style={{marginTop: 12}}>
                                <Text>描边颜色</Text>
                                <div style={{display: 'flex', gap: 8, marginTop: 4}}>
                                    <ColorPicker
                                        value={strokeColor}
                                        onChange={color => setStrokeColor(color.toHexString())}
                                    />
                                    <Text code>{strokeColor}</Text>
                                </div>
                            </div>
                        )}

                        {/* 描边宽度 */}
                        {(drawType === mapvthree.Editor.DrawerType.POLYGON
                        || drawType === mapvthree.Editor.DrawerType.LINE
                        || drawType === mapvthree.Editor.DrawerType.CIRCLE
                        || drawType === mapvthree.Editor.DrawerType.RECTANGLE) && (
                            <div style={{marginTop: 12}}>
                                <Text>描边宽度: {strokeWidth}px</Text>
                                <Slider
                                    min={1}
                                    max={10}
                                    value={strokeWidth}
                                    onChange={setStrokeWidth}
                                />
                            </div>
                        )}

                        {/* 点半径 */}
                        {drawType === mapvthree.Editor.DrawerType.POINT && (
                            <div style={{marginTop: 12}}>
                                <Text>点半径</Text>
                                <InputNumber
                                    min={1}
                                    max={50}
                                    value={pointRadius}
                                    onChange={setPointRadius}
                                    style={{width: '100%', marginTop: 4}}
                                />
                            </div>
                        )}

                        {/* 圆半径 */}
                        {drawType === mapvthree.Editor.DrawerType.CIRCLE && (
                            <div style={{marginTop: 12}}>
                                <Text>圆半径 (米)</Text>
                                <InputNumber
                                    min={10}
                                    max={5000}
                                    value={circleRadius}
                                    onChange={setCircleRadius}
                                    style={{width: '100%', marginTop: 4}}
                                />
                            </div>
                        )}
                    </div>

                    <Divider />

                    {/* 编辑模式 */}
                    <div className="panel-section">
                        <Text strong>编辑模式</Text>
                        <Button
                            type={isEditing ? 'primary' : 'default'}
                            icon={<EditOutlined />}
                            onClick={handleToggleEdit}
                            block
                            style={{marginTop: 8}}
                        >
                            {isEditing ? '退出编辑' : '进入编辑'}
                        </Button>
                    </div>

                    <Divider />

                    {/* 图层管理 */}
                    <div className="panel-section">
                        <Text strong>图层管理</Text>
                        <div style={{marginTop: 8}}>
                            {drawTypeOptions.map(option => {
                                const count = featureStats[option.value.toLowerCase()];
                                const isVisible = layerVisibility[option.value.toLowerCase()];
                                return (
                                    <div
                                        key={option.value}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px 0',
                                            borderBottom: '1px solid #f0f0f0',
                                        }}
                                    >
                                        <Space>
                                            <span>{option.icon}</span>
                                            <Text>{option.label}</Text>
                                            <Tag>{count}</Tag>
                                        </Space>
                                        <Space>
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={
                                                    isVisible ? (
                                                        <EyeOutlined />
                                                    ) : (
                                                        <EyeInvisibleOutlined />
                                                    )
                                                }
                                                onClick={() => handleToggleVisibility(option.value)}
                                                disabled={count === 0}
                                            />
                                            <Button
                                                type="text"
                                                size="small"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDelete(option.value)}
                                                disabled={count === 0}
                                            />
                                        </Space>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <Divider />

                    {/* 数据操作 */}
                    <div className="panel-section">
                        <Text strong>数据操作</Text>
                        <Space direction="vertical" style={{width: '100%', marginTop: 8}}>
                            <Button icon={<ImportOutlined />} onClick={handleImport} block>
                                导入数据
                            </Button>
                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                            key: 'all',
                                            label: '导出全部数据',
                                            icon: <ExportOutlined />,
                                            onClick: () => handleExport(),
                                        },
                                        {type: 'divider'},
                                        {
                                            key: 'polygon',
                                            label: '导出多边形',
                                            icon: <span>▢</span>,
                                            onClick: () =>
                                                handleExport(mapvthree.Editor.DrawerType.POLYGON),
                                        },
                                        {
                                            key: 'line',
                                            label: '导出线',
                                            icon: <span>⟋</span>,
                                            onClick: () => handleExport(mapvthree.Editor.DrawerType.LINE),
                                        },
                                        {
                                            key: 'point',
                                            label: '导出点',
                                            icon: <span>●</span>,
                                            onClick: () =>
                                                handleExport(mapvthree.Editor.DrawerType.POINT),
                                        },
                                        {
                                            key: 'circle',
                                            label: '导出圆',
                                            icon: <span>○</span>,
                                            onClick: () =>
                                                handleExport(mapvthree.Editor.DrawerType.CIRCLE),
                                        },
                                        {
                                            key: 'rectangle',
                                            label: '导出矩形',
                                            icon: <span>▭</span>,
                                            onClick: () =>
                                                handleExport(mapvthree.Editor.DrawerType.RECTANGLE),
                                        },
                                    ],
                                }}
                                placement="bottomRight"
                            >
                                <Button icon={<ExportOutlined />} block>
                                    导出数据 <DownOutlined />
                                </Button>
                            </Dropdown>
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

export default withSourceCode(Editor);

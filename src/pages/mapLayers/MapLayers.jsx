/* eslint-disable max-len */
import React, {useEffect, useRef, useState} from 'react';
import * as mapvthree from '@baidumap/mapv-three';
import FloatingPanel from './FloatingPanel';
import {Checkbox, Slider, Select, Divider, Button, Popconfirm, message} from 'antd';
import {withSourceCode} from '../../utils/withSourceCode';
import {PlusOutlined, DeleteOutlined} from '@ant-design/icons';

const {Option} = Select;

const LAYER_TYPES = {
    bing: {
        name: 'Bing卫星图',
        provider: 'BingImageryTileProvider',
        config: ['opacity', 'addDebugLabel', 'style'],
        default: {opacity: 1, addDebugLabel: false, style: 'Aerial', autoRefresh: false, visible: true},
    },
    baiduTraffic: {
        name: '百度交通路况图',
        provider: 'BaiduTrafficTileProvider',
        config: ['opacity', 'addDebugLabel', 'autoRefresh'],
        default: {opacity: 1, addDebugLabel: false, autoRefresh: true, visible: true},
    },
    stadia: {
        name: 'Stadia图层',
        provider: 'StadiaImageryTileProvider',
        config: ['opacity', 'addDebugLabel'],
        default: {opacity: 1, addDebugLabel: false, visible: true},
    },
    baiduVector: {
        name: '百度矢量图层',
        provider: 'BaiduVectorTileProvider',
        config: ['opacity', 'addDebugLabel'],
        default: {opacity: 1, addDebugLabel: false, visible: true},
    },
};

function createLayer(type, layerIdSeed) {
    const meta = LAYER_TYPES[type];
    return {
        id: `layer_${type}_${layerIdSeed}`,
        type,
        name: meta.name,
        ...meta.default,
    };
}

// 创建初始图层
const initialLayers = [
    createLayer('bing', 1),
    createLayer('baiduTraffic', 2),
];

function MapLayers() {
    const containerRef = useRef(null);
    const layerIdSeedRef = useRef(3); // 从3开始，因为1和2已经被初始图层使用
    const [layers, setLayers] = useState(initialLayers);
    const engineRef = useRef(null);
    const mapViewRef = useRef(null);
    const providerMapRef = useRef({}); // id: provider
    const prevLayerIdsRef = useRef([]); // 记录上一次的layerIds
    const prevLayerIdsStringRef = useRef(''); // 记录上一次的layerIds字符串

    // 初始化地图和MapView
    useEffect(() => {
        if (!containerRef.current) {
            return;
        }
        const engine = window.engine = new mapvthree.Engine(containerRef.current, {
            map: {
                center: [113.404, 23.915],
                range: 600000,
                pitch: 0,
                provider: null,
                projection: 'EPSG:3857',
            },
            rendering: {
                enableAnimationLoop: true,
                sky: new mapvthree.DynamicSky(),
            },
        });
        engineRef.current = engine;

        // 创建初始providers
        const bingProvider = new mapvthree.BingImageryTileProvider({
            style: initialLayers[0].style,
            opacity: initialLayers[0].opacity,
            visible: initialLayers[0].visible,
            addDebugLabel: initialLayers[0].addDebugLabel,
        });
        const baiduProvider = new mapvthree.BaiduTrafficTileProvider({
            autoRefresh: initialLayers[1].autoRefresh,
            opacity: initialLayers[1].opacity,
            visible: initialLayers[1].visible,
            addDebugLabel: initialLayers[1].addDebugLabel,
        });

        // 添加到providerMap
        providerMapRef.current[initialLayers[0].id] = bingProvider;
        providerMapRef.current[initialLayers[1].id] = baiduProvider;

        const mapView = engine.add(new mapvthree.MapView({
            imageryProviders: [bingProvider, baiduProvider],
        }));
        mapViewRef.current = mapView;

        return () => {
            if (engine) {
                engine.dispose();
            }
        };
    }, []);

    // 配置项变动时同步到provider
    useEffect(() => {
        layers.forEach(layer => {
            const provider = providerMapRef.current[layer.id];
            if (!provider) {
                return;
            }
            provider.opacity = layer.opacity;
            provider.visible = layer.visible;
            if (typeof provider.addDebugLabel === 'boolean') {
                provider.addDebugLabel = !!layer.addDebugLabel;
            }
            if (layer.type === 'bing' && provider.style !== layer.style) {
                provider.style = layer.style;
                if (typeof provider.refresh === 'function') {
                    provider.refresh();
                }
            }
            if (layer.type === 'baiduTraffic') {
                provider.autoRefresh = layer.autoRefresh;
            }
        });
    }, [layers]); // 监听整个layers数组

    // 删除图层
    const handleRemoveLayer = id => {
        if (layers.length <= 1) {
            message.warning('至少保留一个图层');
            return;
        }

        // 真正的图层删除
        const provider = providerMapRef.current[id];
        if (provider && mapViewRef.current?.rasterSurface) {
            mapViewRef.current.rasterSurface.removeImageryLayer(provider);
            delete providerMapRef.current[id];
        }

        setLayers(layers => layers.filter(l => l.id !== id));
    };

    // 新增图层
    const handleAddLayer = type => {
        const newLayer = createLayer(type, layerIdSeedRef.current++);

        // 真正的图层添加
        if (mapViewRef.current?.rasterSurface) {
            let provider;
            switch (type) {
                case 'stadia': {
                    provider = new mapvthree.StadiaImageryTileProvider({
                        opacity: newLayer.opacity,
                        visible: newLayer.visible,
                        addDebugLabel: newLayer.addDebugLabel,
                    });
                    break;
                }
                case 'baiduVector': {
                    provider = new mapvthree.BaiduVectorTileProvider({
                        opacity: newLayer.opacity,
                        visible: newLayer.visible,
                        addDebugLabel: newLayer.addDebugLabel,
                    });
                    break;
                }
                default: {
                    return;
                }
            }
            mapViewRef.current.rasterSurface.addImageryLayer(provider);
            providerMapRef.current[newLayer.id] = provider;
        }

        setLayers(layers => [...layers, newLayer]);
    };

    // 配置项变动
    const handleLayerConfigChange = (id, configKey, value) => {
        setLayers(layers => layers.map(l => (l.id === id ? {...l, [configKey]: value} : l)));
    };

    // 显隐
    const handleLayerToggle = id => {
        setLayers(layers => layers.map(l => (l.id === id ? {...l, visible: !l.visible} : l)));
    };

    return (
        <div style={{width: '100%', height: '100%', position: 'relative'}}>
            <div style={{position: 'absolute', left: 24, top: 32, zIndex: 10, minWidth: 280}}>
                <FloatingPanel title="图层控制">
                    {layers.map((layer, idx) => {
                        const meta = LAYER_TYPES[layer.type];
                        return (
                            <React.Fragment key={layer.id}>
                                <div style={{display: 'flex', alignItems: 'center', fontSize: 14, marginBottom: 12}}>
                                    <span style={{flex: 1, color: '#fff'}}>{layer.name}</span>
                                    <Checkbox
                                        checked={layer.visible}
                                        onChange={() => handleLayerToggle(layer.id)}
                                        style={{marginLeft: 8}}
                                    />
                                    <Popconfirm
                                        title="确定要删除该图层吗？"
                                        onConfirm={() => handleRemoveLayer(layer.id)}
                                        okText="删除"
                                        cancelText="取消"
                                        disabled={layers.length <= 1}
                                    >
                                        <Button
                                            type="text"
                                            icon={<DeleteOutlined style={{color: layers.length <= 1 ? '#888' : '#f5222d'}} />}
                                            size="small"
                                            disabled={layers.length <= 1}
                                            style={{marginLeft: 8}}
                                        />
                                    </Popconfirm>
                                </div>
                                {layer.visible ? (
                                    <div style={{marginLeft: 24, marginTop: 8}}>
                                        {meta.config.includes('opacity') && (
                                            <div style={{display: 'flex', alignItems: 'center', marginBottom: 8, fontSize: 12}}>
                                                <span style={{flex: 1, color: '#fff'}}>透明度</span>
                                                <Slider
                                                    min={0}
                                                    max={1}
                                                    step={0.01}
                                                    value={layer.opacity}
                                                    onChange={v => handleLayerConfigChange(layer.id, 'opacity', v)}
                                                    style={{width: 120, marginLeft: 8}}
                                                />
                                                <span style={{color: '#fff', marginLeft: 8, width: 32, textAlign: 'right'}}>{layer.opacity}</span>
                                            </div>
                                        )}
                                        {meta.config.includes('addDebugLabel') && (
                                            <div style={{display: 'flex', alignItems: 'center', marginBottom: 8, fontSize: 12}}>
                                                <span style={{flex: 1, color: '#fff'}}>显示网格</span>
                                                <Checkbox
                                                    checked={layer.addDebugLabel}
                                                    onChange={e => handleLayerConfigChange(layer.id, 'addDebugLabel', e.target.checked)}
                                                    style={{marginLeft: 8}}
                                                />
                                            </div>
                                        )}
                                        {meta.config.includes('style') && (
                                            <div style={{display: 'flex', alignItems: 'center', marginBottom: 8, fontSize: 12}}>
                                                <span style={{flex: 1, color: '#fff'}}>风格</span>
                                                <Select
                                                    value={layer.style}
                                                    onChange={v => handleLayerConfigChange(layer.id, 'style', v)}
                                                    style={{width: 140, marginLeft: 8}}
                                                >
                                                    <Option value="Aerial">Aerial</Option>
                                                    <Option value="AerialWithLabels">AerialWithLabels</Option>
                                                    <Option value="Road">Road</Option>
                                                </Select>
                                            </div>
                                        )}
                                        {meta.config.includes('autoRefresh') && (
                                            <div style={{display: 'flex', alignItems: 'center', marginBottom: 8, fontSize: 12}}>
                                                <span style={{flex: 1, color: '#fff'}}>自动刷新</span>
                                                <Checkbox
                                                    checked={layer.autoRefresh}
                                                    onChange={e => handleLayerConfigChange(layer.id, 'autoRefresh', e.target.checked)}
                                                    style={{marginLeft: 8}}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                                {idx !== layers.length - 1 && <Divider style={{margin: '12px 0', background: '#444'}} />}
                            </React.Fragment>
                        );
                    })}
                    <div style={{marginTop: 24, display: 'flex', gap: 12}}>
                        <Button
                            icon={<PlusOutlined />}
                            onClick={() => handleAddLayer('stadia')}
                            type="dashed"
                            style={{flex: 1}}
                        >
                            添加Stadia图层
                        </Button>
                        <Button
                            icon={<PlusOutlined />}
                            onClick={() => handleAddLayer('baiduVector')}
                            type="dashed"
                            style={{flex: 1}}
                        >
                            添加百度矢量图层
                        </Button>
                    </div>
                </FloatingPanel>
            </div>
            <div ref={containerRef} className="showcase" style={{width: '100vw', height: '100vh'}} />
        </div>
    );
}

export default withSourceCode(MapLayers);
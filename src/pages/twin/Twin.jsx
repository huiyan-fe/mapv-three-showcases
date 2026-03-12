import {useEffect, useRef, useState, useCallback} from 'react';
import {withSourceCode} from '../../utils/withSourceCode';
import * as mapvthree from '@baidumap/mapv-three';
import twinData from '../data/twin.json';
import './Twin.less';

mapvthree.BaiduMapConfig.ak = import.meta.env.VITE_BAIDU_MAP_AK;

const COLOR_PRESETS = {
    white: {label: '白色', value: mapvthree.Twin.REALISTIC_TEMPLATE_COLOR.white},
    black: {label: '黑色', value: mapvthree.Twin.REALISTIC_TEMPLATE_COLOR.black},
    gray: {label: '灰色', value: mapvthree.Twin.REALISTIC_TEMPLATE_COLOR.gray},
    blue: {label: '蓝色', value: mapvthree.Twin.REALISTIC_TEMPLATE_COLOR.blue},
    red: {label: '红色', value: mapvthree.Twin.REALISTIC_TEMPLATE_COLOR.red},
    yellow: {label: '黄色', value: mapvthree.Twin.REALISTIC_TEMPLATE_COLOR.yellow},
};

const MODEL_TYPES = {
    2: {label: '轿车'},
    3: {label: '卡车'},
};

let engine;
let twin;
let label;
let playTimer;

function Twin() {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const frameIndexRef = useRef(0);
    const [panelOpen, setPanelOpen] = useState(true);
    const [bodyColor, setBodyColor] = useState('white');
    const [selectedCar, setSelectedCar] = useState(null);
    const [labelMode, setLabelMode] = useState('speed'); // 'speed' | 'plate' | 'hidden'
    const labelModeRef = useRef('speed');
    const [typeVisible, setTypeVisible] = useState({
        2: true, 3: true,
    });

    const bodyColorRef = useRef(bodyColor);
    bodyColorRef.current = bodyColor;

    const pushCurrentFrame = useCallback(() => {
        if (!twin || !twinData.length) {
            return;
        }
        const idx = (frameIndexRef.current - 1 + twinData.length) % twinData.length;
        const frame = twinData[idx];
        if (frame && frame.tracks) {
            const tracks = frame.tracks.map(item => ({
                ...item,
                timestamp: Date.now(),
            }));
            twin.push(tracks);
        }
    }, []);

    const pushFrame = useCallback(() => {
        if (!twin || !twinData.length) {
            return;
        }
        const frame = twinData[frameIndexRef.current];
        if (frame && frame.tracks) {
            const tracks = frame.tracks.map(item => ({
                ...item,
                timestamp: Date.now(),
            }));
            // 打印被追踪车辆的heading信息
            if (twin._trackId != null) {
                const tracked = tracks.find(t => t.id === twin._trackId);
                if (tracked) {
                    // eslint-disable-next-line no-console, max-len
                    console.log(`[frame ${frameIndexRef.current}] tracked id=${tracked.id}, heading=${tracked.heading}, dir=${(90 - tracked.heading) / 180 * Math.PI}, x=${tracked.x}, y=${tracked.y}`);
                }
                else {
                    console.log(`[frame ${frameIndexRef.current}] tracked id=${twin._trackId} NOT in this frame`);
                }
            }
            twin.push(tracks);
        }
        frameIndexRef.current
            = (frameIndexRef.current + 1) % twinData.length;
    }, []);

    const startPlayback = useCallback(() => {
        if (playTimer) {
            clearInterval(playTimer);
        }
        playTimer = setInterval(pushFrame, 200);
        setIsPlaying(true);
    }, [pushFrame]);

    const stopPlayback = useCallback(() => {
        if (playTimer) {
            clearInterval(playTimer);
            playTimer = null;
        }
        setIsPlaying(false);
    }, []);

    useEffect(() => {
        if (!mapRef.current) {
            return;
        }

        const firstFrame = twinData[0];
        const firstTrack = firstFrame?.tracks?.[0];
        const center = firstTrack
            ? [firstTrack.x, firstTrack.y, 0]
            : [113.314, 23.516, 0];

        engine = window.engine = new mapvthree.Engine(mapRef.current, {
            map: {
                center,
                range: 400,
                pitch: 60,
                provider: null,
            },
            rendering: {
                enableAnimationLoop: true,
                sky: null,
            },
        });

        engine.add(new mapvthree.MapView({
            terrainProvider: undefined,
            imageryProvider: new mapvthree.BingImageryTileProvider(),
        }));

        engine.add(new mapvthree.DynamicSky());

        label = engine.add(new mapvthree.Label({
            type: 'icontext',
            mapSrc: 'images/speed-panel.png',
            iconWidth: 100,
            iconHeight: 30,
            textSize: 12,
            textFillStyle: '#fff',
            textStrokeStyle: 'rgba(0, 0, 0, 0.8)',
            textStrokeWidth: 2,
            textOffset: [20, 0],
            pixelOffset: [0, 80],
            keepSize: true,
            depthTest: false,
            transparent: true,
        }));

        twin = engine.add(new mapvthree.Twin({
            delay: 1000,
            keepSize: true,
            modelConfig: {
                2: mapvthree.Twin.REALISTIC_TEMPLATE_MODEL.CAR,
                3: mapvthree.Twin.REALISTIC_TEMPLATE_MODEL.TRUCK,
            },
            objects: [label],
            objectAttributes: {text: 'plateText'},
        }));

        twin.dataProvider
            .process('time', 'timestamp')
            .process('point', item => [item.x, item.y, 0])
            .process(
                'dir',
                item => (90 - item.heading) / 180 * Math.PI
            )
            .process('speed', item => Math.round(item.speed || 0))
            .process('scale', () => [2, 2, 2])
            .process('modelType', item => {
                return item.id % 2 === 0 ? 2 : 3;
            })
            .process('color', () => {
                return COLOR_PRESETS[bodyColorRef.current].value;
            })
            .process('plateText', item => {
                const mode = labelModeRef.current;
                if (mode === 'plate') {
                    return item.plateno || '';
                }
                return `${Math.round(item.speed || 0)} km/h`;
            });

        twin.receiveRaycast = true;
        twin.addEventListener('click', e => {
            if (e.clickInfo) {
                setSelectedCar(e.clickInfo);
            }
        });

        frameIndexRef.current = 0;
        playTimer = setInterval(pushFrame, 200);

        return () => {
            if (playTimer) {
                clearInterval(playTimer);
                playTimer = null;
            }
            if (engine) {
                engine.dispose();
                engine = null;
                twin = null;
                label = null;
            }
        };
    }, [pushFrame]);

    const handleTogglePlay = () => {
        if (isPlaying) {
            stopPlayback();
            if (twin) {
                twin.pause();
            }
        }
        else {
            startPlayback();
            if (twin) {
                twin.start();
            }
        }
    };

    const handleReset = () => {
        frameIndexRef.current = 0;
        if (twin) {
            twin.reset();
        }
        setSelectedCar(null);
        if (!isPlaying) {
            startPlayback();
            if (twin) {
                twin.start();
            }
        }
    };

    const handleTypeToggle = type => {
        const next = !typeVisible[type];
        setTypeVisible(prev => ({...prev, [type]: next}));
        if (twin) {
            twin.setVisibleByType(Number(type), next);
        }
    };

    const getTrackId = () => {
        if (selectedCar) {
            return selectedCar.id;
        }
        if (twin && twin._buffers && twin._buffers.id && twin._buffers.id.length) {
            return twin._buffers.id[0];
        }
        return null;
    };

    const handleTrack = () => {
        if (!twin) {
            return;
        }
        const id = getTrackId();
        if (id == null) {
            return;
        }
        console.log('trackById:', id);
        twin.trackById(id, {
            pitch: 80,
        });
    };

    const handleClearTrack = () => {
        if (twin) {
            twin.clearTrack();
        }
    };

    return (
        <div className="showcase" ref={containerRef}>
            <div className="map-container" ref={mapRef} />
            <div className="ui-overlay">
                <div className="twin-header">
                    <h1 className="twin-title">孪生车流可视化</h1>
                    <div className="control-panel">
                        <button
                            className={
                                `control-btn${isPlaying ? ' active' : ''}`
                            }
                            onClick={handleTogglePlay}
                        >
                            {isPlaying ? '⏸ 暂停' : '▶ 播放'}
                        </button>
                        <button
                            className="control-btn"
                            onClick={handleReset}
                        >
                            ↺ 重置
                        </button>
                    </div>
                </div>

                <div className={`config-panel${panelOpen ? ' open' : ''}`}>
                    <div
                        className="panel-toggle"
                        onClick={() => setPanelOpen(!panelOpen)}
                    >
                        <span className="panel-toggle-icon">
                            {panelOpen ? '▾' : '▸'}
                        </span>
                        <span>配置面板</span>
                    </div>

                    {panelOpen && (
                        <div className="panel-content">
                            <div className="panel-section">
                                <div className="section-title">
                                    车身颜色
                                </div>
                                <select
                                    className="label-select"
                                    value={bodyColor}
                                    onChange={e => {
                                        setBodyColor(e.target.value);
                                        pushCurrentFrame();
                                    }}
                                >
                                    {Object.entries(COLOR_PRESETS)
                                        .map(([key, c]) => (
                                            <option
                                                key={key}
                                                value={key}
                                            >
                                                {c.label}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="panel-section">
                                <div className="section-title">
                                    标签显示
                                </div>
                                <select
                                    className="label-select"
                                    value={labelMode}
                                    onChange={e => {
                                        const mode = e.target.value;
                                        setLabelMode(mode);
                                        labelModeRef.current = mode;
                                        if (twin) {
                                            twin.setObjectVisible(
                                                mode !== 'hidden'
                                            );
                                        }
                                        if (label) {
                                            label.textOffset = mode === 'plate'
                                                ? [0, 0] : [20, 0];
                                        }
                                        pushCurrentFrame();
                                    }}
                                >
                                    <option value="speed">显示速度</option>
                                    <option value="plate">显示车牌</option>
                                    <option value="hidden">隐藏标签</option>
                                </select>
                            </div>

                            <div className="panel-section">
                                <div className="section-title">
                                    车型筛选
                                </div>
                                {Object.entries(MODEL_TYPES)
                                    .map(([type, cfg]) => (
                                        <label
                                            key={type}
                                            className="toggle-row"
                                        >
                                            <span>
                                                {cfg.label}
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={typeVisible[type]}
                                                onChange={() => {
                                                    handleTypeToggle(type);
                                                }}
                                            />
                                            <span className="toggle-switch" />
                                        </label>
                                    ))}
                            </div>

                            <div className="panel-section">
                                <div className="section-title">
                                    车辆追踪
                                </div>
                                <div className="track-actions">
                                    <button
                                        className="track-btn"
                                        onClick={handleTrack}
                                    >
                                        跟车视角
                                    </button>
                                    <button
                                        className="track-btn"
                                        onClick={handleClearTrack}
                                    >
                                        取消追踪
                                    </button>
                                </div>
                                {selectedCar && (
                                    <div className="selected-car-info">
                                        <div className="info-row">
                                            <span className="info-label">
                                                车牌
                                            </span>
                                            <span className="info-value">
                                                {selectedCar.plateno
                                                    || '未知'}
                                            </span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">
                                                车型
                                            </span>
                                            <span className="info-value">
                                                {selectedCar.model
                                                    || '未知'}
                                            </span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">
                                                速度
                                            </span>
                                            <span className="info-value">
                                                {selectedCar.speed
                                                    ? `${Math.round(
                                                        selectedCar.speed
                                                    )} km/h`
                                                    : '未知'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {!selectedCar && (
                                    <div className="track-hint">
                                        点击地图上的车辆可查看详情
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default withSourceCode(Twin);

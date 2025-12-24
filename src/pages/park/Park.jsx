import {useEffect, useRef, useState} from 'react';
import {withSourceCode} from '../../utils/withSourceCode';
import * as mapvthree from '@baidumap/mapv-three';
import './Park.less';
import {accessToken, pointArr, routeList} from './config.js';
import {Slider, Typography, Button} from 'antd';
import startPng from './assets/start.png';
import scenicPng from './assets/scenic.png';
import manAnimateGlb from './assets/man_animate.glb';

const {Title} = Typography;

const routes = Array.from({length: routeList.length}, (_, i) => ({
    id: i + 1,
}));
const center = [117.29942922544772, 40.16669141779406, 0];
const defaultViewParams = {
    heading: 116,
    pitch: 75,
    range: 4000,
};

function drawTag(engine, pointArr) {
    const offsetHeight = 600;
    const line = engine.add(new mapvthree.Polyline({
        lineWidth: 2,
        color: '#ffffff',
        dashed: true,
    }));
    const lineDataSource = mapvthree.GeoJSONDataSource.fromGeoJSON(pointArr.map(v => {
        const {point, lineHeight} = v;
        const offsetZ = point[2] + (lineHeight || offsetHeight);
        return {
            geometry: {
                type: 'LineString',
                coordinates: [
                    point,
                    [point[0], point[1], offsetZ],
                ],
            },
        };
    }));
    line.dataSource = lineDataSource;

    const text = engine.add(new mapvthree.Text({
        fillStyle: '#ffffff',
        fontSize: 15,
        pixelOffsetY: 10,
    }));
    const textDataSource = mapvthree.GeoJSONDataSource.fromGeoJSON(pointArr.map(v => {
        const {point, text, lineHeight} = v;
        const offsetZ = point[2] + (lineHeight || offsetHeight);
        return {
            geometry: {
                type: 'Point',
                coordinates: [point[0], point[1], offsetZ],
            },
            properties: {
                text: text,
            },
        };
    }));
    textDataSource.defineAttribute('text', 'text');
    text.dataSource = textDataSource;

    const point = engine.add(new mapvthree.SimplePoint({
        color: '#ffffff',
        size: 8,
    }));
    const pointDataSource = mapvthree.GeoJSONDataSource.fromGeoJSON(pointArr.reduce((acc, cur) => {
        const {point, lineHeight} = cur;
        const offsetZ = point[2] + (lineHeight || offsetHeight);
        acc.push({
            geometry: {
                type: 'Point',
                coordinates: [point[0], point[1], offsetZ],
            },
        });
        acc.push({
            geometry: {
                type: 'Point',
                coordinates: point,
            },
        });
        return acc;
    }, []));
    point.dataSource = pointDataSource;

    const icon = engine.add(new mapvthree.Icon({
        mapSrc: startPng,
        width: 40,
        height: 40,
        vertexIcons: true,
        offset: [0, -40],
        transparent: true,
    }));
    const iconDataSource = mapvthree.GeoJSONDataSource.fromGeoJSON([
        {
            geometry: {
                type: 'Point',
                coordinates: [117.29521181902322, 40.17100124172578, 680.713158344391],
            },
            properties: {
                icon: startPng,
            },
        },
        {
            geometry: {
                type: 'Point',
                coordinates: [117.2945946012128, 40.16252924413552, 854.1134948240242],
            },
            properties: {
                icon: scenicPng,
            },
        },
    ]);
    iconDataSource.defineAttribute('icon');
    icon.dataSource = iconDataSource;

    return {line, text, point, icon};
}

function drawLine(engine, list) {
    list.forEach((config, index) => {
        const {color, enableAnimation, pointArr} = config;
        const groundLine = new mapvthree.GroundObject({
            type: 'Line',
            lineWidth: 5,
            color: color,
            keepSize: true,
            enableAnimation: true,
            animationTailRatio: 1,
            animationSpeed: 0.8,
        }, engine);
        groundLine.dataSource = mapvthree.GeoJSONDataSource.fromGeoJSON([
            {
                geometry: {
                    type: 'LineString',
                    coordinates: pointArr,
                },
            },
        ]);
        groundLine.renderObject.name = 'groundLine' + (index + 1);
        groundLine.renderObject.enableAnimation = false;
    });
}

function addTracker(engine, list) {
    const model = new mapvthree.AnimationModel({
        name: 'man',
        url: manAnimateGlb,
        scale: [4, 4, 4],
        autoPlay: true,
    });
    model.addEventListener('loaded', () => {
        model.setSpeed(3);
    });
    model.onBeforeSceneRender = () => {
        model.rotation.set(model.rotation.x, model.rotation.y, model.rotation.z - Math.PI / 2);
    };
    engine.add(model);

    const pathTracker = engine.add(new mapvthree.PathTracker());
    pathTracker.lockView = true;
    pathTracker.track = list;
    pathTracker.object = model;

    const duration = 600 * 1000;
    let startTime = null;
    const line = engine.add(new mapvthree.Polyline({
        flat: true,
        lineWidth: 15,
        keepSize: true,
        color: '#339933',
    }));
    const passedList = [];
    const prepareRenderCallback = () => {
        const ratio = (Date.now() - startTime) / duration;
        const data = pathTracker._interpolatePath(ratio);
        passedList.push([data.point[0], data.point[1], data.point[2] + 0.1]);
        if (passedList.length < 10) {
            // 缓存一点数据
            return;
        }
        line.dataSource = mapvthree.GeoJSONDataSource.fromGeoJSON([
            {
                geometry: {
                    type: 'LineString',
                    coordinates: passedList,
                },
            },
        ]);
    };

    const start = () => {
        model.visible = true;
        startTime = Date.now();
        pathTracker.start({
            duration: duration,
            heading: 0,
            pitch: 70,
            distance: 200,
        });
        engine.addPrepareRenderListener(prepareRenderCallback);
        line.visible = true;
    };

    const stop = () => {
        model.visible = false;
        line.dataSource = null;
        passedList.splice(0, passedList.length);
        line.visible = false;
        pathTracker.stop();
        engine.removePrepareRenderListener(prepareRenderCallback);
    };

    return {pathTracker, start, stop};
}

function drawFatLine(engine, list) {
    const line = engine.add(new mapvthree.Polyline({
        flat: true,
        lineWidth: 15,
        keepSize: true,
        color: '#FF7043',
    }));
    line.visible = false;

    const dataSource = list.map(v => {
        return {
            geometry: {
                type: 'LineString',
                coordinates: v.pointArr,
            },
        };
    });
    line.dataSource = mapvthree.GeoJSONDataSource.fromGeoJSON(dataSource);
    line.name = 'allLine';
    return line;
}

function Park() {
    const [routeLine, setRouteLine] = useState(1);
    const engineRef = useRef(null);
    const trackerRef = useRef(null);
    const tagRef = useRef(null);
    const allLineRef = useRef(null);

    const marks = {};
    routes.forEach(seg => {
        marks[seg.id] = {
            label: (
                <span
                    style={{
                        color: '#1677ff',
                        fontSize: 12,
                        WebkitTextStroke: '0.5px white',
                        textShadow: '1px 1px 1px rgba(0,0,0,0.2)',
                    }}
                >
                    {seg.id}
                </span>
            ),
        };
    });

    const resetRouteLine = () => {
        routeList.forEach((val, index) => {
            const groundLine = engineRef.current.scene.getObjectByName('groundLine' + (index + 1));
            groundLine.enableAnimation = false;
        });
        setRouteLine(null);
    };
    const handleRouteChange = val => {
        resetRouteLine();
        const scene = engineRef.current.scene;
        const groundLine = scene.getObjectByName('groundLine' + val);
        setRouteLine(val);
        groundLine.enableAnimation = true;
    };
    const startClimbing = () => {
        allLineRef.current.visible = true;
        trackerRef.current.start();
        tagRef.current.line.visible = false;
        tagRef.current.text.visible = false;
        tagRef.current.point.visible = false;
        tagRef.current.icon.visible = false;
        routeList.forEach((_, index) => {
            const groundLine = engineRef.current.scene.getObjectByName('groundLine' + (index + 1));
            groundLine.visible = false;
        });
        resetRouteLine();
    };
    const stopClimbing = () => {
        allLineRef.current.visible = false;
        trackerRef.current.stop();
        tagRef.current.line.visible = true;
        tagRef.current.text.visible = true;
        tagRef.current.point.visible = true;
        tagRef.current.icon.visible = true;
        engineRef.current.map.lookAt(center, defaultViewParams);
        routeList.forEach((_, index) => {
            const groundLine = engineRef.current.scene.getObjectByName('groundLine' + (index + 1));
            groundLine.visible = true;
        });
    };

    useEffect(() => {
        const engine = new mapvthree.Engine(document.getElementById('showcase'), {
            map: {
                center,
                projection: 'ECEF',
                provider: null,
                ...defaultViewParams,
            },
            rendering: {
                sky: new mapvthree.DynamicSky(),
                enableAnimationLoop: true,
            },
        });
        engineRef.current = engine;

        const mapView = engine.add(new mapvthree.MapView({
            terrainProvider: new mapvthree.CesiumTerrainTileProvider({
                accessToken: accessToken,
            }),
        }));
        allLineRef.current = drawFatLine(engine, routeList);
        tagRef.current = drawTag(engine, pointArr);
        drawLine(engine, routeList);
        trackerRef.current = addTracker(engine, routeList.reduce((acc, cur) => {
            return [...acc, ...cur.pointArr];
        }, []));

        // 清理函数
        return () => {
            if (engine) {
                engine.dispose();
            }
        };
    }, []);

    return (
        <>
            <div className="control-panel">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                    <Title level={4} style={{margin: 0}}>
                        登山路线
                    </Title>
                    <Button
                        style={{color: '#fff'}}
                        type="text"
                        onClick={resetRouteLine}
                    >
                        重置
                    </Button>
                </div>
                <div style={{marginBottom: 12}}>
                    <Slider
                        min={1}
                        max={routes.length}
                        value={routeLine}
                        onChange={handleRouteChange}
                        marks={marks}
                        step={1}
                        // tooltip={{ open: true }}
                    />
                </div>
                <Button
                    style={{color: '#fff'}}
                    type="text"
                    onClick={startClimbing}
                >
                    爬山
                </Button>
                <Button
                    style={{color: '#fff', marginLeft: '16px'}}
                    type="text"
                    onClick={stopClimbing}
                >
                    停止
                </Button>
            </div>
            <div className="showcase" id="showcase"></div>
        </>
    );
}

export default withSourceCode(Park);



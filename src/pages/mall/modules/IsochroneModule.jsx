import React from 'react';
import * as THREE from 'three';
import IsochronePanel from '../panels/IsochronePanel';
import * as mapvthree from '@baidumap/mapv-three';
import polygonData from '../data/gz_dsddq.geojson';
import iconCar from '../assets/icons/car.png?url';
import iconBike from '../assets/icons/bike.png?url';
import iconWalk from '../assets/icons/walk.png?url';
import FloatingPanel from '../components/FloatingPanel';
import PanelLayout from '../components/PanelLayout';
import LegendItem from '../components/LegendItem';

function addCoordinateZ(coordinates, z) {
    if (Array.isArray(coordinates[0])) {
        coordinates.forEach(coordinate => {
            addCoordinateZ(coordinate, z);
        });
    }
    else {
        coordinates[2] = z;
    }
}

function getOffsetZ(type, time) {
    let base = 10;
    if (type === 'bike') {
        base = 20;
    }
    else if (type === 'walk') {
        base = 30;
    }
    let value = base;
    return value * 10;
}
// 根据features的properties.time递减排序，将下一个features的geometry作为上一个features的geometry的hole
// features的geometry是MultiPolygon
function addPolygonHole(features) {
    features.sort((a, b) => b.properties.time - a.properties.time);
    for (let i = 0; i < features.length - 1; i++) {
        const feature = features[i];
        const geometry = feature.geometry;
        const coordinates = geometry.coordinates[0][0];
        const hole = features[i + 1].geometry.coordinates[0][0];
        geometry.coordinates[0] = [coordinates, hole];
    }
    return features;
}

function convertToLineData(features) {
    const lineData = [];
    features.forEach(feature => {
        const geometry = feature.geometry;
        const coordinates = geometry.coordinates[0][0];
        const lineFeature = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: coordinates,
            },
            properties: feature.properties,
        };
        lineData.push(lineFeature);
    });
    return lineData;
}
function IsochroneModule({engine}) {
    const [carVisible, setCarVisible] = React.useState(true);
    const [bikeVisible, setBikeVisible] = React.useState(false);
    const [walkVisible, setWalkVisible] = React.useState(false);
    const [layersReady, setLayersReady] = React.useState(false);

    // 用 ref 保存各图层实例
    const carPolygonRef = React.useRef();
    const bikePolygonRef = React.useRef();
    const walkPolygonRef = React.useRef();
    const carLineRef = React.useRef();
    const bikeLineRef = React.useRef();
    const walkLineRef = React.useRef();

    // 初始化和销毁图层
    React.useEffect(() => {
        if (!engine) {
            return;
        }
        setLayersReady(false);
        engine.map.flyTo([113.33111353, 23.1367952], {
            range: 75000,
            pitch: 0,
            duration: 2000,
        });

        const carPolygon = engine.add(new mapvthree.Polygon({
            color: '#43e97b',
            opacity: 0.1,
            transparent: true,
            vertexColors: true,
            mapSrc: iconCar,
            mapScale: 5,
        }));
        carPolygon.geometry.useUV = true;
        carPolygon.geometry.useEarCut = true;
        carPolygon.material.side = THREE.DoubleSide;
        carPolygon.material.depthWrite = false;
        carPolygonRef.current = carPolygon;

        const carLine = engine.add(new mapvthree.Polyline({
            flat: true,
            color: '#43e97b',
            vertexColors: true,
            opacity: 0.8,
            lineWidth: 2,
            transparent: true,
            keepSize: true,
        }));
        carLineRef.current = carLine;

        const bikePolygon = engine.add(new mapvthree.Polygon({
            color: '#ff0000',
            opacity: 0.1,
            transparent: true,
            vertexColors: true,
            mapSrc: iconBike,
            mapScale: 5,
        }));
        bikePolygon.geometry.useUV = true;
        bikePolygon.geometry.useEarCut = true;
        bikePolygon.material.side = THREE.DoubleSide;
        bikePolygon.material.depthWrite = false;
        bikePolygonRef.current = bikePolygon;

        const bikeLine = engine.add(new mapvthree.Polyline({
            flat: true,
            color: '#ff0000',
            vertexColors: true,
            opacity: 0.8,
            lineWidth: 2,
            transparent: true,
            keepSize: true,
        }));
        bikeLineRef.current = bikeLine;

        const walkPolygon = engine.add(new mapvthree.Polygon({
            color: '#0000ff',
            opacity: 0.1,
            transparent: true,
            vertexColors: true,
            mapSrc: iconWalk,
            mapScale: 5,
        }));
        walkPolygon.geometry.useUV = true;
        walkPolygon.geometry.useEarCut = true;
        walkPolygon.material.side = THREE.DoubleSide;
        walkPolygon.material.depthWrite = false;
        walkPolygonRef.current = walkPolygon;

        const walkLine = engine.add(new mapvthree.Polyline({
            flat: true,
            color: '#0000ff',
            vertexColors: true,
            opacity: 0.8,
            lineWidth: 2,
            transparent: true,
            keepSize: true,
        }));
        walkLineRef.current = walkLine;

        let carData = [];
        let bikeData = [];
        let walkData = [];

        let carLineData = [];
        let bikeLineData = [];
        let walkLineData = [];

        fetch(polygonData).then(res => res.json()).then(data => {
            const features = data.features;
            features.forEach(feature => {
                const geometry = feature.geometry;
                const properties = feature.properties;
                const type = properties.type;

                console.log(type, properties.time, getOffsetZ(type, properties.time));
                const coordinates = geometry.coordinates;
                addCoordinateZ(coordinates, getOffsetZ(type, properties.time));

                if (properties.time >= 20) {
                    properties.color = '#cc0000';
                }
                else if (properties.time >= 10) {
                    properties.color = '#cc8800';
                }
                else {
                    properties.color = '#00aa00';
                }

                properties.id = type + '_' + properties.time;

                if (type === 'car') {
                    carData.push(feature);
                }
                else if (type === 'bike') {
                    bikeData.push(feature);
                }
                else if (type === 'walk') {
                    walkData.push(feature);
                }
            });

            carLineData = convertToLineData(carData);
            bikeLineData = convertToLineData(bikeData);
            walkLineData = convertToLineData(walkData);

            carData = addPolygonHole(carData);
            bikeData = addPolygonHole(bikeData);
            walkData = addPolygonHole(walkData);

            const carDataSource = mapvthree.GeoJSONDataSource.fromGeoJSON({
                type: 'FeatureCollection',
                features: carData,
            });
            carDataSource.defineAttribute('color', 'color');
            carPolygon.dataSource = carDataSource;

            const bikeDataSource = mapvthree.GeoJSONDataSource.fromGeoJSON({
                type: 'FeatureCollection',
                features: bikeData,
            });
            bikeDataSource.defineAttribute('color', 'color');
            bikePolygon.dataSource = bikeDataSource;

            const walkDataSource = mapvthree.GeoJSONDataSource.fromGeoJSON({
                type: 'FeatureCollection',
                features: walkData,
            });
            walkDataSource.defineAttribute('color', 'color');
            walkPolygon.dataSource = walkDataSource;

            const carLineDataSource = mapvthree.GeoJSONDataSource.fromGeoJSON({
                type: 'FeatureCollection',
                features: carLineData,
            });
            carLineDataSource.defineAttribute('color', 'color');
            carLine.dataSource = carLineDataSource;

            const bikeLineDataSource = mapvthree.GeoJSONDataSource.fromGeoJSON({
                type: 'FeatureCollection',
                features: bikeLineData,
            });
            bikeLineDataSource.defineAttribute('color', 'color');
            bikeLine.dataSource = bikeLineDataSource;

            const walkLineDataSource = mapvthree.GeoJSONDataSource.fromGeoJSON({
                type: 'FeatureCollection',
                features: walkLineData,
            });
            walkLineDataSource.defineAttribute('color', 'color');
            walkLine.dataSource = walkLineDataSource;
            setLayersReady(true);
        });

        return () => {
            engine.remove(carPolygon);
            engine.remove(bikePolygon);
            engine.remove(walkPolygon);
            engine.remove(carLine);
            engine.remove(bikeLine);
            engine.remove(walkLine);
        };
    }, [engine]);

    // 控制显隐
    React.useEffect(() => {
        if (!layersReady) {
            return;
        }
        if (
            !carPolygonRef.current
            || !carLineRef.current
            || !bikePolygonRef.current
            || !bikeLineRef.current
            || !walkPolygonRef.current
            || !walkLineRef.current
        ) {
            return;
        }
        carPolygonRef.current.visible = carVisible;
        carLineRef.current.visible = carVisible;
        bikePolygonRef.current.visible = bikeVisible;
        bikeLineRef.current.visible = bikeVisible;
        walkPolygonRef.current.visible = walkVisible;
        walkLineRef.current.visible = walkVisible;
    }, [carVisible, bikeVisible, walkVisible, layersReady]);

    return (
        <PanelLayout side="right" width={280}>
            <FloatingPanel title="等时圈筛选" height={180}>
                <IsochronePanel
                    carVisible={carVisible}
                    bikeVisible={bikeVisible}
                    walkVisible={walkVisible}
                    onCarVisibleChange={setCarVisible}
                    onBikeVisibleChange={setBikeVisible}
                    onWalkVisibleChange={setWalkVisible}
                />
            </FloatingPanel>
            <FloatingPanel title="图例说明" height={140}>
                <div style={{marginTop: 4}}>
                    <LegendItem color="#00aa00">5分钟通勤圈</LegendItem>
                    <LegendItem color="#cc8800">10分钟通勤圈</LegendItem>
                    <LegendItem color="#cc0000">30分钟通勤圈</LegendItem>
                </div>
            </FloatingPanel>
        </PanelLayout>
    );
}
export default IsochroneModule;
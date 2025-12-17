/* eslint-disable max-nested-callbacks */
import {useEffect} from 'react';
import initEngine from '../../utils/initEngine';
import {withSourceCode} from '../../utils/withSourceCode';
import SatelliteObject from './satellite';
import {JulianDate, Transforms, defined, Matrix3, Cartesian3, Matrix4} from 'cesium';

import * as mapvthree from '@baidumap/mapv-three';
import * as THREE from 'three';
import gpsdata from './assets/gps.txt';

const center = [116.5163443534827, 39.79913123605543];

// 定义时间流速控制器的样式
const timeControlStyles = `
  .time-control-container {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 10px;
    padding: 15px;
    color: white;
    font-family: Arial, sans-serif;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    width: 280px;
  }
  
  .time-control-title {
    font-size: 16px;
    margin-bottom: 15px;
    font-weight: bold;
    text-align: center;
    color: #3498db;
  }
  
  .time-control-labels {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #ccc;
    margin-bottom: 5px;
  }
  
  .time-control-value {
    text-align: center;
    font-size: 16px;
    margin-top: 15px;
    color: #2ecc71;
    padding: 5px;
  }
  
  .slider-container {
    position: relative;
    height: 50px;
    margin: 10px 0;
  }
  
  .slider-track {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    height: 8px;
    background-color: #3e3e3e;
    border-radius: 4px;
  }
  
  .slider-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: #3498db;
    border-radius: 4px;
    pointer-events: none;
  }
  
  .slider-thumb {
    position: absolute;
    top: 50%;
    width: 22px;
    height: 22px;
    background-color: #3498db;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    box-shadow: 0 0 5px rgba(0,0,0,0.5);
    z-index: 2;
  }
  
  .slider-thumb:hover {
    background-color: #2980b9;
  }
  
  .slider-thumb:active {
    background-color: #2980b9;
    width: 24px;
    height: 24px;
  }
  
  .time-ticks {
    position: relative;
    height: 20px;
    margin-top: 8px;
  }
  
  .time-tick {
    position: absolute;
    width: 2px;
    height: 8px;
    background-color: #666;
    top: 0;
    transform: translateX(-50%);
  }
  
  .time-tick-label {
    position: absolute;
    font-size: 10px;
    color: #999;
    transform: translateX(-50%);
    top: 10px;
    text-align: center;
  }
`;

function convertIcrfToFixed(icrfPosition, time) {
    // 计算ICRF到固定坐标系的转换矩阵
    const icrfToFixedMatrix = Transforms.computeIcrfToFixedMatrix(time);

    if (defined(icrfToFixedMatrix)) {
        // 转换位置
        const position = Matrix3.multiplyByVector(
            icrfToFixedMatrix,
            icrfPosition,
            new Cartesian3()
        );

        // 创建THREE.js矩阵以便应用到场景中
        const matrix3 = new THREE.Matrix3();
        matrix3.elements = icrfToFixedMatrix;
        const matrix4 = new THREE.Matrix4().setFromMatrix3(matrix3);
        const euler = new THREE.Euler().setFromRotationMatrix(matrix4);

        return {
            position: new THREE.Vector3(position.x, position.y, position.z),
            euler: euler,
            matrix3: matrix3,
            matrix4: matrix4,
        };
    }
}

const satelliteSet = new Set();
let simplePoint;
let label;
let simplePoint2;
// 全局变量存储时间流速
window.timeFlowRate = 1;

function Satellite() {
    useEffect(() => {
        // 首先添加样式到文档头
        const styleElement = document.createElement('style');
        styleElement.innerHTML = timeControlStyles;
        document.head.appendChild(styleElement);

        // 创建自定义滑块
        createCustomSlider();

        const {
            engine,
        } = initEngine({
            skyType: 'dynamic',
            documentId: 'satellite',
            center: center,
            pitch: 0,
            zoom: 18,
            range: 100000000,
            projection: 'ecef',
            enableAnimationLoop: true,
        });
        engine.map.map.farScale = 2;

        // 创建一个当前日期对象，用于累加时间
        const initialDate = new Date(); // 存储初始时间
        let currentDate = new Date(); // 当前累加时间
        const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 一天的毫秒数

        const mapview = engine.add(new mapvthree.MapView({
            imageryProvider: new mapvthree.BingImageryTileProvider({}),
        }));

        simplePoint = engine.add(new mapvthree.SimplePoint({
            color: 'white',
            size: 10,
        }));
        window.simplePoint = simplePoint;
        simplePoint.dataSource = mapvthree.GeoJSONDataSource.fromGeoJSON([]);

        simplePoint2 = engine.add(new mapvthree.SimplePoint({
            color: 'red',
            size: 10,
        }));
        simplePoint2.dataSource = mapvthree.GeoJSONDataSource.fromGeoJSON([]);

        label = engine.add(new mapvthree.Text({
            fontSize: 16,
            pixelOffsetY: 20,
            depthTest: false,
        }));
        window.label = label;
        const dataSource = mapvthree.GeoJSONDataSource.fromGeoJSON([]);
        dataSource.defineAttribute('text', p => {
            return p.name;
        });
        label.dataSource = dataSource;

        getSatelliteData().then(data => {
            const parsedResult = parseTle(data);

            parsedResult.forEach((tle, i) => {
                // 卫星太多了不好看
                if (i < 6) {
                    const satellite = new SatelliteObject(tle);
                    satellite.addTo(engine);

                    const position = satellite.createSatelliteObject();
                    const trackLine = satellite._trackLine;
                    const features = [{
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: position.map(item => {
                                const position = item[1];
                                return [position.x, position.y, position.z];
                            }),
                        },
                        properties: {
                            crs: 'EPSG:4978',
                        },
                    }];
                    trackLine.dataSource.setData(features);
                    satelliteSet.add(satellite);
                }
            });
        });

        engine.addPrepareRenderListener(() => {
            // 使用全局时间流速值更新时间
            currentDate = new Date(currentDate.getTime() + window.timeFlowRate * 60 * 1000);

            // 检查是否经过了一天的时间
            if (currentDate.getTime() - initialDate.getTime() >= ONE_DAY_MS) {
                // 重置回初始时间
                currentDate = new Date(initialDate.getTime());
                console.log('已经过了一天，时间重置回初始时间');
            }

            const julianDate = JulianDate.fromIso8601(currentDate.toISOString());

            // 如果卫星对象已存在，更新其位置
            const features = [];
            satelliteSet.forEach(satellite => {
                const currentPosition = satellite.getCurrentPosition(currentDate);

                // 使用一次性转换，返回位置和矩阵
                const transformResult = convertIcrfToFixed(currentPosition, julianDate);

                if (transformResult) {
                    const trackLine = satellite._trackLine;

                    // 应用旋转
                    trackLine.rotation.set(
                        transformResult.euler.x,
                        transformResult.euler.y,
                        transformResult.euler.z
                    );

                    // 添加点位数据
                    const ecefPosition = transformResult.position;
                    features.push({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [ecefPosition.x, ecefPosition.y, ecefPosition.z],
                        },
                        properties: {
                            crs: 'EPSG:4978',
                            name: satellite.name,
                        },
                    });
                }
            });
            simplePoint.dataSource.setData(features);
            label.dataSource.setData(features);
        });

        // 清理函数
        return () => {
            if (engine) {
                engine.dispose();
            }
            // 移除时间控制器UI
            const timeController = document.querySelector('.time-control-container');
            if (timeController) {
                timeController.remove();
            }
            // 移除样式
            if (styleElement) {
                styleElement.remove();
            }
        };
    }, []);

    // 创建自定义滑块
    function createCustomSlider() {
        // 滑块参数设置
        const minValue = 0.17; // 10秒
        const maxValue = 5; // 5分钟
        const defaultValue = 1; // 默认值

        // 创建容器
        const container = document.createElement('div');
        container.className = 'time-control-container';

        // 添加标题
        const title = document.createElement('div');
        title.className = 'time-control-title';
        title.textContent = '时间流速控制';
        container.appendChild(title);

        // 添加标签
        const labels = document.createElement('div');
        labels.className = 'time-control-labels';

        const minLabel = document.createElement('span');
        minLabel.textContent = '10秒';

        const maxLabel = document.createElement('span');
        maxLabel.textContent = '5分钟';

        labels.appendChild(minLabel);
        labels.appendChild(maxLabel);
        container.appendChild(labels);

        // 创建滑块容器
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';

        // 创建滑块轨道
        const sliderTrack = document.createElement('div');
        sliderTrack.className = 'slider-track';

        // 创建填充部分
        const sliderFill = document.createElement('div');
        sliderFill.className = 'slider-fill';

        // 创建滑块拖动点
        const sliderThumb = document.createElement('div');
        sliderThumb.className = 'slider-thumb';

        // 组装滑块
        sliderTrack.appendChild(sliderFill);
        sliderContainer.appendChild(sliderTrack);
        sliderContainer.appendChild(sliderThumb);
        container.appendChild(sliderContainer);

        // 创建刻度标记
        const ticks = document.createElement('div');
        ticks.className = 'time-ticks';

        // 定义刻度点
        const tickValues = [
            {value: 0.17, label: '10s'},
            {value: 0.5, label: '30s'},
            {value: 1, label: '1m'},
            {value: 2, label: '2m'},
            {value: 3, label: '3m'},
            {value: 4, label: '4m'},
            {value: 5, label: '5m'},
        ];

        // 添加刻度
        tickValues.forEach(tick => {
            const position = ((tick.value - minValue) / (maxValue - minValue)) * 100;

            const tickMark = document.createElement('div');
            tickMark.className = 'time-tick';
            tickMark.style.left = `${position}%`;
            ticks.appendChild(tickMark);

            const tickLabel = document.createElement('div');
            tickLabel.className = 'time-tick-label';
            tickLabel.textContent = tick.label;
            tickLabel.style.left = `${position}%`;
            ticks.appendChild(tickLabel);
        });
        container.appendChild(ticks);

        // 添加值显示
        const valueDisplay = document.createElement('div');
        valueDisplay.className = 'time-control-value';
        valueDisplay.id = 'time-flow-value';
        container.appendChild(valueDisplay);

        // 添加到页面
        document.body.appendChild(container);

        // 初始化滑块位置和值
        const initialPercent = ((defaultValue - minValue) / (maxValue - minValue)) * 100;
        sliderThumb.style.left = `${initialPercent}%`;
        sliderFill.style.width = `${initialPercent}%`;
        window.timeFlowRate = defaultValue;
        updateTimeDisplay(defaultValue);

        // 添加滑块拖动事件
        let isDragging = false;

        // 鼠标按下事件
        sliderThumb.addEventListener('mousedown', startDrag);
        sliderTrack.addEventListener('mousedown', clickTrack);

        // 触摸事件支持
        sliderThumb.addEventListener('touchstart', startDrag);
        sliderTrack.addEventListener('touchstart', clickTrack);

        // 全局鼠标移动和释放事件
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', endDrag);

        function startDrag(e) {
            e.preventDefault();
            isDragging = true;
            sliderThumb.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        }

        function endDrag() {
            isDragging = false;
            sliderThumb.style.cursor = 'pointer';
            document.body.style.userSelect = '';
        }

        function clickTrack(e) {
            // 直接点击轨道时，立即移动滑块到点击位置
            const rect = sliderTrack.getBoundingClientRect();
            const trackWidth = rect.width;
            let clickX;

            if (e.type === 'touchstart') {
                clickX = e.touches[0].clientX - rect.left;
            }
            else {
                clickX = e.clientX - rect.left;
            }

            // 计算新的百分比位置
            let percent = (clickX / trackWidth) * 100;
            percent = Math.max(0, Math.min(100, percent));

            // 更新滑块位置
            sliderThumb.style.left = `${percent}%`;
            sliderFill.style.width = `${percent}%`;

            // 计算新的值
            const newValue = minValue + (percent / 100) * (maxValue - minValue);
            window.timeFlowRate = parseFloat(newValue.toFixed(2));

            // 更新显示
            updateTimeDisplay(window.timeFlowRate);
        }

        function drag(e) {
            if (!isDragging) {
                return;
            }

            e.preventDefault();

            const rect = sliderTrack.getBoundingClientRect();
            const trackWidth = rect.width;
            let dragX;

            if (e.type === 'touchmove') {
                dragX = e.touches[0].clientX - rect.left;
            }
            else {
                dragX = e.clientX - rect.left;
            }

            // 计算新的百分比位置
            let percent = (dragX / trackWidth) * 100;
            percent = Math.max(0, Math.min(100, percent));

            // 更新滑块位置
            sliderThumb.style.left = `${percent}%`;
            sliderFill.style.width = `${percent}%`;

            // 计算新的值
            const newValue = minValue + (percent / 100) * (maxValue - minValue);
            window.timeFlowRate = parseFloat(newValue.toFixed(2));

            // 更新显示
            updateTimeDisplay(window.timeFlowRate);
        }

        function updateTimeDisplay(value) {
            const valueDisplay = document.getElementById('time-flow-value');
            if (valueDisplay) {
                let displayText;
                if (value < 1) {
                    // 显示为秒
                    displayText = `当前流速: ${Math.round(value * 60)}秒/帧`;
                }
                else {
                    // 显示为分钟和秒
                    const minutes = Math.floor(value);
                    const seconds = Math.round((value - minutes) * 60);
                    if (seconds > 0) {
                        displayText = `当前流速: ${minutes}分${seconds}秒/帧`;
                    }
                    else {
                        displayText = `当前流速: ${minutes}分钟/帧`;
                    }
                }
                valueDisplay.textContent = displayText;
            }
        }
    }

    return (
        <div className="satellite" id="satellite"></div>
    );
}

async function getSatelliteData() {
    const res = await fetch(gpsdata).then(res => res.text());

    return res;
}

function parseTle(data = '') {
    if (data.length === 0) {
        return;
    }
    let result = data.split('\n');
    let tles = [];
    let i = 0;
    let tem = [];
    result.forEach(item => {
        i++;
        tem.push(item);
        if (i === 3) {
            tles.push(tem.join('\r\n'));
            tem = [];
            i = 0;
        }
    });
    return tles;
}

export default withSourceCode(Satellite);
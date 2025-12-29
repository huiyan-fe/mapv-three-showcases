/* eslint-disable @babel/new-cap */
import * as mapvthree from '@baidumap/mapv-three';
import initEngine from '../../utils/initEngine';
import {useEffect, useState, useRef} from 'react';
import {withSourceCode} from '../../utils/withSourceCode';
import {Card, Typography, Space, Button, Modal, Dropdown} from 'antd';
import {
    VideoCameraOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';
import {FFmpeg} from '@ffmpeg/ffmpeg';
import {fetchFile, toBlobURL} from '@ffmpeg/util';
// import classWorkerURL from '@ffmpeg/ffmpeg/dist/esm/worker?worker';
import PathToolPanel from './PathToolPanel';
import VideoRenderProgress from './VideoRenderProgress';
import {
    loadTrackerSettings,
    saveBaseMapSettings,
    loadBaseMapSettings,
    savePathData,
    loadPathData,
    saveViewSettings,
    loadViewSettings,
    loadRotateData,
    saveRotateData,
    loadTrackerType,
    saveTrackerType,
    TRACKER_MODE,
} from './storage';

// 配置百度地图 AK
mapvthree.BaiduMapConfig.ak = import.meta.env.VITE_BAIDU_MAP_AK;
// 配置 Cesium accessToken
mapvthree.CesiumConfig.accessToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN;

const {Title, Text} = Typography;

const center = [116.404, 39.915];

function PathTool() {

    const [isRendering, setIsRendering] = useState(false);

    // 渲染进度状态
    const [showProgress, setShowProgress] = useState(false);
    const [frameProgress, setFrameProgress] = useState(0);
    const [totalFrames, setTotalFrames] = useState(0);
    const [writeFileProgress, setWriteFileProgress] = useState(0);
    const [isExecuting, setIsExecuting] = useState(false);
    const [ffmpegLogs, setFfmpegLogs] = useState([]);
    const [ffmpegProgress, setFfmpegProgress] = useState(0);
    const [pathData, setPathData] = useState(() => loadPathData());
    const [rotateData, setRotateData] = useState(() => loadRotateData());
    const [baseMapSettings, setBaseMapSettings] = useState(() => loadBaseMapSettings());
    const [viewSettings, setViewSettings] = useState(() => loadViewSettings());
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);

    const editorRef = useRef(null);
    const pathTrackerRef = useRef(null);

    // rotate相关
    const rotateTrackerRef = useRef(null);
    const [trackerType, setTrackerType] = useState(() => loadTrackerType());

    const engineRef = useRef(null);

    // 更新路径数据并自动保存
    const updatePathData = newPathData => {
        setPathData(newPathData);
        savePathData(newPathData);
        console.log('路径数据已更新并保存:', newPathData);
    };

    // 更新旋转数据并自动保存
    const updateRotateData = newRotateData => {
        setRotateData(newRotateData);
        saveRotateData(newRotateData);
        console.log('旋转数据已更新并保存:', newRotateData);
    };

    // 保存当前视野参数
    const saveCurrentViewSettings = engine => {
        try {
            const center = engine.map.getCenter();
            const heading = Math.round(Number(engine.map.getHeading()));
            const pitch = Math.round(Number(engine.map.getPitch()));
            const range = Math.round(Number(engine.map.map.getRange()));

            const newViewSettings = {
                center: center,
                heading: heading,
                pitch: pitch,
                range: range,
            };

            setViewSettings(newViewSettings);
            saveViewSettings(newViewSettings);
            console.log('视野参数已保存:', newViewSettings);
        }
        catch (error) {
            console.error('保存视野参数失败:', error);
        }
    };

    const handlePathDataChange = () => {
        // 从 Editor 导出折线数据
        if (editorRef.current) {
            const data = editorRef.current.exportData(mapvthree.Editor.DrawerType.LINE);
            if (data && data.features && data.features.length > 0) {
                // 获取第一个折线要素的坐标
                const feature = data.features[0];
                if (feature.geometry.type === 'LineString' && feature.geometry.coordinates) {
                    const newPathData = feature.geometry.coordinates;
                    console.log('轨迹数据变化，新轨迹数据:', newPathData);
                    updatePathData(newPathData);
                }
            }
            else {
                console.log('没有有效的轨迹数据，清空pathData');
                updatePathData([]);
            }
        }
    };

    const handleRotateDataChange = () => {
        // 从 Editor 导出点数据
        if (editorRef.current) {
            const data = editorRef.current.exportData(mapvthree.Editor.DrawerType.POINT);
            if (data && data.features && data.features.length > 0) {
                // 获取第一个点要素的坐标
                const feature = data.features[0];
                if (feature.geometry.type === 'Point' && feature.geometry.coordinates) {
                    const newRotateData = feature.geometry.coordinates;
                    console.log('旋转中心点变化，新坐标:', newRotateData);
                    updateRotateData(newRotateData);
                }
            }
            else {
                updateRotateData([]);
            }
        }
    };

    const handleFinishDrawing = () => {
        console.log('完成绘制');

        setIsDrawing(false);
        setIsEditing(false);
    };

    const handleStartPathDrawing = () => {
        console.log('handleStartPathDrawing 被调用，当前 pathData.length:', pathData.length);
        if (!editorRef.current) {
            console.error('编辑器未初始化');
            return;
        }

        // 如果已有轨迹数据，弹出确认框
        if (pathData.length > 0) {
            console.log('检测到已有轨迹数据，弹出确认框');
            Modal.confirm({
                title: '确认重新绘制',
                content: '重新绘制轨迹会删除已有轨迹数据，是否继续？',
                okText: '确认',
                cancelText: '取消',
                onOk: () => {
                    console.log('用户确认重新绘制');
                    // 清空折线数据
                    editorRef.current.delete(mapvthree.Editor.DrawerType.LINE);
                    updatePathData([]);
                    // 设置类型并开始绘制折线
                    editorRef.current.type = mapvthree.Editor.DrawerType.LINE;
                    editorRef.current.setStyle({
                        strokeColor: '#00ff00',
                        strokeWidth: 5,
                        strokeOpacity: 1,
                    });
                    editorRef.current.start();
                    setIsDrawing(true);
                    console.log('开始绘制轨迹');
                },
                onCancel: () => {
                    console.log('用户取消重新绘制');
                },
            });
            return;
        }

        console.log('没有现有轨迹数据，直接开始绘制');
        // 设置类型并开始绘制折线
        editorRef.current.type = mapvthree.Editor.DrawerType.LINE;
        editorRef.current.setStyle({
            strokeColor: '#00ff00',
            strokeWidth: 5,
            strokeOpacity: 1,
        });
        editorRef.current.start();
        setIsDrawing(true);
        console.log('开始绘制轨迹');
    };

    const handleStartRotateDrawing = () => {
        if (!editorRef.current) {
            return;
        }

        // 清空点数据
        editorRef.current.delete(mapvthree.Editor.DrawerType.POINT);
        updateRotateData([]);

        // 设置类型并开始绘制点
        editorRef.current.type = mapvthree.Editor.DrawerType.POINT;
        editorRef.current.setStyle({
            fillColor: '#ff0000',
            pointRadius: 10,
            fillOpacity: 1,
        });
        editorRef.current.start();
        setIsDrawing(true);

        console.log('开始选择旋转中心点');
    };

    const handleStartDrawing = () => {
        if (trackerType === TRACKER_MODE.PATH) {
            handleStartPathDrawing();
        }
        else if (trackerType === TRACKER_MODE.ROTATE) {
            handleStartRotateDrawing();
        }
    };

    const updateLineEditorData = data => {
        // 将坐标数据导入到 Editor（只导入折线，不清空点数据）
        if (editorRef.current && data && data.length > 0) {
            const geojson = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: data,
                        },
                        properties: {},
                    },
                ],
            };
            // 先删除现有的折线数据
            editorRef.current.delete(mapvthree.Editor.DrawerType.LINE);
            // 导入新的折线数据
            editorRef.current.importData(geojson, {clear: false});
        }
    };

    const updatePointEditorData = data => {
        // 将坐标数据导入到 Editor（只导入点，不清空折线数据）
        if (editorRef.current && data && Array.isArray(data) && data.length >= 2) {
            const geojson = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: data,
                        },
                        properties: {},
                    },
                ],
            };
            // 先删除现有的点数据
            editorRef.current.delete(mapvthree.Editor.DrawerType.POINT);
            // 导入新的点数据
            editorRef.current.importData(geojson, {clear: false});
        }
    };

    const handleStartEditing = () => {
        if (!editorRef.current || pathData.length === 0) {
            console.error('无法编辑：编辑器未初始化或无轨迹数据');
            return;
        }

        // 确保数据已导入到 Editor
        updateLineEditorData(pathData);

        // 获取第一个折线要素并启用编辑
        const data = editorRef.current.exportData(mapvthree.Editor.DrawerType.LINE);
        if (data?.features?.[0]) {
            editorRef.current.enableEdit(data.features[0].id);
            setIsEditing(true);
        }
    };

    const handleFinishEditing = () => {
        if (editorRef.current) {
            editorRef.current.disableEdit();
            // 编辑完成后保存数据
            handlePathDataChange();
        }
        setIsEditing(false);
    };

    const handleTrackerSettingChange = (key, value, type) => {
        // 同步更新PathTracker的配置
        if (type === 'path' && pathTrackerRef.current) {
            if (key === 'interpolateDirectThreshold') {
                pathTrackerRef.current.interpolateDirectThreshold = value;
                console.log('更新PathTracker interpolateDirectThreshold:', value);
            }
            else if (key === 'lockView') {
                pathTrackerRef.current.lockView = value;
                console.log('更新PathTracker lockView:', value);
            }
        }
    };

    const handleImportPath = () => {
        console.log('导入轨迹文件');
        // 创建文件输入元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.geojson';
        input.onchange = event => {
            const file = event.target.files[0];
            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = e => {
                try {
                    const content = e.target.result;
                    const geoJsonData = JSON.parse(content);

                    // 提取第一个线段数据
                    const coordinates = extractFirstLineFromGeoJSON(geoJsonData);

                    if (coordinates && coordinates.length > 0) {
                        updatePathData(coordinates);
                        engineRef.current.map.setCenter([
                            coordinates[0][0],
                            coordinates[0][1],
                            Math.max(coordinates[0][2] || 0, 100),
                        ]);

                        updateLineEditorData(coordinates);
                        console.log('导入轨迹数据:', coordinates);
                        Modal.success({
                            title: '导入成功',
                            content: `成功导入 ${coordinates.length} 个轨迹点`,
                        });
                    }
                    else {
                        throw new Error('文件中未找到有效的线段数据');
                    }
                }
                catch (error) {
                    console.error('导入轨迹失败:', error);
                    Modal.error({
                        title: '导入失败',
                        content: `文件格式错误：${error.message}`,
                    });
                }
            };
            reader.readAsText(file);

            // 从GeoJSON中提取第一个线段数据
            function extractFirstLineFromGeoJSON(geoJsonData) {
                try {
                    // 处理单个Feature
                    if (geoJsonData.type === 'Feature') {
                        return extractCoordinatesFromGeometry(geoJsonData.geometry);
                    }

                    // 处理FeatureCollection
                    if (geoJsonData.type === 'FeatureCollection' && geoJsonData.features) {
                        for (const feature of geoJsonData.features) {
                            const coords = extractCoordinatesFromGeometry(feature.geometry);
                            if (coords) {
                                return coords;
                            }
                        }
                    }

                    // 处理直接的Geometry对象
                    if (geoJsonData.type && geoJsonData.coordinates) {
                        return extractCoordinatesFromGeometry(geoJsonData);
                    }

                    // 处理简单的坐标数组（兼容旧格式）
                    if (Array.isArray(geoJsonData) && geoJsonData.length > 0) {
                        return geoJsonData;
                    }

                    return null;
                }
                catch (error) {
                    console.error('提取线段数据失败:', error);
                    return null;
                }
            }

            // 从几何对象中提取坐标
            function extractCoordinatesFromGeometry(geometry) {
                if (!geometry || !geometry.type || !geometry.coordinates) {
                    return null;
                }

                switch (geometry.type) {
                    case 'LineString':
                        // LineString: coordinates 是坐标点数组
                        return geometry.coordinates;

                    case 'MultiLineString':
                        // MultiLineString: coordinates 是线段数组，取第一条线段
                        return geometry.coordinates[0] || null;

                    case 'Polygon':
                        // Polygon: coordinates 是环数组，取外环（第一个环）
                        return geometry.coordinates[0] || null;

                    case 'MultiPolygon':
                        // MultiPolygon: coordinates 是多边形数组，取第一个多边形的外环
                        return geometry.coordinates[0] && geometry.coordinates[0][0] || null;

                    default:
                        console.warn(`不支持的几何类型: ${geometry.type}`);
                        return null;
                }
            }
        };
        input.click();
    };



    const handlePastePath = async () => {
        console.log('粘贴轨迹数据');
        try {
            const text = await navigator.clipboard.readText();
            const data = JSON.parse(text);
            console.log('粘贴的轨迹数据:', data);
            // 处理粘贴的轨迹数据
            if (data && Array.isArray(data)) {
                updatePathData(data);
                updateLineEditorData(data);
            }
        }
        catch (error) {
            console.error('粘贴轨迹数据失败:', error);
            Modal.error({
                title: '粘贴失败',
                content: '剪贴板中的数据格式不正确，请确保是有效的轨迹数据。',
            });
        }
    };

    const pathPreview = trackerSettings => {
        if (!pathTrackerRef.current || pathData.length === 0) {
            console.error('无法预览：PathTracker未初始化或无轨迹数据');
            return;
        }

        // 将pathData转换为GeoJSON格式
        const coordinates = pathData;

        const trackData = {
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: coordinates,
            },
        };

        console.log('设置PathTracker轨迹数据:', trackData);
        pathTrackerRef.current.track = trackData;

        const pathTrackerSetting = trackerSettings[TRACKER_MODE.PATH];
        // 通过 Editor 的 render 管理器控制要素显示/隐藏
        if (editorRef.current) {
            if (pathTrackerSetting.showTrail) {
                editorRef.current.show(mapvthree.Editor.DrawerType.LINE);
            }
            else {
                editorRef.current.hide(mapvthree.Editor.DrawerType.LINE);
            }
            console.log('设置轨迹可见性:', pathTrackerSetting.showTrail);
        }

        // 使用tracker设置启动动画
        const startOptions = {
            duration: pathTrackerSetting.duration * 1000, // 转换为毫秒
            heading: pathTrackerSetting.heading,
            pitch: pathTrackerSetting.pitch,
            range: pathTrackerSetting.distance,
        };

        console.log('启动PathTracker动画，参数:', startOptions);
        pathTrackerRef.current.start(startOptions);
        setIsPreviewing(true);
        console.log('开始预览轨迹');
    };

    const rotatePreview = trackSettings => {
        if (!rotateTrackerRef.current || rotateData.length === 0) {
            console.error('无法预览：RotateTracker未初始化或无旋转数据');
            return;
        }

        const rotateSettings = trackSettings[TRACKER_MODE.ROTATE];
        const duration = rotateSettings.duration * 1000;
        const radius = rotateSettings.radius;
        const angle = rotateSettings.angle || 0;
        const loop = rotateSettings.loop;
        const repeatCount = rotateSettings.repeatCount || 1;

        rotateTrackerRef.current.start({
            duration: duration,
            center: rotateData,
            range: radius,
            angle: angle,
            keepRunning: loop,
            repeatCount: loop ? Infinity : repeatCount,
        });
        setIsPreviewing(true);
    };

    const handlePreviewPath = (trackerSettings, trackType) => {
        if (trackType === 'path') {
            pathPreview(trackerSettings);
        }
        else if (trackType === 'rotate') {
            rotatePreview(trackerSettings);
        }
    };

    const handleStopPreview = () => {
        if (pathTrackerRef.current) {
            pathTrackerRef.current.stop();
            console.log('停止预览轨迹');
            setIsPreviewing(false);
            // 恢复轨迹显示状态
            if (editorRef.current) {
                editorRef.current.show(mapvthree.Editor.DrawerType.LINE);
            }
        }
        if (rotateTrackerRef.current) {
            rotateTrackerRef.current.stop();
            console.log('停止预览旋转');
            setIsPreviewing(false);
        }
    };

    const handleRenderVideo = (videoSettings, trackerSettings) => {
        if (!engineRef.current || !pathTrackerRef.current || pathData.length === 0) {
            console.error('无法渲染视频：引擎未初始化或无轨迹数据');
            Modal.error({
                title: '渲染失败',
                content: '地图引擎未初始化或无轨迹数据，请检查后重试。',
            });
            return;
        }

        const trackData = {
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: pathData,
            },
        };
        pathTrackerRef.current.track = trackData;
        console.log('开始渲染视频');
        console.log('视频设置:', videoSettings);
        console.log('轨迹设置:', trackerSettings);

        // 重置进度状态
        setFrameProgress(0);
        setTotalFrames(0);
        setWriteFileProgress(0);
        setIsExecuting(false);
        setFfmpegLogs([]);
        setFfmpegProgress(0);
        setIsRendering(true);
        setShowProgress(true);

        try {
            // 解析分辨率
            const [width, height] = videoSettings.resolution.split('x').map(Number);


            // 创建视频配置
            const config = {
                fps: videoSettings.fps,
                width: width,
                height: height,
                pixelRatio: 2,
            };
            if (trackerType === TRACKER_MODE.PATH) {
                const pathSettings = trackerSettings[TRACKER_MODE.PATH];
                config.duration = pathSettings.duration;
                config.tracker = pathTrackerRef.current;
                config.trackerOptions = {
                    heading: pathSettings.heading,
                    pitch: pathSettings.pitch,
                    range: pathSettings.distance,
                };
            }
            else {
                const rotateSettings = trackerSettings[TRACKER_MODE.ROTATE];
                config.tracker = rotateTrackerRef.current;
                config.duration = rotateSettings.duration;
                config.trackerOptions = {
                    center: rotateData,
                    radius: rotateSettings.radius,
                    angle: rotateSettings.angle || 0,
                    repeatCount: 1,
                };
            }
            const videoConfig = new mapvthree.VideoConfig(config);

            const frameCount = videoConfig.frameCount;
            // 计算总帧数
            setTotalFrames(frameCount);

            // 设置进度回调
            videoConfig.onProgress = e => {
                console.log(`渲染进度: ${e.frameIndex}/${frameCount}`);
                setFrameProgress(e.frameIndex + 1);
            };

            console.log('视频配置:', videoConfig);

            // 开始渲染视频
            engineRef.current.renderVideo(videoConfig).then(async () => {
                console.log('图片序列渲染完成');
                const ffmpeg = new FFmpeg();
                ffmpeg.on('log', ({message}) => {
                    console.log('ffmpeg log:', message);
                    setFfmpegLogs([message]); // 只保存最新一条日志

                    // 解析frame进度
                    const frameMatch = message.match(/frame=\s*(\d+)/);
                    if (frameMatch) {
                        const currentFrame = parseInt(frameMatch[1], 10);
                        console.log('FFmpeg当前帧:', currentFrame);
                        setFfmpegProgress(currentFrame + 1);
                    }
                });

                // 使用本地打包的 ffmpeg 文件
                const baseUrl = import.meta.env.BASE_URL;
                const coreUrl = `${baseUrl}ffmpeg/core`;
                const ffmpegUrl = `${baseUrl}ffmpeg`;
                await ffmpeg.load({
                    coreURL: await toBlobURL(`${coreUrl}/ffmpeg-core.js`, 'text/javascript'),
                    wasmURL: await toBlobURL(`${coreUrl}/ffmpeg-core.wasm`, 'application/wasm'),
                    workerURL: await toBlobURL(`${ffmpegUrl}/worker.js`, 'text/javascript'),
                });
                for (let i = 0; i < frameCount; i++) {
                    const fileName = `frame_${String(i).padStart(5, '0')}.png`;
                    const fileHandle = await videoConfig.directoryHandle.getFileHandle(fileName);
                    const file = await fileHandle.getFile();
                    console.log(`写入文件: ${fileName} ${i}/${frameCount}`);
                    const fileData = await fetchFile(file);
                    await ffmpeg.writeFile(fileName, fileData);
                    // 更新写入文件进度
                    const writeProgress = Math.round(((i + 1) / frameCount) * 100);
                    setWriteFileProgress(writeProgress);
                }
                console.log('开始渲染视频');
                setIsExecuting(true); // 开始FFmpeg执行
                const outFile = `out.${videoSettings.format}`;
                await ffmpeg.exec([
                    '-start_number', '1',
                    '-framerate', videoSettings.fps + '',
                    '-i', 'frame_%05d.png',
                    '-vf', `scale=${width}:${height}`,
                    '-c:v', 'libx264',
                    '-crf', videoSettings.crf + '',
                    '-preset', videoSettings.preset,
                    '-pix_fmt', 'yuv420p',
                    outFile,
                ]);
                console.log('渲染视频完成');
                // 下载
                const data = await ffmpeg.readFile(outFile);
                console.log('读取文件完成');
                // 创建一个 Blob
                const blob = new Blob([data.buffer], {type: 'video/' + videoSettings.format});
                const fileHandle = await videoConfig.directoryHandle.getFileHandle(outFile, {create: true});
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
                setIsRendering(false);
                setShowProgress(false);
                Modal.success({
                    title: '渲染完成',
                    content: '视频渲染已完成！',
                });
            }).catch(error => {
                console.error('视频渲染失败:', error);
                setIsRendering(false);
                setShowProgress(false);
                Modal.error({
                    title: '渲染失败',
                    content: `视频渲染失败：${error.message || '未知错误'}`,
                });
            });

        }
        catch (error) {
            console.error('创建视频配置失败:', error);
            setIsRendering(false);
            setShowProgress(false);
            Modal.error({
                title: '配置错误',
                content: `创建视频配置失败：${error.message || '未知错误'}`,
            });
        }
    };

    // 从存储的状态中恢复pathTracker、轨迹和旋转中心
    const resumeTrackerData = () => {
        // 从本地存储读取设置并应用到PathTracker
        const trackerSettings = loadTrackerSettings();
        const pathSettings = trackerSettings[TRACKER_MODE.PATH];

        if (pathTrackerRef.current && pathData) {
            pathTrackerRef.current.viewMode = pathSettings.lockView ? 'lock' : 'follow';
            pathTrackerRef.current.interpolateDirectThreshold = pathSettings.interpolateDirectThreshold;
        }

        updateLineEditorData(pathData);
        updatePointEditorData(rotateData);
    };

    const handleCancelRender = () => {
        console.log('取消视频渲染');
        // 这里需要调用取消渲染的API
        if (engineRef.current && engineRef.current.cancelRenderVideo) {
            engineRef.current.cancelRenderVideo();
        }
        setIsRendering(false);
        setShowProgress(false);
        // 重置所有进度状态
        setFrameProgress(0);
        setTotalFrames(0);
        setWriteFileProgress(0);
        setIsExecuting(false);
        setFfmpegLogs([]);
    };

    const handleExportPath = () => {
        if (pathData.length === 0) {
            Modal.error({
                title: '导出失败',
                content: '没有轨迹数据可以导出',
            });
            return;
        }

        try {
            // 将pathData转换为GeoJSON格式
            const geoJson = {
                type: 'Feature',
                properties: {
                    name: '轨迹数据',
                    description: '从轨迹工具导出的轨迹数据',
                    timestamp: new Date().toISOString(),
                },
                geometry: {
                    type: 'LineString',
                    coordinates: pathData,
                },
            };

            // 创建下载文件
            const jsonString = JSON.stringify(geoJson, null, 2);
            const blob = new Blob([jsonString], {type: 'application/json'});
            const url = URL.createObjectURL(blob);

            // 创建下载链接
            const a = document.createElement('a');
            a.href = url;
            a.download = `trajectory_${new Date().getTime()}.geojson`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('轨迹导出成功', geoJson);
            Modal.success({
                title: '导出成功',
                content: '轨迹数据已导出为GeoJSON文件',
            });
        }
        catch (error) {
            console.error('导出轨迹失败:', error);
            Modal.error({
                title: '导出失败',
                content: `导出轨迹失败：${error.message || '未知错误'}`,
            });
        }
    };

    // 底图类型切换处理函数
    const handleBaseMapChange = key => {
        console.log('切换底图类型:', key);
        const newSettings = {
            ...baseMapSettings,
            type: key,
        };
        setBaseMapSettings(newSettings);
        // 自动保存到本地存储
        saveBaseMapSettings(newSettings);

        // 刷新页面以应用新的底图设置
        console.log('底图类型已保存，刷新页面...');
        window.location.reload();
    };

    // 投影切换处理函数
    const handleProjectionChange = projection => {
        console.log('切换投影:', projection);
        const newSettings = {
            ...baseMapSettings,
            projection: projection,
        };
        setBaseMapSettings(newSettings);
        // 自动保存到本地存储
        saveBaseMapSettings(newSettings);

        // 刷新页面以应用新的投影设置
        console.log('投影已保存，刷新页面...');
        window.location.reload();
    };

    const handleTrackerTypeChange = type => {
        setTrackerType(type);
        setIsEditing(false);
        handleStopPreview();

        // 保存跟踪类型
        saveTrackerType(type);
    };

    const handlePasteCenter = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const parts = text.split(',').map(s => parseFloat(s.trim()));
            if (parts.length === 3 && parts.every(v => !isNaN(v))) {
                updateRotateData(parts);
                updatePointEditorData(parts);
            }
            else {
                Modal.error({
                    title: '经纬度格式错误',
                    content: '请输入正确的经纬度，格式示例：110.123456, 35.654321, 100',
                });
            }
        }
        catch (err) {
            console.error('读取剪贴板失败:', err);
        }
    };

    const mapViewRef = useRef(null);

    useEffect(() => {
        const {engine} = initEngine({
            skyType: 'dynamic',
            documentId: 'map-container',
            center: viewSettings.center,
            pitch: viewSettings.pitch,
            range: viewSettings.range,
            projection: baseMapSettings.projection,
            enableAnimationLoop: true,
        });

        let mapView = null;
        console.log('底图设置', baseMapSettings);
        if (baseMapSettings.type === 'vector') {
            mapView = new mapvthree.MapView({
                terrainProvider: null,
                vectorProvider: new mapvthree.BaiduVectorTileProvider(),
            });
        }
        else if (baseMapSettings.type === 'terrain') {
            mapView = new mapvthree.MapView({
                terrainProvider: new mapvthree.CesiumTerrainTileProvider(),
            });
        }
        else {
            mapView = new mapvthree.MapView({
            });
        }

        engine.add(mapView);

        // 初始化 Editor（统一管理折线和点的绘制和编辑）
        const editor = engine.add(new mapvthree.Editor({
            enableMidpointHandles: false, // 不启用中点标记
        }));

        // 设置折线的默认样式
        editor.setStyle({
            strokeColor: '#00ff00',
            strokeWidth: 5,
            strokeOpacity: 1,
        }, mapvthree.Editor.DrawerType.LINE);

        // 设置点的默认样式
        editor.setStyle({
            fillColor: '#ff0000',
            pointRadius: 10,
            fillOpacity: 1,
        }, mapvthree.Editor.DrawerType.POINT);

        // 监听要素创建事件
        editor.addEventListener('created', event => {
            const feature = event.feature;
            if (feature.geometry.type === 'LineString') {
                console.log('折线要素创建:', feature.id);
                handlePathDataChange();
            }
            else if (feature.geometry.type === 'Point') {
                console.log('点要素创建:', feature.id);
                handleRotateDataChange();
            }
            handleFinishDrawing();
        });

        // 监听编辑结束事件
        editor.addEventListener('update', event => {
            if (!editorRef.current.isEditing) {
                return;
            }
            const feature = event?.feature;
            if (feature?.geometry?.type === 'LineString') {
                handlePathDataChange();
            }
            else if (feature?.geometry?.type === 'Point') {
                handleRotateDataChange();
            }
        });

        // 初始化PathTracker
        const pathTracker = engine.add(new mapvthree.PathTracker());

        // 监听预览结束事件
        pathTracker.onFinish = () => {
            console.log('PathTracker预览结束');
            setIsPreviewing(false);
            // 恢复轨迹显示状态
            if (editorRef.current) {
                editorRef.current.show(mapvthree.Editor.DrawerType.LINE);
            }
        };

        const rotateTracker = engine.add(new mapvthree.HorizontalOrbitTracker());
        rotateTracker.viewMode = 'lock';
        rotateTracker.onFinish = () => {
            console.log('RotateTracker预览结束');
            setIsPreviewing(false);
        };

        engineRef.current = engine;
        mapViewRef.current = mapView;
        editorRef.current = editor;
        pathTrackerRef.current = pathTracker;
        rotateTrackerRef.current = rotateTracker;

        window.editor = editor;
        resumeTrackerData();

        // 恢复保存的视野参数
        setTimeout(() => {
            try {
                engine.map.lookAt(viewSettings.center, {
                    heading: viewSettings.heading,
                    pitch: viewSettings.pitch,
                    range: viewSettings.range,
                });
                console.log('视野参数已恢复:', viewSettings);
            }
            catch (error) {
                console.error('恢复视野参数失败:', error);
            }
        }, 1000); // 延迟1秒确保地图完全初始化

        // 监听相机视野变化事件
        const handleViewChanged = () => {
            saveCurrentViewSettings(engine);
        };

        // 添加节流，避免频繁保存
        let viewChangeTimeout;
        const throttledHandleViewChanged = () => {
            clearTimeout(viewChangeTimeout);
            viewChangeTimeout = setTimeout(handleViewChanged, 1000); // 1秒后保存
        };

        engine.camera.addEventListener('viewchanged', throttledHandleViewChanged);

        return () => {
            clearTimeout(viewChangeTimeout);
            engine.camera.removeEventListener('viewchanged', throttledHandleViewChanged);
            // 销毁编辑器
            if (editorRef.current) {
                editorRef.current.destroy();
            }
            engine.dispose();
        };
    }, []);

    return (
        <div style={{height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
            {/* 顶部控制栏 */}
            <Card
                style={{borderRadius: 0, borderBottom: '1px solid #d9d9d9'}}
                styles={{body: {padding: '16px 24px'}}}
            >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Title level={3} style={{margin: 0, display: 'flex', alignItems: 'center'}}>
                        <VideoCameraOutlined style={{marginRight: 8, color: '#1890ff'}} />
                        轨迹视频导出工具
                    </Title>
                </div>
            </Card>

            {/* 主体内容 */}
            <div style={{flex: 1, display: 'flex', minHeight: 0}}>
                {/* 左侧配置面板 */}
                <PathToolPanel
                    trackerType={trackerType}
                    isRecording={isRendering}
                    pathData={pathData}
                    rotateData={rotateData}
                    setPathData={updatePathData}
                    isDrawing={isDrawing}
                    isEditing={isEditing}
                    isPreviewing={isPreviewing}
                    onStartDrawing={handleStartDrawing}
                    onStartEditing={handleStartEditing}
                    onFinishEditing={handleFinishEditing}
                    onPreviewPath={handlePreviewPath}
                    onStopPreview={handleStopPreview}
                    onTrackerSettingChange={handleTrackerSettingChange}
                    onImportPath={handleImportPath}
                    onPastePath={handlePastePath}
                    onRenderVideo={handleRenderVideo}
                    onExportPath={handleExportPath}
                    onExportRotate={handlePasteCenter}
                    onTrackerTypeChange={handleTrackerTypeChange}
                />

                {/* 右侧地图 */}
                <div id="map-container" style={{flex: 1, position: 'relative'}}>
                    {/* 底图选择器 */}
                    <div style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 1000,
                    }}
                    >
                        <Dropdown
                            menu={{
                                items: [
                                    {
                                        key: 'baseMapType',
                                        label: '底图类型',
                                        type: 'group',
                                        children: [
                                            {
                                                key: 'vector',
                                                label: '矢量地图',
                                            },
                                            {
                                                key: 'satellite',
                                                label: '卫星图',
                                            },
                                            {
                                                key: 'terrain',
                                                label: '地形图',
                                            },
                                        ],
                                    },
                                    {
                                        type: 'divider',
                                    },
                                    {
                                        key: 'projection',
                                        label: '投影方式',
                                        type: 'group',
                                        children: [
                                            {
                                                key: 'EPSG:3857',
                                                label: '平面投影',
                                            },
                                            {
                                                key: 'EPSG:4978',
                                                label: '地球投影',
                                            },
                                        ],
                                    },
                                ],
                                onClick: ({key}) => {
                                    if (['vector', 'satellite', 'terrain'].includes(key)) {
                                        handleBaseMapChange(key);
                                    }
                                    else if (['EPSG:3857', 'EPSG:4978'].includes(key)) {
                                        handleProjectionChange(key);
                                    }
                                },
                                selectedKeys: [baseMapSettings.type, baseMapSettings.projection],
                            }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Button
                                type="default"
                                icon={<AppstoreOutlined />}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid #d9d9d9',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                }}
                                title="底图选择"
                            >
                                底图
                            </Button>
                        </Dropdown>
                    </div>
                </div>
            </div>

            {/* 视频渲染进度弹窗 */}
            <VideoRenderProgress
                visible={showProgress}
                onCancel={handleCancelRender}
                frameProgress={frameProgress}
                totalFrames={totalFrames}
                writeFileProgress={writeFileProgress}
                isExecuting={isExecuting}
                ffmpegLogs={ffmpegLogs}
                ffmpegProgress={ffmpegProgress}
            />
        </div>
    );
}

export default withSourceCode(PathTool);
// 本地存储键名
const STORAGE_KEYS = {
    VIDEO_SETTINGS: 'pathTool_videoSettings',
    TRACKER_SETTINGS: 'pathTool_trackerSettings',
    BASE_MAP_SETTINGS: 'pathTool_baseMapSettings',
    PATH_DATA: 'pathTool_pathData',
    ROTATE_DATA: 'pathTool_rotateData',
    TRACKER_TYPE: 'pathTool_trackerType',
    VIEW_SETTINGS: 'pathTool_viewSettings',
};

// 默认配置
export const DEFAULT_VIDEO_SETTINGS = {
    resolution: '1920x1080',
    fps: 30,
    duration: 10,
    format: 'mp4',
    crf: 23, // 默认值，平衡质量和文件大小
    preset: 'medium', // 默认编码速度
};

export const TRACKER_MODE = {
    PATH: 'path',
    ROTATE: 'rotate',
};

export const DEFAULT_TRACKER_SETTINGS = {
    [TRACKER_MODE.PATH]: {
        duration: 10, // 秒
        heading: 0,
        pitch: 80,
        distance: 500,
        interpolateDirectThreshold: 50, // 转角平滑差值距离
        speed: 50,
        showTrail: true,
        lockView: true,
        height: 500,
    },
    [TRACKER_MODE.ROTATE]: {
        repeatCount: 1,
        radius: 100,
        angle: 10,
        duration: 10,
        speed: 15,
        loop: true,
    },
};

// 默认底图设置
export const DEFAULT_BASE_MAP_SETTINGS = {
    type: 'vector', // 底图类型：vector(矢量), satellite(卫星), terrain(地形)
    projection: 'EPSG:4978', // 投影：plane(平面), earth(地球)
};

// 默认路径数据
export const DEFAULT_PATH_DATA = [];

// 默认旋转数据
export const DEFAULT_ROTATE_DATA = [];

// 默认视野设置
export const DEFAULT_VIEW_SETTINGS = {
    center: [116.404, 39.915, 477.4208088854924], // 北京天安门
    heading: 0,
    pitch: 0,
    range: 10000,
};

export const DEFAULT_TRACKER_TYPE = TRACKER_MODE.PATH;

// 保存配置到本地存储
export const saveSettings = (key, settings) => {
    try {
        localStorage.setItem(key, JSON.stringify(settings));
        console.log(`保存配置到本地存储: ${key}`, settings);
    }
    catch (error) {
        console.error('保存配置失败:', error);
    }
};

// 从本地存储读取配置
export const loadSettings = (key, defaultSettings) => {
    try {
        const saved = localStorage.getItem(key);
        if (saved) {
            const parsed = JSON.parse(saved);
            console.log(`从本地存储读取配置: ${key}`, parsed);

            // 对于简单值类型（字符串、数字、布尔值、数组），直接返回
            if (key === STORAGE_KEYS.PATH_DATA
                || typeof parsed !== 'object'
                || Array.isArray(parsed)) {
                return parsed || defaultSettings;
            }

            // 对于对象类型，合并默认配置，确保新增的配置项有默认值
            return {...defaultSettings, ...parsed};
        }
    }
    catch (error) {
        console.error('读取配置失败:', error);
    }
    return defaultSettings;
};

// 保存视频设置
export const saveVideoSettings = settings => {
    saveSettings(STORAGE_KEYS.VIDEO_SETTINGS, settings);
};

// 读取视频设置
export const loadVideoSettings = () => {
    return loadSettings(STORAGE_KEYS.VIDEO_SETTINGS, DEFAULT_VIDEO_SETTINGS);
};

// 保存轨迹设置
export const saveTrackerSettings = settings => {
    saveSettings(STORAGE_KEYS.TRACKER_SETTINGS, settings);
};

// 读取轨迹设置
export const loadTrackerSettings = () => {
    return loadSettings(STORAGE_KEYS.TRACKER_SETTINGS, DEFAULT_TRACKER_SETTINGS);
};

// 保存底图设置
export const saveBaseMapSettings = baseMapSettings => {
    saveSettings(STORAGE_KEYS.BASE_MAP_SETTINGS, baseMapSettings);
};

// 读取底图设置
export const loadBaseMapSettings = () => {
    return loadSettings(STORAGE_KEYS.BASE_MAP_SETTINGS, DEFAULT_BASE_MAP_SETTINGS);
};

// 保存路径数据
export const savePathData = pathData => {
    saveSettings(STORAGE_KEYS.PATH_DATA, pathData);
};

// 读取路径数据
export const loadPathData = () => {
    return loadSettings(STORAGE_KEYS.PATH_DATA, DEFAULT_PATH_DATA);
};

// 保存旋转数据
export const saveRotateData = rotateData => {
    saveSettings(STORAGE_KEYS.ROTATE_DATA, rotateData);
};

// 读取路径数据
export const loadRotateData = () => {
    return loadSettings(STORAGE_KEYS.ROTATE_DATA, DEFAULT_ROTATE_DATA);
};

// 保存跟踪
export const saveTrackerType = trackerType => {
    saveSettings(STORAGE_KEYS.TRACKER_TYPE, trackerType);
};

// 读取跟踪
export const loadTrackerType = () => {
    return loadSettings(STORAGE_KEYS.TRACKER_TYPE, DEFAULT_TRACKER_TYPE);
};

// 保存视野设置
export const saveViewSettings = viewSettings => {
    saveSettings(STORAGE_KEYS.VIEW_SETTINGS, viewSettings);
};

// 读取视野设置
export const loadViewSettings = () => {
    return loadSettings(STORAGE_KEYS.VIEW_SETTINGS, DEFAULT_VIEW_SETTINGS);
};
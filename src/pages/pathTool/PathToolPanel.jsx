import {useState, useEffect} from 'react';
import {
    Card,
    Typography,
    Space,
    Button,
    Select,
    Slider,
    Switch,
    Form,
    InputNumber,
} from 'antd';
import {
    SettingOutlined,
    EditOutlined,
    PlayCircleOutlined,
    StopOutlined,
    ImportOutlined,
    CopyOutlined,
    VideoCameraOutlined,
    DownloadOutlined,
} from '@ant-design/icons';
import {
    loadVideoSettings,
    saveVideoSettings,
    loadTrackerSettings,
    saveTrackerSettings,
    TRACKER_MODE,
} from './storage';

const {Title, Text} = Typography;
const {Option} = Select;

function PathToolPanel({
    trackerType,
    isRecording,
    rotateData,
    pathData,
    setPathData,
    isDrawing,
    isEditing,
    isPreviewing,
    onStartDrawing,
    onStartEditing,
    onFinishEditing,
    onPreviewPath,
    onStopPreview,
    onTrackerSettingChange,
    onImportPath,
    onPastePath,
    onRenderVideo,
    onExportPath,
    onTrackerTypeChange,
    onExportRotate,
}) {
    const [form] = Form.useForm();
    const [rotateForm] = Form.useForm();
    const [videoSettings, setVideoSettings] = useState(() => loadVideoSettings());
    const [trackerSettings, setTrackerSettings] = useState(() => loadTrackerSettings());

    const resolutionOptions = [
        {label: '1280×720 (HD)', value: '1280x720'},
        {label: '1920×1080 (Full HD)', value: '1920x1080'},
        {label: '2560×1440 (2K)', value: '2560x1440'},
        {label: '3840×2160 (4K)', value: '3840x2160'},
    ];

    const formatOptions = [
        {label: 'MP4', value: 'mp4'},
        {label: 'MOV', value: 'mov'},
        {label: 'AVI', value: 'avi'},
    ];

    const presetOptions = [
        {label: '超快速 (ultrafast)', value: 'ultrafast'},
        {label: '超级快 (superfast)', value: 'superfast'},
        {label: '很快 (veryfast)', value: 'veryfast'},
        {label: '中等 (medium)', value: 'medium'},
        {label: '慢 (slow)', value: 'slow'},
        {label: '更慢 (slower)', value: 'slower'},
    ];

    const handleVideoSettingChange = (key, value) => {
        const newSettings = {
            ...videoSettings,
            [key]: value,
        };
        setVideoSettings(newSettings);
        // 自动保存到本地存储
        saveVideoSettings(newSettings);
    };

    const handleTrackerSettingChange = (key, value, type = trackerType) => {
        const newSettings = {
            ...trackerSettings,
            [type]: {
                ...trackerSettings[type],
                [key]: value,
            },
        };
        setTrackerSettings(newSettings);
        // 自动保存到本地存储
        saveTrackerSettings(newSettings);
        // 同步到Tracker
        if (onTrackerSettingChange) {
            onTrackerSettingChange(key, value, type);
        }
    };

    function getPathTrackerSetting() {
        return (
            <>
                <Title level={4} style={{marginBottom: 16, display: 'flex', alignItems: 'center'}}>
                    <SettingOutlined style={{marginRight: 8}} />
                    轨迹设置
                </Title>
                <Form form={form} layout="vertical" size="small">
                    {/* 轨迹操作按钮 */}
                    <div style={{marginBottom: 16}}>
                        <Space direction="vertical" style={{width: '100%'}} size="small">
                            <Space style={{width: '100%'}} size="small">
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={onStartDrawing}
                                    style={{flex: 1}}
                                    disabled={isRecording || isDrawing || isEditing}
                                    loading={false}
                                >
                                    {isDrawing ? '正在绘制' : '绘制轨迹'}
                                </Button>
                                <Button
                                    type="default"
                                    icon={<ImportOutlined />}
                                    onClick={onImportPath}
                                    style={{flex: 1}}
                                    disabled={isRecording || isDrawing || isEditing}
                                >
                                    导入轨迹
                                </Button>
                                <Button
                                    type="default"
                                    icon={<CopyOutlined />}
                                    onClick={onPastePath}
                                    style={{flex: 1}}
                                    disabled={isRecording || isDrawing || isEditing}
                                >
                                    粘贴轨迹
                                </Button>
                            </Space>
                            <Space style={{width: '100%'}} size="small">
                                <Button
                                    type={isEditing ? 'primary' : 'default'}
                                    icon={<EditOutlined />}
                                    onClick={isEditing ? onFinishEditing : onStartEditing}
                                    style={{flex: 1}}
                                    disabled={isRecording || (pathData.length === 0 && !isEditing)}
                                >
                                    {isEditing ? '完成编辑' : '编辑轨迹'}
                                </Button>
                                <Button
                                    type="default"
                                    icon={<DownloadOutlined />}
                                    onClick={onExportPath}
                                    style={{flex: 1}}
                                    disabled={isRecording || pathData.length === 0 || isDrawing || isEditing}
                                >
                                    导出轨迹
                                </Button>
                            </Space>
                        </Space>
                    </div>

                    <Form.Item label="动画时长">
                        <InputNumber
                            min={1}
                            max={60}
                            value={trackerSettings[TRACKER_MODE.PATH].duration}
                            onChange={value => handleTrackerSettingChange('duration', value, TRACKER_MODE.PATH)}
                            addonAfter="秒"
                            style={{width: '100%'}}
                        />
                    </Form.Item>
                    <Form.Item label={`相机方向角(${trackerSettings[TRACKER_MODE.PATH].heading}°)`}>
                        <Slider
                            min={0}
                            max={360}
                            value={trackerSettings[TRACKER_MODE.PATH].heading}
                            onChange={value => handleTrackerSettingChange('heading', value, TRACKER_MODE.PATH)}
                            tooltip={{formatter: value => `${value}°`}}
                        />
                    </Form.Item>
                    <Form.Item label={`相机俯仰角(${trackerSettings[TRACKER_MODE.PATH].pitch}°)`}>
                        <Slider
                            min={0}
                            max={90}
                            value={trackerSettings[TRACKER_MODE.PATH].pitch}
                            onChange={value => handleTrackerSettingChange('pitch', value, TRACKER_MODE.PATH)}
                            tooltip={{formatter: value => `${value}°`}}
                        />
                    </Form.Item>
                    <Form.Item label="相机距离">
                        <InputNumber
                            min={0}
                            value={trackerSettings[TRACKER_MODE.PATH].distance}
                            onChange={value => handleTrackerSettingChange('distance', value, TRACKER_MODE.PATH)}
                            addonAfter="米"
                            style={{width: '100%'}}
                        />
                    </Form.Item>
                    <Form.Item label="转角平滑距离">
                        <InputNumber
                            min={0}
                            value={trackerSettings[TRACKER_MODE.PATH].interpolateDirectThreshold}
                            onChange={value => handleTrackerSettingChange(
                                'interpolateDirectThreshold',
                                value,
                                TRACKER_MODE.PATH
                            )}
                            addonAfter="米"
                            style={{width: '100%'}}
                        />
                    </Form.Item>
                    <Space direction="vertical" style={{width: '100%'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Text>显示轨迹</Text>
                            <Switch
                                checked={trackerSettings[TRACKER_MODE.PATH].showTrail}
                                onChange={checked => handleTrackerSettingChange(
                                    'showTrail',
                                    checked,
                                    TRACKER_MODE.PATH
                                )}
                            />
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Text>锁定视野</Text>
                            <Switch
                                checked={trackerSettings[TRACKER_MODE.PATH].lockView}
                                onChange={checked => handleTrackerSettingChange('lockView', checked, TRACKER_MODE.PATH)}
                            />
                        </div>
                    </Space>

                    {/* 预览轨迹按钮 */}
                    <div style={{marginTop: 16}}>
                        <Button
                            type={isPreviewing ? 'danger' : 'default'}
                            icon={isPreviewing ? <StopOutlined /> : <PlayCircleOutlined />}
                            onClick={isPreviewing ? onStopPreview : () => onPreviewPath(trackerSettings, trackerType)}
                            block
                            disabled={isRecording || pathData.length === 0 || isDrawing || isEditing}
                        >
                            {isPreviewing ? '停止预览' : '预览轨迹'}
                        </Button>
                    </div>
                </Form>
            </>
        );
    }

    function getRotateTrackerSetting() {
        const formatCenter = (coords = []) => {
            if (!Array.isArray(coords) || coords.length === 0) {
                return '';
            }
            const [lng = 0, lat = 0, alt = 0] = coords;
            const flng = parseFloat(lng).toFixed(6);
            const flat = parseFloat(lat).toFixed(6);
            const falt = parseFloat(alt).toFixed(2);
            return `${flng}, ${flat}, ${falt}`;
        };

        return (
            <>
                <Title level={4} style={{marginBottom: 16, display: 'flex', alignItems: 'center'}}>
                    <SettingOutlined style={{marginRight: 8}} />
                    旋转设置
                </Title>
                <Form form={rotateForm} layout="vertical" size="small">
                    <Form.Item label="旋转中心点">
                        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                            <Text code style={{width: '100%', wordBreak: 'break-all'}}>
                                {formatCenter(rotateData)}
                            </Text>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={onStartDrawing}
                                    disabled={isRecording || isDrawing || isEditing}
                                >
                                    地图选点
                                </Button>
                                <Button
                                    type="default"
                                    icon={<CopyOutlined />}
                                    onClick={onExportRotate}
                                    disabled={isRecording || isDrawing || isEditing}
                                >
                                    粘贴
                                </Button>
                            </Space>
                        </div>
                    </Form.Item>
                    <Form.Item label="旋转时长">
                        <InputNumber
                            min={1}
                            max={100}
                            value={trackerSettings[TRACKER_MODE.ROTATE].duration}
                            onChange={value =>
                                handleTrackerSettingChange('duration', value, TRACKER_MODE.ROTATE)
                            }
                            addonAfter="秒"
                            style={{width: '100%'}}
                        />
                    </Form.Item>
                    <Form.Item label="旋转半径">
                        <InputNumber
                            min={1}
                            max={Infinity}
                            value={trackerSettings[TRACKER_MODE.ROTATE].radius}
                            onChange={value => handleTrackerSettingChange('radius', value, TRACKER_MODE.ROTATE)}
                            addonAfter="米"
                            style={{width: '100%'}}
                        />
                    </Form.Item>
                    <Form.Item label={`观察角度(${trackerSettings[TRACKER_MODE.ROTATE].angle}°)`}>
                        <Slider
                            min={0}
                            max={80}
                            value={trackerSettings[TRACKER_MODE.ROTATE].angle}
                            onChange={value => handleTrackerSettingChange('angle', value, TRACKER_MODE.ROTATE)}
                            tooltip={{formatter: value => `${value}°`}}
                        />
                    </Form.Item>
                    <Form.Item label={`旋转次数(${trackerSettings[TRACKER_MODE.ROTATE].repeatCount}次)`}>
                        <Slider
                            min={0}
                            max={10}
                            value={trackerSettings[TRACKER_MODE.ROTATE].repeatCount}
                            onChange={value => handleTrackerSettingChange('repeatCount', value, TRACKER_MODE.ROTATE)}
                            tooltip={{formatter: value => `${value}次`}}
                        />
                    </Form.Item>
                    <Form.Item label="循环播放">
                        <Switch
                            checked={trackerSettings[TRACKER_MODE.ROTATE].loop}
                            onChange={checked =>
                                handleTrackerSettingChange('loop', checked, TRACKER_MODE.ROTATE)
                            }
                        />
                    </Form.Item>

                    {/* 预览轨迹按钮 */}
                    <div style={{marginTop: 16}}>
                        <Button
                            type={isPreviewing ? 'danger' : 'default'}
                            icon={isPreviewing ? <StopOutlined /> : <PlayCircleOutlined />}
                            onClick={
                                isPreviewing
                                    ? onStopPreview
                                    : () => onPreviewPath(trackerSettings, trackerType)
                            }
                            block
                            disabled={isRecording || isDrawing || isEditing}
                        >
                            {isPreviewing ? '停止预览' : '预览旋转'}
                        </Button>
                    </div>
                </Form>
            </>
        );
    }


    return (
        <Card
            style={{
                width: 350,
                borderRadius: 0,
                borderRight: '1px solid #d9d9d9',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
            styles={{
                body: {
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                },
            }}
        >
            <div style={{flex: 1, overflowX: 'hidden', padding: '0 14px'}}>
                {/* 轨迹设置 */}
                <div style={{padding: 16, borderBottom: '1px solid #f0f0f0'}}>
                    <Form.Item label="跟踪类型">
                        <Select value={trackerType} onChange={onTrackerTypeChange}>
                            <Option value="path">轨迹跟踪</Option>
                            <Option value="rotate">旋转跟踪</Option>
                        </Select>
                    </Form.Item>
                    <>
                        {trackerType === TRACKER_MODE.PATH && getPathTrackerSetting()}
                        {trackerType === TRACKER_MODE.ROTATE && getRotateTrackerSetting()}
                    </>
                </div>

                {/* 视频设置 */}
                <div style={{padding: 16, borderBottom: '1px solid #f0f0f0'}}>
                    <Title level={4} style={{marginBottom: 16}}>视频设置</Title>
                    <Form layout="vertical" size="small">
                        <Form.Item label="分辨率">
                            <Select
                                value={videoSettings.resolution}
                                onChange={value => handleVideoSettingChange('resolution', value)}
                            >
                                {resolutionOptions.map(option => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="帧率">
                            <Select
                                value={videoSettings.fps}
                                onChange={value => handleVideoSettingChange('fps', value)}
                            >
                                <Option value={24}>24 FPS</Option>
                                <Option value={30}>30 FPS</Option>
                                <Option value={60}>60 FPS</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="格式">
                            <Select
                                value={videoSettings.format}
                                onChange={value => handleVideoSettingChange('format', value)}
                            >
                                {formatOptions.map(option => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="CRF值"
                            tooltip="18接近无损，23默认平衡，28较差但文件更小"
                        >
                            <Slider
                                min={18}
                                max={28}
                                step={1}
                                value={videoSettings.crf}
                                onChange={value => handleVideoSettingChange('crf', value)}
                                marks={{
                                    18: '18(无损)',
                                    23: '23(默认)',
                                    28: '28(小文件)',
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="编码速度"
                            tooltip="编码速度和压缩率的权衡：快速编码文件较大，慢速编码文件较小"
                        >
                            <Select
                                value={videoSettings.preset}
                                onChange={value => handleVideoSettingChange('preset', value)}
                            >
                                {presetOptions.map(option => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* 渲染视频按钮 */}
                        <div style={{marginTop: 16}}>
                            <Button
                                type="primary"
                                icon={<VideoCameraOutlined />}
                                onClick={() => onRenderVideo(videoSettings, trackerSettings)}
                                block
                                disabled={
                                    isRecording || pathData.length === 0 || isDrawing || isEditing || isPreviewing
                                }
                                loading={isRecording}
                            >
                                {isRecording ? '正在渲染...' : '渲染视频'}
                            </Button>
                        </div>
                    </Form>
                </div>


            </div>
        </Card>
    );
}

export default PathToolPanel;
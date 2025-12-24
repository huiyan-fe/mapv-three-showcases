import {Modal, Progress, Button, Typography, Space, Divider} from 'antd';
import {CloseOutlined, LoadingOutlined} from '@ant-design/icons';
import {useState, useEffect} from 'react';

const {Title, Text} = Typography;

function VideoRenderProgress({
    visible,
    onCancel,
    frameProgress,
    totalFrames,
    writeFileProgress,
    isExecuting,
    ffmpegLogs,
    ffmpegProgress,
}) {
    const [latestLog, setLatestLog] = useState('');

    useEffect(() => {
        if (ffmpegLogs && ffmpegLogs.length > 0) {
            setLatestLog(ffmpegLogs[ffmpegLogs.length - 1]); // 只保留最新一条日志
        }
    }, [ffmpegLogs]);

    const framePercent = totalFrames > 0 ? Math.round((frameProgress / totalFrames) * 100) : 0;
    const writePercent = writeFileProgress || 0;
    const ffmpegPercent = totalFrames > 0 ? Math.round((ffmpegProgress / totalFrames) * 100) : 0;

    return (
        <Modal
            title={null}
            open={visible}
            footer={null}
            closable={false}
            centered
            width={600}
            maskClosable={false}
            destroyOnClose
            styles={{
                body: {padding: '24px'},
                mask: {backgroundColor: 'rgba(0, 0, 0, 0.8)'},
            }}
        >
            <div style={{textAlign: 'center'}}>
                <Title level={3} style={{marginBottom: 24, color: '#1890ff'}}>
                    <LoadingOutlined style={{marginRight: 8}} />
                    视频渲染中...
                </Title>

                <Space direction="vertical" style={{width: '100%'}} size="large">
                    {/* 第一个进度条：图片序列导出 */}
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 8,
                        }}
                        >
                            <Text strong>1. 导出图片序列</Text>
                            <Text type="secondary">{frameProgress}/{totalFrames} 帧</Text>
                        </div>
                        <Progress
                            percent={framePercent}
                            status={framePercent === 100 ? 'success' : 'active'}
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                        />
                    </div>

                    {/* 第二个进度条：写入文件 */}
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 8,
                        }}
                        >
                            <Text strong>2. 载入图片序列</Text>
                            <Text type="secondary">{writePercent}%</Text>
                        </div>
                        <Progress
                            percent={writePercent}
                            status={writePercent === 100 ? 'success' : 'active'}
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                        />
                    </div>

                    {/* 第三个进度条：FFmpeg执行 */}
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 8,
                        }}
                        >
                            <Text strong>3. 渲染视频</Text>
                            <Text type="secondary">
                                {isExecuting
                                    ? `${ffmpegProgress}/${totalFrames} 帧`
                                    : '等待中'
                                }
                            </Text>
                        </div>
                        <Progress
                            percent={isExecuting ? ffmpegPercent : 0}
                            status={isExecuting ? 'active' : 'normal'}
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                        />
                    </div>

                    {/* FFmpeg日志显示 */}
                    {isExecuting && latestLog && (
                        <>

                            <div>

                                <div style={{
                                    background: '#f5f5f5',
                                    border: '1px solid #d9d9d9',
                                    borderRadius: 4,
                                    padding: 12,
                                    fontFamily: 'monospace',
                                    fontSize: 12,
                                    color: '#666',
                                    wordBreak: 'break-all',
                                }}
                                >
                                    {latestLog}
                                </div>
                            </div>
                        </>
                    )}

                    {/* 取消按钮 */}
                    <div style={{marginTop: 24}}>
                        <Button
                            type="default"
                            danger
                            icon={<CloseOutlined />}
                            onClick={onCancel}
                            size="large"
                        >
                            取消渲染
                        </Button>
                    </div>
                </Space>
            </div>
        </Modal>
    );
}

export default VideoRenderProgress;
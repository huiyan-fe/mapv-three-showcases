import {useNavigate} from 'react-router-dom';
import {Tag, Tooltip, Modal, Carousel} from 'antd';
import {motion} from 'framer-motion';
import {useState} from 'react';
import urlJoin from 'url-join';

const DIV = motion.div;

const colorList = [
    'magenta', 'red', 'volcano', 'orange', 'gold', 'lime',
    'green', 'cyan', 'blue', 'geekblue', 'purple',
];
function getTagColor(tag) {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colorList[Math.abs(hash) % colorList.length];
}

const ShowcaseCard = ({title, image, images = [], path, tags = [], publicPath}) => {
    const navigate = useNavigate();
    const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);

    const isVideoPath = path => {
        return path.toLowerCase().endsWith('.mp4') || path.toLowerCase().endsWith('.webm');
    };

    const handleClick = () => {
        if (isVideoPath(path)) {
            setIsVideoModalVisible(true);
        }
        else {
            // 构建完整的URL
            const fullPath = urlJoin(publicPath, path);
            window.open(fullPath, '_blank');
        }
    };

    const handleVideoModalClose = () => {
        setIsVideoModalVisible(false);
    };

    // 处理图片展示逻辑
    const renderImages = () => {
        // 如果提供了 images 数组且长度大于 0，使用轮播
        if (images && images.length > 0) {
            return (
                <Carousel
                    autoplay
                    autoplaySpeed={2000}
                    dots={false}
                    style={{
                        height: '100%',
                    }}
                >
                    {images.map(img => (
                        <div key={img}>
                            <div
                                className="card-image"
                                style={{backgroundImage: `url(${img})`}}
                            />
                        </div>
                    ))}
                </Carousel>
            );
        }
        // 否则展示单张图片
        return <div className="card-image" style={{backgroundImage: `url(${image})`}} />;
    };

    return (
        <>
            <DIV
                className="showcase-card"
                onClick={handleClick}
                whileHover={{y: -5}}
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.3}}
            >
                {renderImages()}
                <div className="card-content">
                    <Tooltip title={title}>
                        <h3>{title}</h3>
                    </Tooltip>
                    {Array.isArray(tags) && tags.length > 0 && (
                        <div style={{marginTop: 8}}>
                            {tags.map(tag => (
                                <Tag
                                    color={getTagColor(tag)}
                                    key={tag}
                                    style={{marginRight: 4, marginBottom: 4}}
                                >
                                    {tag}
                                </Tag>
                            ))}
                        </div>
                    )}
                </div>
            </DIV>

            <Modal
                title={title}
                open={isVideoModalVisible}
                onCancel={handleVideoModalClose}
                footer={null}
                width={null}
                centered
            >
                <video
                    controls
                    style={{width: '100%'}}
                    src={path}
                    autoPlay
                    loop
                >
                    您的浏览器不支持视频播放
                </video>
            </Modal>
        </>
    );
};

export default ShowcaseCard;
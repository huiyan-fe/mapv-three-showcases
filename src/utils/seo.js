// 主站点为 lbs.baidu.com，lbsyun.baidu.com 是其镜像，canonical 统一指向主站点
export const SITE_URL = 'https://lbs.baidu.com/jsapithree/showcase';

const setHeadTag = (selector, tagName, attrs) => {
    let tag = document.head.querySelector(selector);
    if (!tag) {
        tag = document.createElement(tagName);
        document.head.appendChild(tag);
    }
    Object.entries(attrs).forEach(([key, value]) => tag.setAttribute(key, value));
};

/**
 * 按路由更新 canonical、og:url、twitter:url
 * @param {string} pathname 路由路径（不含 basename），如 / 或 /cityPhotogrammetry
 */
export const updateCanonical = pathname => {
    const url = `${SITE_URL}${pathname}`;
    setHeadTag('link[rel="canonical"]', 'link', {rel: 'canonical', href: url});
    setHeadTag('meta[property="og:url"]', 'meta', {property: 'og:url', content: url});
    setHeadTag('meta[name="twitter:url"]', 'meta', {name: 'twitter:url', content: url});
};

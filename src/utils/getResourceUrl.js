/**
 * 获取页面资源的完整 URL
 * 根据环境变量 VITE_BOS_ASSETS_BASE_URL 决定使用 BOS URL 还是本地资源
 *
 * @param {string} pageName - 页面名称（如 'donghu', 'mall'）
 * @param {string} resourcePath - 资源路径（如 'assets/donghu_building1.glb' 或 'data/border.geojson'）
 * @returns {string} 完整的资源 URL
 */
export function getPageResourceUrl(pageName, resourcePath) {
    const baseUrl = import.meta.env.VITE_BOS_ASSETS_BASE_URL;

    // 如果未配置 BOS 基础 URL，使用本地相对路径（开发环境）
    if (!baseUrl) {
        // 返回相对于项目根目录的路径，Vite 会自动处理
        const cleanPath = resourcePath.replace(/^\.\//, '').replace(/^\.\.\//, '');
        return `/src/pages/${pageName}/${cleanPath}`;
    }

    // 使用 BOS URL
    // 移除路径开头的 ./ 或 ../
    const cleanPath = resourcePath.replace(/^\.\//, '').replace(/^\.\.\//, '');
    return `${baseUrl}/${pageName}/${cleanPath}`;
}


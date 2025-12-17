/**
 * Vite插件：自动生成sitemap.xml
 * 根据showcases数据自动生成站点地图
 */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function viteSitemapPlugin(options = {}) {
    const {
        hostname = 'https://lbsyun.baidu.com/jsapithree/showcase',
        showcasesPath = '../src/data/showcases.js',
        outputPath = 'sitemap.xml',
    } = options;

    return {
        name: 'vite-plugin-sitemap',
        apply: 'build', // 只在构建时运行
        closeBundle() {
            try {
                // 读取showcases配置
                const showcasesFilePath = path.resolve(__dirname, showcasesPath);
                const showcasesContent = fs.readFileSync(showcasesFilePath, 'utf-8');

                // 简单解析showcases数组（假设格式固定）
                const showcasesMatch = showcasesContent.match(/export const showcases = \[([\s\S]*?)\];/);
                if (!showcasesMatch) {
                    console.warn('无法解析showcases.js文件');
                    return;
                }

                // 使用eval解析（注意：这只在构建时运行，不会有安全问题）
                const showcasesArray = eval(`[${showcasesMatch[1]}]`);

                const now = new Date().toISOString().split('T')[0];

                // 生成sitemap XML
                let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- 首页 -->
  <url>
    <loc>${hostname}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
`;

                // 为每个showcase生成URL条目
                showcasesArray.forEach((showcase, index) => {
                    if (!showcase.path || showcase.path.startsWith('./videos/')) {
                        return; // 跳过视频和无效路径
                    }

                    const priority = index < 5 ? 0.9 : 0.8;
                    const imagePath = showcase.image?.startsWith('./')
                        ? showcase.image.replace('./', '/')
                        : showcase.image;

                    xml += `
  <!-- ${showcase.title} -->
  <url>
    <loc>${hostname}${showcase.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>`;

                    if (imagePath) {
                        xml += `
    <image:image>
      <image:loc>${hostname}${imagePath}</image:loc>
      <image:title>${showcase.title}</image:title>
    </image:image>`;
                    }

                    xml += `
  </url>
`;
                });

                xml += `
</urlset>
`;

                // 写入文件到构建输出目录
                const outDir = path.resolve(process.cwd(), 'showcase');
                const outputFilePath = path.resolve(outDir, outputPath);

                // 确保目录存在
                if (!fs.existsSync(outDir)) {
                    fs.mkdirSync(outDir, {recursive: true});
                }

                fs.writeFileSync(outputFilePath, xml, 'utf-8');
                console.log('\x1b[32m✓\x1b[0m sitemap.xml 已自动生成到构建目录');
            }
            catch (error) {
                console.error('生成sitemap失败:', error);
            }
        },
    };
}


export default function glslPlugin() {
    return {
        name: 'vite-plugin-glsl',
        transform(code, id) {
            if (id.endsWith('.glsl')) {
                return {
                    code: 'export default `' + code + '`;',
                };
            }
        },
    };
}

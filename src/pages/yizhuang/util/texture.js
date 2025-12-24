import {
    TextureLoader,
    RepeatWrapping,
    Vector2,
} from 'three';
const textureLoader = new TextureLoader();
const getTexture = (path, repeat) => {
    const texture = textureLoader.load(import.meta.env.VITE_PUBLIC_PATH + path);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat = repeat;
    return texture;
};

export const getPbrTextureParams = (textureChannels, repeat) => {
    if (!repeat) {
        repeat = new Vector2(0.5, 0.5);
    }

    const parameters = {
    };
    if (textureChannels.diffuse) {
        parameters.map = getTexture(textureChannels.diffuse, repeat);
    }
    if (textureChannels.normal) {
        parameters.normalMap = getTexture(textureChannels.normal, repeat);
    }
    if (textureChannels.roughness) {
        parameters.roughnessMap = getTexture(textureChannels.roughness, repeat);
    }
    if (textureChannels.emissive) {
        parameters.emissiveMap = getTexture(textureChannels.emissive, repeat);
    }
    return parameters;
};

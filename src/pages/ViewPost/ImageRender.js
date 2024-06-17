import React from 'react';
import './ImageRender.css';

function ImageRender({ base64Image, imgType, hideImage, index }) {
    return <div className='ImageBackground' onClick={() => hideImage(index)}><img src={`data:image/${imgType};base64,${base64Image}`} alt="" /></div>;
}

export default ImageRender;
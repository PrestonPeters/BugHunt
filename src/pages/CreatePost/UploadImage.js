import React from 'react';
import './UploadImage.css';

function UploadImage({onImageChange, onImageRemove, images}) {
    const handleImageChange = (e) => {
        e.preventDefault();
        onImageChange(e.target.files[0]);
    }

    const handleImageRemove = (e, image) => {
        e.preventDefault();
        onImageRemove(image);
    }

    return (
        <div className='UploadImageBox'>
            <input type="file" onChange={(e) => {
                e.stopPropagation();
                handleImageChange(e);
            }}/>
            {images && images.map((image, index) => (
                <div className="HorizontalImageRemove" key={index}>
                    <p>{image.name}</p>
                    <button onClick={(e) => {
                        e.stopPropagation();
                        handleImageRemove(e, image);
                        }}>Remove</button>
                </div>
            ))}
        </div>
    );
}

export default UploadImage;
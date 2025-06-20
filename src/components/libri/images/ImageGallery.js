import React, {useState} from 'react';

const ImageGallery = ({id, images, API_URL}) => {
    const [selectedImage, setSelectedImage] = useState(images.length > 0 ? images[0] : null);
    const [previousImage, setPreviousImage] = useState(selectedImage);
    const [showPopup, setShowPopup] = useState(false);

    const handleImageClick = () => {
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div className="relative">
            {/* Thumbnail image display */}
            <div className="bg-white p-4 rounded-lg shadow-md">
                {selectedImage && (
                    <img
                        src={`${API_URL}/${id}/name/${selectedImage}`}
                        alt={selectedImage}
                        className="max-w-full h-auto rounded-md mx-auto cursor-pointer"
                        style={{maxHeight: '500px', objectFit: 'contain'}}
                        onClick={handleImageClick}
                    />
                )}
                <div className="mt-4 w-full text-center text-gray-500 text-sm italic">
                    {selectedImage ? 'Clicca sull\'immagine per ingrandirla' : 'Nessuna immagine disponibile'}
                </div>
            </div>

            {/* Thumbnail navigation (if you have multiple images) */}
            {images.length > 1 && (
                <div className="mt-4 flex flex-wrap justify-center">
                    {images.map((image, index) => (
                        <img
                            key={index}
                            src={`${API_URL}/${id}/name/${image}`}
                            alt={`Thumbnail ${index}`}
                            className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                                selectedImage === image ? 'border-red-600' : 'border-gray-200'
                            }`}
                            onClick={() => {
                                setSelectedImage(image);
                                setPreviousImage(selectedImage);
                            }}
                            onMouseEnter={() => setSelectedImage(image)}
                            onMouseLeave={() => setSelectedImage(previousImage)}
                        />
                    ))}
                </div>
            )}

            {/* Popup overlay */}
            {showPopup && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                    onClick={closePopup}>
                    <div
                        className="relative bg-white p-4 rounded-lg shadow-lg max-w-4xl mx-4"
                        onClick={e => e.stopPropagation()}>
                        <button
                            className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 text-2xl"
                            onClick={closePopup}>
                            ×
                        </button>

                        <img
                            src={`${API_URL}/${id}/name/${selectedImage}`}
                            alt={selectedImage}
                            className="max-w-full h-auto rounded-md mx-auto"
                            style={{maxHeight: '80vh', objectFit: 'contain'}}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
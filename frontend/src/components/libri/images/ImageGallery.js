import React, {useState} from 'react';

const ImageGallery = ({id, images, API_URL, onView}) => {
    const [selectedImage, setSelectedImage] = useState(images === -1 ? -1 : 0);
    const [showPopup, setShowPopup] = useState(false);

    const handleImageClick = () => {
        console.log("Image clicked, calling onView");
        setShowPopup(true);
        onView();
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div className="relative">

            <div className="bg-white p-4 rounded-lg shadow-md">
                {selectedImage >= 0 && (
                    <img
                        src={`${API_URL}/${id}/index/${selectedImage}`}
                        alt='Cannot load image, please try again later'
                        className="max-w-full h-auto rounded-md mx-auto cursor-pointer"
                        style={{height: '500px', objectFit: 'contain'}}
                        onClick={handleImageClick}
                    />
                )}

                <div className="mt-4 w-full text-center text-gray-500 text-sm italic">
                    {selectedImage === -1 ? 'Nessuna immagine disponibile' : 'Clicca sull\'immagine per ingrandirla'}
                </div>
            </div>

            {/* Thumbnail navigation (if you have multiple images) */}
            {images > 0 && (
                <div className="mt-4 flex flex-wrap justify-center items-center">

                    {Array.from({length: Math.min(images, 10)}, (_, image) => (
                        <div key={image} className="relative cursor-pointer " onMouseEnter={() => {
                            setSelectedImage(image);
                        }}>
                            <img
                                src={`${API_URL}/${id}/index/${image}`}
                                alt={`Thumbnail ${image}`}
                                className={`w-16 h-16 object-cover rounded border-2 ${
                                    selectedImage === image ? 'border-red-600' : 'border-gray-200'
                                }`}
                            />

                            {image === 9 && images > 10 && (
                                <div
                                    className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white text-lg font-bold rounded">
                                    +{images - 10}
                                </div>
                            )}
                        </div>
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
                            src={`${API_URL}/${id}/index/${selectedImage}`}
                            alt={selectedImage}
                            className="max-w-full h-auto rounded-md mx-auto px-5"
                            style={{maxHeight: '80vh', objectFit: 'contain'}}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
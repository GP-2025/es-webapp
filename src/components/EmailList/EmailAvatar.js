import React, { useState } from "react";

const EmailAvatar = ({ alt, pictureURL }) => {
    const [imgError, setImgError] = useState(false);
    const [recipientImgError, setRecipientImgError] = useState(false);

    const handleImageError = (isRecipient) => {
        if (isRecipient) {
            setRecipientImgError(true);
        } else {
            setImgError(true);
        }
    };

    const renderFallbackAvatar = () => (
        <div className="hidden md:flex lg:flex w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center">
            <span className="text-white text-md font-medium">
                {alt?.charAt(0).toUpperCase()}
            </span>
        </div>
    );

    if (pictureURL && pictureURL !== "Empty") {
        return (
            <img
                src={pictureURL}
                alt={alt}
                className="hidden md:flex lg:flex w-8 h-8 rounded-full"
                onError={() => handleImageError(true)}
            />
        );
    }

    if (alt) {
        return renderFallbackAvatar();
    }
};

export default EmailAvatar;

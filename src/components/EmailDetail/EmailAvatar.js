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
        <div className="hidden md:flex lg:flex w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center">
            <span className="text-white text-lg font-medium">
                {alt?.charAt(0).toUpperCase()}
            </span>
        </div>
    );

    if (
        pictureURL &&
        pictureURL !== "Empty" &&
        pictureURL !== "https://emailingsystemapi.runasp.net/"
    ) {
        return (
            <img
                src={pictureURL}
                alt={alt}
                className="hidden md:flex lg:flex w-10 h-10 rounded-full"
                onError={() => handleImageError(true)}
            />
        );
    }

    if (alt) {
        return renderFallbackAvatar();
    }
};

export default EmailAvatar;

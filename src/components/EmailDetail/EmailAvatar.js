import React, { useState } from "react";

const EmailAvatar = ({ picture, alt, isSent, receiverPictureURL }) => {
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
        <div className="hidden md:flex lg:flex me-3 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center">
            <span className="text-white text-lg font-medium">
                {alt?.charAt(0).toUpperCase()}
            </span>
        </div>
    );

    if (
        !isSent &&
        receiverPictureURL &&
        receiverPictureURL !== "Empty" &&
        !recipientImgError
    ) {
        return (
            <img
                src={receiverPictureURL}
                alt={alt}
                className="hidden md:flex lg:flex me-3 w-10 h-10 rounded-full"
                onError={() => handleImageError(true)}
            />
        );
    }
    if (isSent && picture && picture !== "Empty" && !imgError) {
        return (
            <img
                src={picture}
                alt={alt}
                className="hidden md:flex lg:flex me-3 w-10 h-10 rounded-full"
                onError={() => handleImageError(false)}
            />
        );
    }

    if (alt) {
        return renderFallbackAvatar();
    }
};

export default EmailAvatar;

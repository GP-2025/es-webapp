import React, { useState } from "react";

const EmailAvatar = ({ senderPictureURL, alt, isSent, receiverPictureURL }) => {
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
        <div className="me-4 hidden md:flex lg:flex w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-md font-medium">
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
                className="me-4 hidden md:flex lg:flex w-8 h-8 rounded-full"
                onError={() => handleImageError(true)}
            />
        );
    }
    if (
        isSent &&
        senderPictureURL &&
        senderPictureURL !== "Empty" &&
        !imgError
    ) {
        return (
            <img
                src={senderPictureURL}
                alt={alt}
                className="me-4 hidden md:flex lg:flex w-8 h-8 rounded-full"
                onError={() => handleImageError(false)}
            />
        );
    }

    if (alt) {
        return renderFallbackAvatar();
    }
};

export default EmailAvatar;

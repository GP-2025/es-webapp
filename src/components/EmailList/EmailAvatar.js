import React, { useState } from "react";

const EmailAvatar = ({ picture, alt, isSent, recipientPicture }) => {
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
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
      <span className="text-white text-md font-medium">
        {alt?.charAt(0).toUpperCase()}
      </span>
    </div>
  );

  if (
    !isSent &&
    recipientPicture &&
    recipientPicture !== "Empty" &&
    !recipientImgError
  ) {
    return (
      <img
        src={recipientPicture}
        alt={alt}
        className="w-8 h-8 rounded-full"
        onError={() => handleImageError(true)}
      />
    );
  }
  if (isSent && picture && picture !== "Empty" && !imgError) {
    return (
      <img
        src={picture}
        alt={alt}
        className="w-8 h-8 rounded-full"
        onError={() => handleImageError(false)}
      />
    );
  }

  if (alt) {
    return renderFallbackAvatar();
  }
};

export default EmailAvatar;

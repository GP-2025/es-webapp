import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import EmailDetail from "../components/EmailDetail";
import { conversationsService } from "../services/conversationsService";

const SearchPage = ({ messages }) => {
  const navigate = useNavigate();

  const location = useLocation();
  // console.log("location", location);
  const email = location.state?.email;
  const fromSearch = location.state?.fromSearch;
  const fromSearchList = location.state?.fromSearchList;

  // If no email is passed, show a message or redirect
  if (!email) {
    return <Navigate to="/home/inbox" replace />;
  }

  const handleGoBack = () => {
    if (fromSearchList) {
      window.history.go(-2);
    } else {
      window.history.go(-1);
    }
  };

  const handleDelete = () => {
    // Implement delete logic
  };

  const handleArchive = async (emailId) => {
    try {
      await conversationsService.changeConversationStatus(emailId, "Archived");
      handleGoBack(); // Navigate back after archiving
    } catch (error) {
      console.error("Error archiving:", error);
    }
  };
  const handleStar = async (emailId) => {
    try {
      await conversationsService.changeConversationStatus(emailId, "Starred");
    } catch (error) {
      console.error("Error removing from starred:", error);
    }
  };
  const emailObject = {
    id: email,
  };
  return (
    <>
      <EmailDetail
        fromSearch={fromSearch}
        email={email.id ? email : emailObject}
        onGoBack={handleGoBack}
        onDelete={handleDelete}
        onArchive={handleArchive}
        isArchived={false}
        onToggleStar={handleStar}
        isStarred={false}
        messages={messages}
      />
    </>
  );
};

export default SearchPage;

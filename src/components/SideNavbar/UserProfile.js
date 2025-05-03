// UserProfile.jsx
import React from "react";
import { FiMenu } from "react-icons/fi";
import SearchInput from "../Search";

const UserProfile = ({
  user,
  isOpen,
  handleToggleSidebar,
  setsettingsOpen,
}) => {
  return (
    <div className="absolute top-0 w-full bg-gray-50 flex items-center justify-endpx-2">
      <div className="w-full flex items-center justify-between p-2 bg-gray-50">
        <div className="flex">
          <button
            onClick={() => {
              handleToggleSidebar(!isOpen);
              setsettingsOpen(false);
            }}
            className="p-3 rounded-xl bg-gray-300 hover:bg-gray-400 focus:outline-offset-2 focus:outline-gray-500 transition"
          >
            <FiMenu className="text-2xl text-gray-600" />
          </button>
        </div>

        <div className="ms-auto flex items-center gap-3">
          <div className="">
            <h3 className="text-base font-semibold text-gray-800 truncate">
              <span className="hidden sm:inline">
                {user?.name || "Unknown"}
              </span>
              <span className="sm:hidden ">
                {(user?.name || "Unknown").split(" ").slice(0, 2).join(" ")}
              </span>
            </h3>
            <p className="text-sm text-gray-500 truncate">
              <span className="hidden sm:inline">
                {user?.email || "Unknown@fci.com"}
              </span>
              <span className="sm:hidden">
                {(user?.email || "Unknown@fci.com").split("@")[0]}
              </span>
            </p>
          </div>
          <img
            src={
              (user?.profilePicture != "Empty" && user?.profilePicture) ||
              (user?.pictureURL != "Empty" && user?.pictureURL) ||
              "/nophto.jpg"
            }
            alt={`${user?.name || "User"}'s profile`}
            className="w-12 h-12 rounded-xl object-cover"
          />
        </div>
      </div>
      <SearchInput />
    </div>
  );
};
export default UserProfile;

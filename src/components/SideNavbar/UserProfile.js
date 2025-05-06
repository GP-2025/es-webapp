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
    <div className="absolute top-0 w-full bg-gray-100 flex items-center justify-endpx-2">
      <div className="w-full flex items-center justify-between p-2">
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

        <div className="ms-auto relative">
          <div className="flex items-center gap-3 relative">
            <div className="hover:cursor-pointer group">
              <div className="pb-1">
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
              <div className="absolute end-0 hidden group-hover:block hover:block top-full  border border-gray-400 bg-gray-100 bg-opacity-50 backdrop-blur-xl shadow-lg rounded-lg p-3 z-10">
                <h3 className="text-base font-bold text-gray-800 truncate">
                  <span className="">
                    {user?.role || "Unknown"}
                  </span>
                </h3>
                <p className="text-base font-semibold text-gray-800 truncate">
                  <span className="">
                    {user?.name || "Unknown"}
                  </span>
                </p>
                <p className="text-sm text-gray-500 truncate">
                  <span className="">
                    {user?.email || "Unknown@fci.com"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SearchInput />
    </div>
  );
};
export default UserProfile;

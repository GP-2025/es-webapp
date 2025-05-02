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
    <div className="relative w-[100vw] bg-gray-50 border-gray-200 flex items-center justify-end py-2 px-2">
      <div className="fixed top-0 left-0 w-full bg-gray-50 border-gray-200 flex items-center justify-between py-2 px-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              handleToggleSidebar(!isOpen);
              setsettingsOpen(false);
            }}
            className="p-3 me-3 rounded-xl bg-gray-300 hover:bg-gray-400 transition"
          >
            <FiMenu className="text-2xl text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <img
              src={
                (user?.profilePicture != "Empty" && user?.profilePicture) ||
                (user?.pictureURL != "Empty" && user?.pictureURL) ||
                "/nophto.jpg"
              }
              alt={`${user?.name || "User"}'s profile`}
              className="w-12 h-12 rounded-xl object-cover"
            />

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
          </div>
        </div>
      </div>
      <SearchInput />
    </div>
  );
};
export default UserProfile;

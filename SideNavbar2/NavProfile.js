import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiMenu } from "react-icons/fi";
import { toggleSidebar } from "../../store/slices/authSlice";

const NavProfile = ({ isOpen, setsettingsOpen }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleToggleSidebar = (value) => {
    dispatch(toggleSidebar(value));
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-gray-50 border-gray-200 flex items-center justify-between py-2 px-2">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => {
            handleToggleSidebar(!isOpen);
            setsettingsOpen(false);
          }}
          className="p-3 rounded-3xl bg-gray-200 hover:bg-blue-100 transition"
        >
          <FiMenu className="text-xl text-gray-600" />
        </button>
        <div className="flex items-center space-x-4">
          <img
            src={user?.profilePicture || "/nophto.jpg"}
            alt={`${user?.name || "User"}'s profile`}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="text-base font-semibold text-gray-800 truncate">
              {user?.name || "Mostafa Soliman"}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {user?.email || "Mostafa@fci.com"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavProfile;

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { User, Lock, HelpCircle, AlertCircle } from "lucide-react";
import { setCookie } from "../../utils/cookieUtils";
import { authService } from "../../services/authService";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // You would normally get these from your Redux store
  const { isLoading, error, isLoggedIn } = useSelector(
    (state) =>
      state.auth || {
        isLoading: false,
        error: null,
        isLoggedIn: false,
      }
  );

  const [loginError, setLoginError] = useState(null);
  const [helpPopoverAnchor, setHelpPopoverAnchor] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoginError(null);

      const response = await authService.login(data);

      if (response.accessToken) {
        if (data.password === response.nationalId) {
          setCookie("token2", response.accessToken);
          navigate("/login/firsttime");
        } else {
          setCookie("token", response.accessToken);
          navigate("/home/inbox");
        }
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please check your credentials.";
      setLoginError(errorMessage);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/mail.png')",
        backgroundSize: "50%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "rgba(255, 255, 255, 0.5)", // Blue tint (blue-400 with opacity)
        backgroundBlendMode: "overlay", // Creates a nice blend between the image and background color
      }}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-md max-h-[60vh] w-full flex flex-col md:flex-row overflow-hidden">
        {/* Left side is now removed as we have a full screen background */}

        {/* Login form */}
        <div className="w-full p-8">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6 capitalize">Sign in</h1>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full space-y-4"
            >
              <div className="relative">
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email format",
                    },
                  }}
                  render={({ field }) => (
                    <div>
                      <div className="relative">
                        <input
                          id="email"
                          type="text"
                          placeholder="Your Name"
                          className={`w-full p-3 border ${
                            errors.email ? "border-red-500" : "border-gray-300"
                          } rounded-lg pl-10`}
                          {...field}
                        />
                        <div className="absolute left-3 top-3 text-gray-400">
                          <User size={20} />
                        </div>
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-red-500 text-sm">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="relative">
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                  render={({ field }) => (
                    <div>
                      <div className="relative">
                        <input
                          id="password"
                          type="password"
                          placeholder="Password"
                          className={`w-full p-3 border ${
                            errors.password
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg pl-10`}
                          {...field}
                        />
                        <div className="absolute left-3 top-3 text-gray-400">
                          <Lock size={20} />
                        </div>
                        <div
                          className="absolute right-3 top-3 text-gray-400 cursor-pointer"
                          onMouseEnter={(e) =>
                            setHelpPopoverAnchor(e.currentTarget)
                          }
                          onMouseLeave={() => setHelpPopoverAnchor(null)}
                        >
                          <HelpCircle size={20} />

                          {/* Help Popover */}
                          {helpPopoverAnchor && (
                            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-10">
                              <h3 className="font-medium text-gray-900 mb-1">
                                Login Help
                              </h3>
                              <p className="text-sm text-gray-600">
                                If this is your first time logging in, please
                                use your National ID as your password. You will
                                be prompted to change your password after
                                successful login.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-red-500 text-sm">
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Error Messages */}
              {(loginError || error) && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center">
                  <AlertCircle size={16} className="mr-2" />
                  <span>{loginError || error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-400 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Log in"
                )}
              </button>

              {/* Support button from the provided code */}
              <div className="mt-6">
                <button
                  type="button"
                  className="w-full border border-purple-600 text-purple-600 font-medium py-2 px-4 rounded-lg flex items-center justify-center"
                  onClick={() => navigate("/support")}
                >
                  <HelpCircle size={16} className="mr-2" />
                  Contact Admin
                </button>
                <p className="text-center text-gray-500 text-sm mt-2">
                  Need help? Contact our support team.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

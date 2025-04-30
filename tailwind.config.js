// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      height: {
        "screen-navbar": "calc(100vh - 4rem)",
      },
      minHeight: {
        "email-item": "88px",
      },
      transitionProperty: {
        width: "width",
        spacing: "margin, padding",
      },
    },
  },
  plugins: [],
};

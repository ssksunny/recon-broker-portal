import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Matches recon-frontend's brand accent so the two apps read as
        // one product family, even though brokers never see the admin app.
        brand: {
          50: "#fffceb",
          400: "#ffe94d",
          500: "#FFDE00",
          600: "#e6c700",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;

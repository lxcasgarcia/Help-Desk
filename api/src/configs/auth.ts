export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || "lucas",
    expiresIn: "1d",
  },
};

export const getAbsoluteUrl = (path = "/") => {
  if (process.env.NODE_ENV === "development") {
    return `http://localhost:3000${path}`;
  }
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
};

const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  info(payload: unknown, message: string) {
    if (isDevelopment) {
      console.info(message, payload);
      return;
    }

    console.info(message);
  },
  error(payload: unknown, message: string) {
    if (isDevelopment) {
      console.error(message, payload);
      return;
    }

    console.error(message);
  },
};

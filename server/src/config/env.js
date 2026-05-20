export const env = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_key_change_me',
  duplicateWindowMinutes: Number(process.env.DUPLICATE_WINDOW_MINUTES || 30),
};

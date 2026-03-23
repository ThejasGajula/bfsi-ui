const envValue =
  import.meta.env.VITE_APP_ENV ||
  import.meta.env.VITE_ENV ||
  import.meta.env.MODE ||
  "";

export const appEnv = String(envValue).toLowerCase();
export const isDemoMode = appEnv === "demo";

// Support for filling defaults in dev mode
export const isFillDefaults = Boolean(
  import.meta.env.VITE_FILL_DEFAULTS === "true" ||
  import.meta.env.VITE_FILL_DEFAULTS === true,
);

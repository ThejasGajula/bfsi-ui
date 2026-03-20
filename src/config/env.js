const envValue =
  import.meta.env.VITE_APP_ENV ||
  import.meta.env.VITE_ENV ||
  import.meta.env.MODE ||
  '';

export const appEnv = String(envValue).toLowerCase();
export const isDemoMode = appEnv === 'demo';

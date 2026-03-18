const defaultAdminBase = "adminshuvo";

const clean = (value: string) => value.replace(/^\/+|\/+$/g, "");

export const ADMIN_BASE_PATH = clean(import.meta.env.VITE_ADMIN_BASE_PATH || defaultAdminBase);
export const ADMIN_LOGIN_PATH = `/${ADMIN_BASE_PATH}`;
export const ADMIN_DASHBOARD_PATH = `/${ADMIN_BASE_PATH}/dashboard`;

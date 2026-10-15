// Prefix a site path with the configured base (e.g. /SGportfolio/).
export const url = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

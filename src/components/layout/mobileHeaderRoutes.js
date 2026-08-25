export const MOBILE_PRIMARY_ROUTES = ['/', '/order', '/orders', '/profile'];

export function isMobilePrimaryRoute(pathname) {
  return MOBILE_PRIMARY_ROUTES.includes(pathname);
}

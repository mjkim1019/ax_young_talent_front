export const ROUTES = {
  home: '/',
  outputOptions: '/output-options',
  qa: '/qa',
  promptPreview: '/prompt-preview',
  sharedGallery: '/shared-gallery',
  final: '/final'
} as const;

export type AppRouteKey = keyof typeof ROUTES;

export function getRoute(key: AppRouteKey): string {
  return ROUTES[key];
}

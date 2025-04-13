import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',  // <-- Prerender the root
    renderMode: RenderMode.Prerender
  },
  {
    path: 'coffee',  // <-- Explicitly prerender this route
    renderMode: RenderMode.Prerender
  },
  {
    path: '**',  // <-- Fallback for other routes
    renderMode: RenderMode.Prerender
  }
];
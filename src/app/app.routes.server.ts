import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'budgets/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'forecast/:id',
    renderMode: RenderMode.Client
  }
];

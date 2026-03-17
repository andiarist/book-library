import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'library', loadComponent: () => import('./pages/library/library-page') },
  { path: 'search', loadComponent: () => import('./pages/search/search-page') },
  { path: '**', redirectTo: 'library' },
];

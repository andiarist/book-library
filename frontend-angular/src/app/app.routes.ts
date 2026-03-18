import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'library', loadComponent: () => import('./features/library/library-page') },
  { path: 'search', loadComponent: () => import('./features/search/search-page') },
  { path: '**', redirectTo: 'library' },
];

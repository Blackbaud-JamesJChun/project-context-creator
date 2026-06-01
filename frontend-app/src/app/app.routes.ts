import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home'),
  },
  {
    path: 'context/:id',
    loadComponent: () => import('./context/context-shell'),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./context/dashboard/dashboard') },
      { path: 'timeline', loadComponent: () => import('./context/timeline/timeline') },
      { path: 'search', loadComponent: () => import('./context/search/search') },
      { path: 'sources', loadComponent: () => import('./context/sources/sources') },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./not-found'),
  },
];

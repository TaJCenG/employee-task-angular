import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent),
    children: [
      {
        path: 'tasks',
        loadComponent: () => import('./dashboard/task-list/task-list').then(m => m.TaskListComponent)
      },
      {
        path: 'tasks/:id',
        loadComponent: () => import('./tasks/task-detail').then(m => m.TaskDetailComponent)
      },
      {
        path: 'admin/users',
        canActivate: [AuthGuard],
        loadComponent: () => import('./admin/users').then(m => m.UsersComponent)
      },
      {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full'
      }
    ]
  },
  // Separate routes for add/edit (not nested under dashboard to keep URLs clean but still protected)
  {
    path: 'tasks/add',
    canActivate: [AuthGuard],
    loadComponent: () => import('./tasks/add-task').then(m => m.AddTaskComponent)
  },
  {
    path: 'tasks/edit/:id',
    canActivate: [AuthGuard],
    loadComponent: () => import('./tasks/edit-task').then(m => m.EditTaskComponent)
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
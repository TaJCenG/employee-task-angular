# EmployeeTask

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.12.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Complete Project Structure Explanation

Below is a **detailed walkthrough** of every folder and file in the `employee-task` Angular 21 application, along with why each part exists and how they work together.

### 📂 Root Level Files

| File | Purpose |
|------|---------|
| `package.json` | Lists dependencies (`@angular/core`, `json-server`, `concurrently`) and scripts (`start:all` runs both Angular and json‑server). |
| `angular.json` | Angular CLI configuration – defines project name, build options, output paths (`dist/employee-task`). |
| `tsconfig.json` | TypeScript compiler settings for the app. |
| `db.json` | Mock database for json‑server. Contains `users` and `tasks` arrays. |
| `Dockerfile` | Multi‑stage build for containerising the Angular app with nginx. |
| `nginx.conf` | nginx configuration to handle client‑side routing (serves `index.html` for all routes). |

---

### 📂 `src/` – Source Code

#### `main.ts` – Application Entry Point
```typescript
bootstrapApplication(AppComponent, appConfig);
```
- Bootstraps the **standalone** `AppComponent` using `appConfig` (providers for routing & HttpClient).
- No `platformBrowserDynamic` or `AppModule` – this is the new Angular style.

---

### 📂 `src/app/` – Main Application Code

#### 1. `app.ts` – Root Component
- Contains `<router-outlet>` – the placeholder where routed components appear.
- `standalone: true` – no module needed.
- Imports `RouterOutlet` directly.

#### 2. `app.config.ts` – Application Providers
```typescript
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient()]
};
```
- Registers the router and HTTP client globally.
- Equivalent to the old `AppModule` providers array.

#### 3. `app.routes.ts` – Routing Configuration
Defines all routes with lazy loading (using `loadComponent`).  
**Key routes:**
- `/login` → `LoginComponent`
- `/dashboard` → `DashboardComponent` (guarded by `AuthGuard`) with child routes (`tasks`, `tasks/:id`, `admin/users`)
- `/tasks/add` and `/tasks/edit/:id` – separate top‑level routes (also guarded)

**Why separate top‑level?** To keep URLs clean and avoid nesting add/edit inside dashboard if not desired.

---

### 📂 `src/app/auth/` – Authentication Module

| File | Role |
|------|------|
| `login.ts` | Component with **Reactive Form** (email, password). Calls `AuthService.login()`. On success navigates to `/dashboard`. |
| `login.html` | Template with form binding `[formGroup]`, `(ngSubmit)`, validation error display. |
| `login.css` | Centered card styling. |

**Concepts covered:** Reactive Forms, form validation, service injection, routing navigation.

---

### 📂 `src/app/dashboard/` – Main Layout

#### `dashboard.ts` – Layout Container
- Imports `HeaderComponent`, `SidebarComponent`, and `RouterOutlet`.
- Template places header on top, sidebar + content area below.
- **Child routes** are rendered inside `<router-outlet>`.

#### `header/` – Header Component
- Shows logged‑in user email (from `AuthService.getCurrentUser()`).
- Logout button calls `AuthService.logout()` and navigates to `/login`.
- Uses `*ngIf` to conditionally display user info.

#### `sidebar/` – Sidebar Navigation
- Contains `<a routerLink="tasks">` etc.
- Uses `routerLinkActive` to highlight active link.
- Admin‑only link uses `*ngIf="authService.getCurrentUser()?.role === 'admin'"`.

#### `task-list/` – Task List Component
- **Lifecycle:** `ngOnInit` loads tasks, `ngOnDestroy` unsubscribes from service.
- `trackBy: trackByTaskId` optimises rendering.
- Uses `TaskCardComponent` inside `*ngFor`.
- Handles query parameters (e.g., `?added=3` to show success message).

#### `task-card/` – Task Card Component
- **@Input** `task` – receives a task object from parent.
- **@Output** `taskUpdated` and `taskDeleted` – emit events back to `TaskListComponent`.
- **Lifecycle hooks:** `ngOnInit`, `ngOnChanges`, `ngOnDestroy` (with logs to console).
- Custom directives applied: `appOverdueHighlight`, `appHoverEffect`, `appDisableButton`.
- Custom pipes used: `priority | priority`, `status | status`, `dueDate | date`.

---

### 📂 `src/app/tasks/` – Task Forms & Details

#### `add-task.ts` – Add Task Component
- Reactive form with validation.
- `ngOnInit` reads query parameters (e.g., `?priority=high`) and pre‑fills the priority field.
- On submit, calls `TaskService.addTask()`, then navigates back to `/dashboard/tasks` with query param `?added=id`.

#### `edit-task.ts` – Edit Task Component
- Uses `ActivatedRoute.paramMap` to get `:id` from URL.
- Loads existing task data and patches the form.
- On submit, calls `TaskService.updateTask()` and navigates back with `?updated=id`.

#### `task-detail.ts` – Task Detail Component
- Reads route parameter `:id` and query parameters (e.g., `?source=notification`).
- Displays full task information.
- Provides buttons to edit or go back.

---

### 📂 `src/app/admin/` – Admin Area

#### `users.ts` – Admin Users Component
- Only visible to users with `role = 'admin'`.
- Fetches all users from `http://localhost:3000/users` (excluding passwords in display).
- Demonstrates `HttpClient` GET, error handling, and subscriptions cleanup.

---

### 📂 `src/app/services/` – Business Logic

#### `auth.ts` – Authentication Service
- **BehaviorSubject** `currentUser$` and `isLoggedIn$` for reactive state.
- `login()` method sends `GET /users?email=xxx&password=yyy` to json‑server.
- Stores user in `localStorage` and updates subjects.
- `logout()` clears storage and subjects.

#### `task.ts` – Task Service
- **BehaviorSubject** `tasks$` to hold the current task list (though we also refetch).
- `loadTasks()`, `addTask()`, `updateTask()`, `deleteTask()`, `markAsCompleted()`.
- Each HTTP call updates the `tasksSubject` so any subscriber gets the new list.

---

### 📂 `src/app/guards/`

#### `auth.guard.ts`
- Implements `canActivate`. Checks `AuthService.isAuthenticated()`.
- If false, redirects to `/login`. If true, allows navigation.

---

### 📂 `src/app/shared/`

#### `models/` – TypeScript Interfaces
- `user.model.ts` – defines `User` (id, email, password, role).
- `task.model.ts` – defines `Task` (id, title, priority, status, dueDate, etc.).

#### `pipes/` – Custom Pipes
- `priority.pipe.ts` – transforms `'high'` → `'🔴 High'`, etc.
- `status.pipe.ts` – transforms `'pending'` → `'⏳ Pending'`, etc.

#### `directives/` – Custom Directives
- **`overdue-highlight.directive.ts`** – changes background and border if `isOverdue === true`. Uses `@Input` alias.
- **`disable-button.directive.ts`** – sets `disabled` attribute and styles based on `shouldDisable` input.
- **`hover-effect.directive.ts`** – uses `@HostListener('mouseenter')` and `mouseleave` to add transform/shadow.

---

## 🔄 How Data Flows Through the App

### Authentication Flow
1. User enters email/password → `LoginComponent.onSubmit()`.
2. Calls `AuthService.login()` → HTTP GET to `/users?email=...&password=...`.
3. If user found, `AuthService` stores user in `localStorage` and updates `BehaviorSubject`.
4. `HeaderComponent` and `SidebarComponent` are subscribed to `currentUser$` and reactively show/hide elements.
5. `AuthGuard` reads `isLoggedIn$` to protect routes.

### Task CRUD Flow (Example: Adding a Task)
1. User clicks “Add Task” → `TaskListComponent.addNewTask()` → navigates to `/tasks/add`.
2. `AddTaskComponent` form submitted → calls `TaskService.addTask()`.
3. `TaskService` sends `POST /tasks` to json‑server, then updates its internal `tasksSubject`.
4. After success, router navigates back to `/dashboard/tasks?added=3`.
5. `TaskListComponent` re‑initialises (because navigation destroyed and recreated the component) → calls `loadTasks()` → fetches fresh list including the new task.

### Component Communication (TaskList ↔ TaskCard)
- `TaskListComponent` passes `[task]` to each `TaskCardComponent` via `@Input`.
- When a task is updated (e.g., marked complete), `TaskCardComponent` emits `taskUpdated` event.
- `TaskListComponent` listens to `(taskUpdated)` and refreshes its list (or could update the local array).

---

## 🛠️ How Angular Concepts Are Applied

| Concept | Where | Explanation |
|---------|-------|-------------|
| **Lifecycle Hooks** | `TaskCardComponent` logs `ngOnInit`, `ngOnChanges`, `ngOnDestroy`. See console. | Demonstrates when component initialises, when inputs change, and when it is removed. |
| **Dependency Injection** | All components and services have constructors with injected services. | Angular creates and provides singleton services automatically. |
| **RxJS** | `AuthService` uses `BehaviorSubject`; `TaskService` uses it; components subscribe. | Enables reactive state across the app. |
| **Standalone Components** | Every component has `standalone: true` and imports its dependencies directly. | No NgModules – simplifies learning and reduces boilerplate. |
| **Lazy Loading** | Routes use `loadComponent` instead of importing components statically. | Improves initial bundle size. |

---

## 🐳 Docker Deployment Explanation

- **Multi‑stage Dockerfile**:
  1. `node:22-alpine` builds the Angular app (`npm run build`).
  2. `nginx:alpine` copies the built files (`/dist/employee-task/browser`) into nginx’s web root.
  3. `nginx.conf` ensures that any unknown route falls back to `index.html` (SPA support).
- **Run**: `docker build -t employee-task . && docker run -p 8080:80 employee-task`
- **Access**: `http://localhost:8080`

**Note about API:** The containerised app will try to call `http://localhost:3000` for json‑server. Since that `localhost` is inside the container, you must either:
- Run json‑server on your host and use `http://host.docker.internal:3000` (Windows/Mac) or your host’s IP address.
- Or create a real backend service.

---

## ☁️ Azure Deployment Summary

1. Build production files: `npm run build -- --configuration production`
2. Use Azure CLI to create Resource Group, App Service Plan (Linux), and Web App (static runtime).
3. Zip the contents of `dist/employee-task/browser` and deploy via `az webapp deployment source config-zip`.
4. Configure SPA fallback: `az webapp config set --startup-file "pm2 serve /home/site/wwwroot --no-daemon --spa"`.

The deployed app will be available at `https://<app-name>.azurewebsites.net`. Again, the json‑server backend is not deployed – you would need a separate API service.

---

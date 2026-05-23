import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Task } from '../shared/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000';
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`).pipe(
      tap(tasks => this.tasksSubject.next(tasks))
    );
  }

  getTasks(): Observable<Task[]> {
    // If tasks already loaded, return observable of current value? 
    // For simplicity, always fetch from server to keep consistency.
    return this.loadTasks();
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/tasks/${id}`);
  }

  addTask(task: Omit<Task, 'id'>): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, task).pipe(
      tap(newTask => {
        const current = this.tasksSubject.value;
        this.tasksSubject.next([...current, newTask]);
      })
    );
  }

  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/tasks/${id}`, task).pipe(
      tap(updatedTask => {
        const current = this.tasksSubject.value;
        const index = current.findIndex(t => t.id === id);
        if (index !== -1) {
          current[index] = updatedTask;
          this.tasksSubject.next([...current]);
        }
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`).pipe(
      tap(() => {
        const current = this.tasksSubject.value;
        this.tasksSubject.next(current.filter(t => t.id !== id));
      })
    );
  }

  markAsCompleted(id: number): Observable<Task> {
    return this.updateTask(id, { status: 'completed' });
  }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Task } from '../../shared/models/task.model';
import { TaskService } from '../../services/task';
import { TaskCardComponent } from '../task-card/task-card';
import { PriorityPipe } from '../../shared/pipes/priority.pipe';
import { ActivatedRoute } from '@angular/router';
import { StatusPipe } from '../../shared/pipes/status.pipe';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css']
})
export class TaskListComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  loading = true;
  private subscription: Subscription | null = null;

  constructor(
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
  this.loadTasks();
  // Read query params to show a success message
  this.route.queryParams.subscribe(params => {
    if (params['added']) {
      console.log(`Task added with id ${params['added']}`);
      // Could show a toast message
    }
    if (params['updated']) {
      console.log(`Task updated with id ${params['updated']}`);
    }
  });
}

  ngOnDestroy(): void {
    console.log('TaskListComponent - ngOnDestroy: cleaning up subscription');
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadTasks(): void {
    this.loading = true;
    this.subscription = this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load tasks', err);
        this.loading = false;
      }
    });
  }

  onTaskUpdated(updatedTask: Task): void {
    // Refresh list after update (could also update local array)
    this.loadTasks();
  }

  onTaskDeleted(deletedTaskId: number): void {
    this.tasks = this.tasks.filter(t => t.id !== deletedTaskId);
  }

  addNewTask(): void {
    this.router.navigate(['/tasks/add']); // We'll create add component later
  }

  trackByTaskId(index: number, task: Task): number {
    return task.id;
  }
}
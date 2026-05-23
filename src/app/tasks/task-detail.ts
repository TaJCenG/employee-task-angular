import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../services/task';
import { Task } from '../shared/models/task.model';
import { Subscription } from 'rxjs';
import { PriorityPipe } from '../shared/pipes/priority.pipe';
import { StatusPipe } from '../shared/pipes/status.pipe';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, PriorityPipe, StatusPipe],
  templateUrl: './task-detail.html',
  styleUrls: ['./task-detail.css']
})
export class TaskDetailComponent implements OnInit, OnDestroy {
  task: Task | null = null;
  loading = true;
  error = false;
  private subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    // Capture route parameter 'id'
    this.subscription.add(
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.loadTask(+id);
        } else {
          this.router.navigate(['/dashboard/tasks']);
        }
      })
    );

    // Capture query parameters (e.g., ?source=notification)
    this.subscription.add(
      this.route.queryParams.subscribe(queryParams => {
        console.log('Query params:', queryParams);
        // You could show a toast message based on source
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadTask(id: number): void {
    this.loading = true;
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        this.task = task;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/tasks']);
  }

  editTask(): void {
    if (this.task) {
      this.router.navigate(['/tasks/edit', this.task.id]);
    }
  }
}
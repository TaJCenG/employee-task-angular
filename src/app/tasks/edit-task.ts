import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../services/task';
import { Task } from '../shared/models/task.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-task',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-task.html',
  styleUrls: ['./edit-task.css']
})
export class EditTaskComponent implements OnInit, OnDestroy {
  taskForm: FormGroup;
  taskId: number | null = null;
  loading = true;
  submitting = false;
  errorMessage = '';
  private subscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      priority: ['medium', [Validators.required]],
      status: ['pending', [Validators.required]],
      dueDate: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Get task id from route params
    this.subscription.add(
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.taskId = +id;
          this.loadTask();
        } else {
          this.router.navigate(['/dashboard/tasks']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadTask(): void {
    if (!this.taskId) return;
    this.loading = true;
    this.taskService.getTaskById(this.taskId).subscribe({
      next: (task: Task) => {
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate
        });
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Task not found.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid || !this.taskId) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const updatedData = this.taskForm.value;

    this.taskService.updateTask(this.taskId, updatedData).subscribe({
      next: (updatedTask) => {
        this.submitting = false;
        // Navigate back to task list with query param indicating updated
        this.router.navigate(['/dashboard/tasks'], { queryParams: { updated: updatedTask.id } });
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = 'Failed to update task.';
        console.error(err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/tasks']);
  }

  get title() { return this.taskForm.get('title'); }
  get description() { return this.taskForm.get('description'); }
  get dueDate() { return this.taskForm.get('dueDate'); }
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../services/task';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-task.html',
  styleUrls: ['./add-task.css']
})
export class AddTaskComponent implements OnInit {
  taskForm: FormGroup;
  submitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    // Initialize form with default values
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      priority: ['medium', [Validators.required]],
      status: ['pending', [Validators.required]],
      dueDate: ['', [Validators.required]],
      assignedTo: [null]  // will set current user id by default
    });
  }

  ngOnInit(): void {
    // Optional: read query param for default priority? Example: ?priority=high
    this.route.queryParams.subscribe(params => {
      if (params['priority']) {
        this.taskForm.patchValue({ priority: params['priority'] });
      }
    });
    // Set default assignedTo to current logged-in user
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.taskForm.patchValue({ assignedTo: currentUser.id });
    }
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const newTask = {
      ...this.taskForm.value,
      createdAt: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };

    this.taskService.addTask(newTask).subscribe({
      next: (task) => {
        this.submitting = false;
        // Navigate back to task list with query param indicating success
        this.router.navigate(['/dashboard/tasks'], { queryParams: { added: task.id } });
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = 'Failed to add task. Please try again.';
        console.error(err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/tasks']);
  }

  // Helper getters for validation errors in template
  get title() { return this.taskForm.get('title'); }
  get description() { return this.taskForm.get('description'); }
  get dueDate() { return this.taskForm.get('dueDate'); }
}
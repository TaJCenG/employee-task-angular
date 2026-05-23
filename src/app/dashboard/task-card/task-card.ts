import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Task } from '../../shared/models/task.model';
import { TaskService } from '../../services/task';
import { PriorityPipe } from '../../shared/pipes/priority.pipe';
import { StatusPipe } from '../../shared/pipes/status.pipe';
import { OverdueHighlightDirective } from '../../shared/directives/overdue-highlight.directive';
import { DisableButtonDirective } from '../../shared/directives/disable-button.directive';
import { HoverEffectDirective } from '../../shared/directives/hover-effect.directive';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    CommonModule, 
    PriorityPipe, 
    StatusPipe,
    OverdueHighlightDirective,
    DisableButtonDirective,
    HoverEffectDirective
  ],
  templateUrl: './task-card.html',
  styleUrls: ['./task-card.css']
})
export class TaskCardComponent implements OnInit, OnChanges, OnDestroy {
  @Input() task!: Task;
  @Output() taskUpdated = new EventEmitter<Task>();
  @Output() taskDeleted = new EventEmitter<number>();

  isOverdue = false;
  private intervalId: any;

  constructor(
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log(`TaskCardComponent - ngOnInit for task ${this.task.id}`);
    this.checkOverdue();
    // Optional: auto-refresh overdue status every minute
    this.intervalId = setInterval(() => this.checkOverdue(), 60000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(`TaskCardComponent - ngOnChanges for task ${this.task.id}`, changes);
    if (changes['task']) {
      this.checkOverdue();
    }
  }

  ngOnDestroy(): void {
    console.log(`TaskCardComponent - ngOnDestroy for task ${this.task.id}`);
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private checkOverdue(): void {
    if (!this.task || this.task.status === 'completed') {
      this.isOverdue = false;
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(this.task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    this.isOverdue = dueDate < today;
  }

  markCompleted(): void {
    if (this.task.status === 'completed') return;
    this.taskService.markAsCompleted(this.task.id).subscribe({
      next: (updatedTask) => {
        this.task = updatedTask;
        this.taskUpdated.emit(updatedTask);
      },
      error: (err) => console.error('Failed to mark completed', err)
    });
  }

  editTask(): void {
    this.router.navigate(['/tasks/edit', this.task.id]);
  }

  deleteTask(): void {
    if (confirm(`Delete task "${this.task.title}"?`)) {
      this.taskService.deleteTask(this.task.id).subscribe({
        next: () => {
          this.taskDeleted.emit(this.task.id);
        },
        error: (err) => console.error('Failed to delete task', err)
      });
    }
  }

  viewDetails(): void {
    this.router.navigate(['/dashboard/tasks', this.task.id]);
  }
}
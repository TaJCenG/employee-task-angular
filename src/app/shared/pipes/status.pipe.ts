import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status',
  standalone: true
})
export class StatusPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'pending':
        return '⏳ Pending';
      case 'in-progress':
        return '🔄 In Progress';
      case 'completed':
        return '✅ Completed';
      default:
        return value;
    }
  }
}
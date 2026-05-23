import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priority',
  standalone: true
})
export class PriorityPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'high':
        return '🔴 High';
      case 'medium':
        return '🟠 Medium';
      case 'low':
        return '🟢 Low';
      default:
        return value;
    }
  }
}
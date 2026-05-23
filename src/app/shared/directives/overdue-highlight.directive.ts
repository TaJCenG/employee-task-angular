import { Directive, ElementRef, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appOverdueHighlight]',
  standalone: true
})
export class OverdueHighlightDirective implements OnInit, OnChanges {
  @Input('appOverdueHighlight') isOverdue: boolean = false;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.applyHighlight();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOverdue']) {
      this.applyHighlight();
    }
  }

  private applyHighlight(): void {
    if (this.isOverdue) {
      this.el.nativeElement.style.backgroundColor = '#ffe6e6';
      this.el.nativeElement.style.borderLeft = '4px solid #e74c3c';
    } else {
      this.el.nativeElement.style.backgroundColor = '';
      this.el.nativeElement.style.borderLeft = '';
    }
  }
}
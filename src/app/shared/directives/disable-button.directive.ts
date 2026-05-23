import { Directive, Input, ElementRef, Renderer2, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appDisableButton]',
  standalone: true
})
export class DisableButtonDirective implements OnInit, OnChanges {
  @Input('appDisableButton') shouldDisable: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.updateDisabledState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shouldDisable']) {
      this.updateDisabledState();
    }
  }

  private updateDisabledState(): void {
    if (this.shouldDisable) {
      this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');
      this.renderer.setStyle(this.el.nativeElement, 'opacity', '0.5');
    } else {
      this.renderer.removeAttribute(this.el.nativeElement, 'disabled');
      this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
    }
  }
}
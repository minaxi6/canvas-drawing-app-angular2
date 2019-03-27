import {
  Component, Input, ElementRef, AfterViewInit, ViewChild
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styles: ['canvas { border: 1px solid #000; }']
})
export class CanvasComponent implements AfterViewInit {

  @ViewChild('canvas') public canvas: ElementRef;

  @Input() public width = 400;
  @Input() public height = 400;

  lastEvent = null;

  private cx: CanvasRenderingContext2D;

  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');

    canvasEl.width = this.width;
    canvasEl.height = this.height;

    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';

   // this.captureEvents(canvasEl);
  }


  mouseMove(event) {
    if (this.lastEvent == null) {
      this.lastEvent = event;
      return;
    }
    const canvas = event.target;
    console.log(event);
    const rect = canvas.getBoundingClientRect();


    const prevPos = {
      x: this.lastEvent.clientX - rect.left,
      y: this.lastEvent.clientY - rect.top
    };

    const currentPos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    this.drawOnCanvas(prevPos, currentPos);

    this.lastEvent = event;

  }

  private drawOnCanvas(prevPos: { x: number, y: number }, currentPos: { x: number, y: number }) {
    if (!this.cx) { return; }

    this.cx.beginPath();

    if (prevPos) {
      this.cx.moveTo(prevPos.x, prevPos.y); // from
      this.cx.lineTo(currentPos.x, currentPos.y);
      this.cx.stroke();
    }
  }

}

import {
  Component, Input, ElementRef, AfterViewInit, ViewChild
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',

  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements AfterViewInit {

  @ViewChild('canvas') public canvas: ElementRef;

  @Input() public width = 700;
  @Input() public height = 400;

  lastEvent = null;
  isMouseDown = false;
  mode = "eraser";

  private cx: CanvasRenderingContext2D;

  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');

    canvasEl.width = this.width;
    canvasEl.height = this.height;

    this.cx.lineWidth = 2;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#FF0000';


    this.captureEvents(canvasEl);
  }


  // mouseMove(event) {
  //   if (this.lastEvent == null) {
  //     this.lastEvent = event;
  //     return;
  //   }
  //   const canvas = event.target;
  //   console.log(event);
  //   const rect = canvas.getBoundingClientRect();


  //   const prevPos = {
  //     x: this.lastEvent.clientX - rect.left,
  //     y: this.lastEvent.clientY - rect.top
  //   };

  //   const currentPos = {
  //     x: event.clientX - rect.left,
  //     y: event.clientY - rect.top
  //   };

  //   this.drawOnCanvas(prevPos, currentPos);

  //   this.lastEvent = event;

  // }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element
    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap((e) => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, 'mousemove')
            .pipe(
              // we'll stop (and unsubscribe) once the user releases the mouse
              // this will trigger a 'mouseup' event 
              takeUntil(fromEvent(canvasEl, 'mouseup')),
              // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
              takeUntil(fromEvent(canvasEl, 'mouseleave')),
              // pairwise lets us get the previous value to draw a line from
              // the previous point to the current point    
              pairwise()
            )
        })
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();

        // previous and current position with the offset
        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top
        };

        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top
        };

        // this method we'll implement soon to do the actual drawing
        this.drawOnCanvas(prevPos, currentPos);
      });
  }

  private drawOnCanvas(prevPos: { x: number, y: number }, currentPos: { x: number, y: number }) {
    if (!this.cx) { return; }

    this.cx.beginPath();

    if (prevPos) {
      this.cx.moveTo(prevPos.x, prevPos.y);
      this.cx.lineTo(currentPos.x, currentPos.y);
      this.cx.stroke();
    }
  }

  eraseLine() {
    this.cx.lineWidth = 9;
    this.cx.strokeStyle = '#ffffff';

  }

  drawLine(){
    this.cx.lineWidth = 2;
    this.cx.strokeStyle = '#FF0000';
  }


}

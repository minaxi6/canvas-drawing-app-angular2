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

  startX: number = null;
  startY: number = null;
  @ViewChild('canvas') public canvas: ElementRef;

  @Input() public width = 700;
  @Input() public height = 400;

  lastEvent = null;

  private cx: CanvasRenderingContext2D;

  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');

    canvasEl.width = this.width;
    canvasEl.height = this.height;

    this.cx.lineWidth = 2;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';


    this.captureEvents(canvasEl);
  }


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
//   mdEvent(e) {
//     //persist starting position
//     this.startX = e.clientX;
//     this.startY = e.clientY;
//   }
//   drawRect(e) {
//     const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
//     this.cx = canvasEl.getContext('2d');
//     let x = this.startX - this.canvas.nativeElement.getBoundingClientRect().left;
//     let y = this.startY - this.canvas.nativeElement.getBoundingClientRect().top;
//     let w = e.clientX - this.canvas.nativeElement.getBoundingClientRect().left - x;
//     let h = e.clientY - this.canvas.nativeElement.getBoundingClientRect().top - y;
//     this.cx.setLineDash([6]);
//     this.cx.strokeRect(x, y, w, h);
//     // if (canvasEl.getContext) {

//     //   this.cx.font = "11pt Helvetica";

//     //   this.cx.strokeStyle = "#2954D3";
//     //   this.cx.strokeRect(50, 20, 75, 75);


//     // }

//   }
//   muEvent(e){
//     //draw final rectangle on canvas
//     let x = this.startX - this.canvas.nativeElement.getBoundingClientRect().left;
//     let y= this.startY- this.canvas.nativeElement.getBoundingClientRect().top;
//     let w = e.clientX -this.canvas.nativeElement.getBoundingClientRect().left - x;
//     let h = e.clientY -this.canvas.nativeElement.getBoundingClientRect().top - y;
//     this.canvas.nativeElement.getContext("2d").setLineDash([6]);
//     this.canvas.nativeElement.getContext("2d").strokeRect(x, y, w, h);
// }

colorPencil(color){
  this.cx.lineWidth = 2;
  this.cx.strokeStyle=color;
}

drawRectangle(file: any): void
{
    let canvas = this.canvas.nativeElement;
    let context = canvas.getContext('2d');
        context.rect(file.left, file.top, file.width, file.height);
        context.stroke();  
}



}

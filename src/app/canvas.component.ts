import {
  Component, Input, ElementRef, AfterViewInit, ViewChild, Renderer
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
  startX:number=null;
    startY:number=null;
    drag=false;
  lastEvent = null;
  

  private cx: CanvasRenderingContext2D;
  constructor(private el: ElementRef, private renderer: Renderer) {

  }
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

  colorPencil(color) {
    this.cx.lineWidth = 2;
    this.cx.strokeStyle = color;
  }


  draw(color) {
    if (this.cx) {
      let canvas = this.canvas;
      if (this.cx) {
        var ctx = this.cx;
        ctx.beginPath();
        ctx.arc(this.width * .6, this.height * .6, this.width * .2, 0, Math.PI * 2, true);
        ctx.moveTo(this.width * 0.80, this.height * .45);
        ctx.strokeStyle = color;
        ctx.stroke();
      }
    }
  }

  mdEvent(e){
    //persist starting position
    this.startX=e.clientX;
    this.startY=e.clientY;
    this.drag=true;
}

mmEvent(e){

  if(this.drag){

      //draw rectangle on canvas
      // let sx = this.startX;
      // let sy = this.startY;
      // let canvasTop = this.canvas.nativeElement.getBoundingClientRect().top;
      // let canvasLeft = this.canvas.nativeElement.getBoundingClientRect().left;
      // let x = sx - canvasLeft;
      // let y = sy - canvasTop;
      // let w = e.clientX - canvasLeft - x;
      // let h = e.clientY - canvasTop - y;
      let x = this.startX - this.canvas.nativeElement.getBoundingClientRect().left;
      let y= this.startY- this.canvas.nativeElement.getBoundingClientRect().top;
      let w = e.clientX -this.canvas.nativeElement.getBoundingClientRect().left - x;
      let h = e.clientY -this.canvas.nativeElement.getBoundingClientRect().top - y;
      this.cx.strokeRect(x, y, w, h);
  }

}

muEvent(e){
  //draw final rectangle on canvas
  let x = this.startX - this.canvas.nativeElement.getBoundingClientRect().left;
  let y= this.startY- this.canvas.nativeElement.getBoundingClientRect().top;
  let w = e.clientX -this.canvas.nativeElement.getBoundingClientRect().left - x;
  let h = e.clientY -this.canvas.nativeElement.getBoundingClientRect().top - y;
  // this.canvas.nativeElement.getContext("2d").setLineDash([6]);
  this.canvas.nativeElement.getContext("2d").strokeRect(x, y, w, h);

  this.drag=false;
}

}

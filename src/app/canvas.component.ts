import {
  Component, Input, ElementRef, AfterViewInit, ViewChild, Renderer
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';
import { NgStyle } from '@angular/common';
import { RecursiveTemplateAstVisitor } from '@angular/compiler';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements AfterViewInit {

  @ViewChild('canvas') public canvas: ElementRef;
  @Input() public width = 700;
  @Input() public height = 400;
  startX: number = null;
  startY: number = null;
  lastX: number = null;
  lastY: number = null;
  drag = false;
  lastEvent = null;
  radius = 50;

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
      //this.cx.moveTo(prevPos.x, prevPos.y);
      //this.cx.lineTo(currentPos.x, currentPos.y);
      this.cx.stroke();
    }
  }

  eraseLine() {
    this.cx.lineWidth = 5;
    this.cx.strokeStyle = '#ffffff';
  }
  lineWidth(w) {
    this.cx.lineWidth = w;
  }

  colorPencil(color) {
    this.cx.strokeStyle = color;
  }


  draw(color) {
    if (this.cx) {
      let canvas = this.canvas;
      if (this.cx) {
        var ctx = this.cx;
        ctx.beginPath();
        ctx.arc(this.width * .6, this.height * .6, this.width * .2, 0, Math.PI * 2, true);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
      }
    }
  }

  mdEvent(e) {
    //persist starting position
    e.preventDefault();
    e.stopPropagation();
    var rect = this.canvas.nativeElement.getBoundingClientRect();
    this.startX = e.clientX - rect.left;
    this.startY = e.clientY - rect.top;
    this.drag = true;
    this.radius = 0;
  }

  mmEvent(e) {

    // this.rect(e);
    if (!this.drag) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    var rect = this.canvas.nativeElement.getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;
    this.cx.clearRect(0, 0, this.width, this.height);
    this.drawEllipse(this.startX, this.startY, this.lastX, this.lastY);
  }

  muEvent(e) {
    if (!this.drag) { return; }
    e.preventDefault();
    e.stopPropagation();
    this.drag = false;
  }

  // erase() {
  //   var m = confirm("Want to clear");
  //   if (m) {
  //     this.cx.clearRect(0, 0, this.width, this.height);
  //     document.getElementById("canvasimg").style.display = "none";
  //   }
  // }

  rect(e) {
    if (this.drag) {
      let x = this.startX - this.canvas.nativeElement.getBoundingClientRect().left;
      let y = this.startY - this.canvas.nativeElement.getBoundingClientRect().top;
      let w = e.clientX - this.canvas.nativeElement.getBoundingClientRect().left - x;
      let h = e.clientY - this.canvas.nativeElement.getBoundingClientRect().top - y;
      this.cx.fillStyle = "#fff";
      this.cx.fillRect(x, y, w, h);
      this.cx.strokeRect(x, y, w, h);
    }

  }

  drawEllipse(x1, y1, x2, y2) {

    var radiusX = (x2 - x1) * 0.5,   /// radius for x based on input
      radiusY = (y2 - y1) * 0.5,   /// radius for y based on input
      centerX = x1 + radiusX,      /// calc center
      centerY = y1 + radiusY,
      step = 0.01,                 /// resolution of ellipse
      a = step,                    /// counter
      pi2 = Math.PI * 2 - step;    /// end angle

    /// start a new path
    this.cx.beginPath();

    /// set start point at angle 0
    this.cx.moveTo(centerX + radiusX * Math.cos(0),
      centerY + radiusY * Math.sin(0));

    /// create the ellipse    
    for (; a < pi2; a += step) {
      this.cx.lineTo(centerX + radiusX * Math.cos(a),
        centerY + radiusY * Math.sin(a));
    }

    /// close it and stroke it for demo
    this.cx.closePath();
    this.cx.strokeStyle = '#000';
    this.cx.stroke();
  }


}


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
  cursor: boolean = false;
  mouseX: number = null;
  mouseY: number = null;
  drag = false;
  radius = 50;
  color = "#000";
  x: number = null;
  y: number = null;
  lastEvent = null;

  private cx: CanvasRenderingContext2D;

  drawerTypes = ["pencil", "erasor", "square", "circle"];
  drawerType = this.drawerTypes[0];
  constructor(private el: ElementRef, private renderer: Renderer) { }
  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');

    canvasEl.width = this.width;
    canvasEl.height = this.height;
    this.cx.lineWidth = 2;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';


    // this.captureEvents(canvasEl);
  }

  mouseDown(event) {
    if (this.lastEvent == null) {
      this.lastEvent = event;
      return;
    }

    this.startX = event.clientX;
    this.startY = event.clientY;
    this.drag = true;
    console.log(this.drag);
    this.lastEvent = event;

  }

  mouseUp(event) {
    this.drag = false;

  }

  mouseMove(event) {

    if (this.drawerType == "ractangle") {
      this.rect(event);
    }
    else if (this.drawerType == "circle") {
      this.drawCircle(this.x, this.y);
    }

    else if (this.drawerType == "erasor") {
      this.drawLine(event, true);

    } else {
      this.drawLine(event, false);
    }

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

  drawLine(event, isErasor) {

    if (!this.drag) {
      return;
    }


    console.log("draw line")

    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();

    const prevPos = {

      x: this.lastEvent.clientX - rect.left,
      y: this.lastEvent.clientY - rect.top
    };
    const currentPos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    this.cx.strokeStyle = isErasor ? "#ffffff" : this.color;

    this.cx.beginPath();

    this.cx.moveTo(prevPos.x, prevPos.y);
    this.cx.lineTo(currentPos.x, currentPos.y);
    this.cx.stroke();
    this.lastEvent = event;

  }
  lineWidth(w) {
    this.cx.lineWidth = w;
  }

  colorPencil(color) {
    this.cx.strokeStyle = color;
    this.color = color;
  }

  clearArea() {
    this.cx.setTransform(1, 0, 0, 1, 0, 0);
    this.cx.clearRect(0, 0, this.width, this.height);
  }

  rect(event) {
    if (!this.drag) {
      return;
    }

    const canvas = event.target;

    if (this.drag) {


      const rect = canvas.getBoundingClientRect();

      let canvasLeft = rect.left, canvasTop = rect.top;
      let x = this.startX - canvasLeft;
      let y = this.startY - canvasTop;
      let w = event.clientX - canvasLeft - x;
      let h = event.clientY - canvasTop - y;
      this.cx.beginPath();
      this.cx.strokeStyle = this.color;
      this.cx.fillStyle = "#fff";
      this.cx.fillRect(x, y, w, h);
      this.cx.strokeRect(x, y, w, h);

    }

    const rect = canvas.getBoundingClientRect();



  }

  drawCircle(x, y) {

    // this.cx.clearRect(0, 0, this.width, this.height);
    this.cx.save();
    this.cx.beginPath();
    this.cx.moveTo(this.startX, this.startY + (y - this.startY) / 2);
    this.cx.bezierCurveTo(this.startX, this.startY, x, this.startY, x, this.startY + (y - this.startY) / 2);
    this.cx.bezierCurveTo(x, y, this.startX, y, this.startX, this.startY + (y - this.startY) / 2);
    this.cx.closePath();
    this.cx.restore();
    this.cx.fillStyle = "white";
    this.cx.fill();
    this.cx.stroke();
  }

  drawPencil() {
    this.drawerType = "pencil"
  }
  rectangle() {

    this.drawerType = "ractangle"

  }

  eraseLine() {

    this.drawerType = "erasor";
    this.cx.lineWidth = 5;
    this.cx.strokeStyle = '#ffffff';


  }
  circle() {
    this.drawerType = "circle";
  }


}


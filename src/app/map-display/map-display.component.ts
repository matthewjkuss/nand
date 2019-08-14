import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';

import { genCross, connect, makeDrawPath } from 'src/app/draw-wire';
import { mux_chip } from '../chips';
import { stateFromChip, State } from '../eval-chip';


const testConnect = Array.from(Array(6).keys())
  .sort((a, b) => Math.random() - 0.5)
  .map((x, idx) => ({source: idx * 15, dest: x * 35}));

@Component({
  selector: 'app-map-display',
  templateUrl: './map-display.component.html',
  styleUrls: ['./map-display.component.scss']
})
export class MapDisplayComponent implements OnInit {
  @ViewChild('body', { static: true }) svg;
  pan_x = 0;
  pan_y = 0;

  pan_x_min = -500;
  pan_x_max = 500;
  pan_y_min = -500;
  pan_y_max = 500;
  scale_min = 0.1;
  scale_max = 5;

  dx = 0;
  dy = 0;

  vx = 0;
  vy = 0;

  t0 = 0;
  t1 = 0;

  scale = 1;

  panning = false;

  genCross = genCross;
  chip = mux_chip;
  state: State = stateFromChip(this.chip);

  paths = connect(testConnect).map(makeDrawPath);

  constructor(public changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
  }

  enterPanning() {
    this.panning = true;
    console.log('entered panning')
    document.body.style.cursor = 'move';
  }

  leavePanning() {
    this.panning = false;
    document.body.style.cursor = '';
    this.vx = 2*this.dx / (this.t1 - this.t0);
    this.vy = 2*this.dy / (this.t1 - this.t0);
    this.dx = 0;
    this.dy = 0;
    console.log('time delta', this.t0, this.t1);
    if (this.vx && this.vy) {
      this.move(this);
    }
  }

  move(obj) {
    const len = Math.sqrt(obj.vx * obj.vx + obj.vy * obj.vy);
    // console.log('move', len);
    if (len > 0.1) {
      obj.pan_x = Math.min(this.pan_x_max, Math.max(this.pan_x_min, obj.pan_x + obj.vx));
      obj.pan_y = Math.min(this.pan_y_max, Math.max(this.pan_y_min, obj.pan_y + obj.vy));
      obj.vx *= 0.99;
      obj.vy *= 0.99;
      // console.log(obj.pan_x);
      this.changeDetectorRef.markForCheck();
      requestAnimationFrame(() => obj.move(obj));
      // setTimeout(obj.move(obj), 1000 / 60);
    } else {
      console.log('stopping')
    }
    // this.move();
  }

  mouseleave(event: MouseEvent) {
    this.leavePanning();
  }

  mousedown(event: MouseEvent) {
    this.enterPanning();
  }

  mouseup(event: MouseEvent) {
    this.leavePanning();
    console.log(event);
  }

  mousemove(event: MouseEvent) {
    if (this.panning) {
      // console.log('panning')
      if (this.t1 != event.timeStamp) {
        this.t0 = this.t1;
        this.t1 = event.timeStamp;

        this.dx = event.movementX;
        this.dy = event.movementY;
      }
      // console.log(event);
      this.pan_x = Math.min(this.pan_x_max, Math.max(this.pan_x_min, this.pan_x + event.movementX / this.scale));
      this.pan_y = Math.min(this.pan_y_max, Math.max(this.pan_y_min, this.pan_y + event.movementY / this.scale));
    }
  }

  /*

  pos = (mouse / old_scale) - old_pan = (mouse / new_scale) - new_pan

  new_pan = old_pan + (mouse / new_scale) - (mouse / old_scale)

  */

  wheel(event: WheelEvent) {
    event.preventDefault();
    const x = event.x - this.svg.nativeElement.getBoundingClientRect().x;
    const y = event.y - this.svg.nativeElement.getBoundingClientRect().y;
    this.vx = 0;
    this.vy = 0;
    const oldScale = this.scale;
    this.scale *= 1 - (event.deltaY > 0 ? 1 : -1) * 0.05;
    this.pan_x += (x / this.scale) - (x / oldScale);
    this.pan_y += (y / this.scale) - (y / oldScale);
  }

}


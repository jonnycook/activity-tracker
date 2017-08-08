import { Component, ChangeDetectorRef, Input } from '@angular/core';
import Sugar from 'sugar';
import moment from 'moment';

@Component({
  selector: 'duration',
  template: `<span [ngClass]="{stopped: !!timer.end}">{{ value }}</span>`
})
export class Duration {
  @Input() timer: any = { start: ''};
  timerId: any;
  value: any;
  constructor(private changeDetector: ChangeDetectorRef) {
    this.timerId = setInterval(() => {
      this.value = this._value();
      this.changeDetector.detectChanges();
    }, 1000);
  }
  ngOnInit() {
    this.value = this._value();
  }
  _value() {
    if (this.timer.end) {
      return moment.duration(Sugar.Date.create(this.timer.end).getTime() - Sugar.Date.create(this.timer.start).getTime(), 'ms').format('h[h]m[m]s[s]');
    }
    else {
      return moment.duration(new Date().getTime() - Sugar.Date.create(this.timer.start).getTime(), 'ms').format('h[h]m[m]s[s]');
    }
  }
  ngOnDestroy() {
    clearTimeout(this.timerId)
  }
}

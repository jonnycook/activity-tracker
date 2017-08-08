import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import { InstancePage } from '../instance/instance';
import Sugar from 'sugar';
import { ComponentBase } from '../../util';
import { Api } from '../../api';

import { DataFrame } from '../../DataFrame';
import {CachedValuePool} from '../../CachedValuePool';

import moment from 'moment';

@Component({
  selector: 'page-routine',
  templateUrl: 'routine.html'
})
export class RoutinePage extends ComponentBase {
  routine: any;
  entries: any = [];
  dfc: any;
  timeValuePool = new CachedValuePool();

  constructor(
    public dataFrame: DataFrame,
    public http: Http,
    public api: Api,
    public events: Events,
    public changeDetector: ChangeDetectorRef,
    public navCtrl: NavController,
    public modalController: ModalController,
    public navParams: NavParams) {
    super();
    this.routine = this.navParams.get('routine');

    this.setInterval(() => {
      this.timeValuePool.clear();
    }, 1000);

    this.dfc = this.dataFrame.uses(['activities', 'instances'], (collections) => {
      var [instances] = this.dataFrame.collections(['instances']);
      this.entries = this.routine.activities.map(activity => {
        var time = this.timeValuePool.newValue(() => {
          return moment.duration(instances.reduce((total, instance) => {
            if (instance.activity._id == activity._id) {
              return total + (instance.end ? Sugar.Date.create(instance.end) : new Date()).getTime() - Sugar.Date.create(instance.start).getTime();
            }
            else {
              return total;
            }
          }, 0), 'ms').format('h[h]m[m]s[s]')
        });
        return {
          current: !!instances.find(instance => !instance.end && instance.activity._id == activity._id),
          activity: activity,
          get time() { return time.get() }
        }
      });
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.dfc.destruct();    
  }

  async toggleActivity(activity) {
    var [instances] = this.dataFrame.collections(['instances']);
    let instance = instances.find(instance => !instance.end && instance.activity._id == activity._id);
    if (instance) {
      await this.api.stopInstance(instance);
      this.dataFrame.changed(['instances']);
    }
    else {
      await this.api.startActivity(activity);
      this.dataFrame.changed(['instances']);
    }
  }
}

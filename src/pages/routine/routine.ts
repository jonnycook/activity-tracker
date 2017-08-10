import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import { InstancePage } from '../instance/instance';
import Sugar from 'sugar';
import { ComponentBase } from '../../util';
import { Api } from '../../api';
import { Data } from '../../Data';

import { DataFrame } from '../../DataFrame';
import {CachedValuePool} from '../../CachedValuePool';

import moment from 'moment';

function todaysInstances(instances, now) {
  return instances.filter(instance => Sugar.Date.isBetween(Sugar.Date.create(instance.start), Sugar.Date.beginningOfDay(new Date(now)), Sugar.Date.endOfDay(new Date())));
}

// resource
// reduction


@Component({
  selector: 'page-routine',
  templateUrl: 'routine.html'
})
export class RoutinePage extends ComponentBase {
  routine: any;

  constructor(
    public api: Api,
    public data: Data,
    public changeDetector: ChangeDetectorRef,
    public navCtrl: NavController,
    public navParams: NavParams) {
    super();
    this.routine = this.navParams.get('routine');

    // let currentSlice = {
    //   requires: [{ collection: 'slices' }, 'now'],
    //   get(slices, now) {

    //   }
    // };


    // let v = {
    //   requires: {
    //     requires: [currentSlice],


    //     get: (currentSlice) => (
    //       { collection: 'instances', between: [ currentSlice.begin, currentSlice.end ] }
    //     )
    //   },
    //   get(instances) {

    //   }
    // }

    this.addValueProp(this, 'entries', {
      requires: [ { collection: 'instances' } ],
      get: (instances) => {
        return this.routine.activities.map(activity => {
          let time = this.value({
            requires: [ { collection: 'instances' }, 'now' ],
            get: (instances, now) => {
              return moment.duration(todaysInstances(instances, now).reduce((total, instance) => {
                if (instance.activity._id == activity._id) {
                  return total + (instance.end ? Sugar.Date.create(instance.end) : now).getTime() - Sugar.Date.create(instance.start).getTime();
                }
                else {
                  return total;
                }
              }, 0), 'ms').format('h[h]m[m]s[s]');
            }
          });
          return {
            current: !!instances.find(instance => !instance.end && instance.activity._id == activity._id),
            activity: activity,
            get time() { return time() }
          }
        });
      }
    });
  }

  async toggleActivity(activity) {
    let [instances] = await this.data.get({ collection: 'instances' });
    let instance = instances.find(instance => !instance.end && instance.activity._id == activity._id);
    if (instance) {
      await this.api.stopInstance(instance);
      this.data.changed({ collection: 'instances' });
    }
    else {
      await this.api.startActivity(activity);
      this.data.changed({ collection: 'instances' });
    }
  }
}

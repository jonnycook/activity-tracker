import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import { InstancePage } from '../instance/instance';
import Sugar from 'sugar';
import { ComponentBase } from '../../util';
import { Api } from '../../api';

import moment from 'moment';

@Component({
  selector: 'page-routine',
  templateUrl: 'routine.html'
})
export class RoutinePage extends ComponentBase {
  routine: any;
  entries: any = [];
  instances: any = [];

  constructor(
    public http: Http,
    public api: Api,
    public events: Events,
    public changeDetector: ChangeDetectorRef,
    public navCtrl: NavController,
    public modalController: ModalController,
    public navParams: NavParams) {
    super();
    this.routine = this.navParams.get('routine');
    

    this.loadInstances().then(() => this.updateEntries());

    this.timerId = setInterval(() => {
      this.updateEntries();
    }, 1000);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    clearInterval(this.timerId);
  }


  timerId: any;

  async loadInstances() {
    this.instances = await this.api.instances();
    console.log(this.instances);
  }

  updateEntries() {
    this.entries = this.routine.activities.map(activity => ({
      current: !!this.instances.find(instance => !instance.end && instance.activity._id == activity._id),
      activity: activity,
      time: moment.duration(this.instances.reduce((total, instance) => {
        if (instance.activity._id == activity._id) {
          return total + (instance.end ? Sugar.Date.create(instance.end) : new Date()).getTime() - Sugar.Date.create(instance.start).getTime();
        }
        else {
          return total;
        }
      }, 0), 'ms').format('h[h]m[m]s[s]')
    }))
  }

  async toggleActivity(activity) {
    let instance = this.instances.find(instance => !instance.end && instance.activity._id == activity._id);
    if (instance) {
      await this.api.stopInstance(instance);
      await this.loadInstances();
      this.updateEntries();
    }
    else {
      await this.api.startActivity(activity);
      await this.loadInstances();
      this.updateEntries();;
    }
  }
}

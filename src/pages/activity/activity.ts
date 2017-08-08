import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import { Api } from '../../api';
import { ComponentBase } from '../../util';
import { InstancePage } from '../instance/instance';
import Sugar from 'sugar';

import { ToastController } from 'ionic-angular';


@Component({
  selector: 'page-activity',
  templateUrl: 'activity.html'
})
export class ActivityPage extends ComponentBase {
  activity: any;
  instances: any;
  constructor(
    public toastCtrl: ToastController,
    public http: Http,
    public api: Api,
    public events: Events,
    public changeDetector: ChangeDetectorRef,
    public navCtrl: NavController,
    public modalController: ModalController,
    public navParams: NavParams) {
    super();
    this.activity = this.navParams.get('activity');
    this.loadInstances();
    this.subscribe('data:reload', () => {
      this.loadInstances();
    })
  }

  async loadInstances() {
    this.instances = await this.api.activityInstances(this.activity);
    this.instances.sort((a, b) => a.start > b.start ? -1 : 1);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.save();
  }
  
  // delete() {
  //   this.http.delete('http://jonnycook.com:8000/v1/activities/' + this.activity._id).subscribe(() => {
  //     this.navCtrl.pop();
  //     this.events.publish('data:reload');
  //   });
  // }
  // resume() {
  //   this.http.patch('http://jonnycook.com:8000/v1/activities/' + this.activity._id, {end:null}).subscribe(() => {
  //     this.navCtrl.pop();
  //     this.events.publish('data:reload');
  //   });
  // }
  async save() {
    await this.http.patch('http://jonnycook.com:8000/v1/activities/' + this.activity._id, this.activity).toPromise();
    this.events.publish('data:reload');
    // this.toastCtrl.create({
    //   message: 'Activity saved',
    //   duration: 3000
    // }).present();
  }

  async start() {
    await this.api.startActivity(this.activity);;
    this.loadInstances();
  }

  timeSince(instance) {
    return Sugar.Date.relative(Sugar.Date.create(instance.start));
  }

  goToInstance(instance) {
    this.navCtrl.push(InstancePage, {instance:instance});
  }

}

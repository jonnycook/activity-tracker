import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import { Api } from '../../api';
import { ComponentBase } from '../../util';
import { InstancePage } from '../instance/instance';
import Sugar from 'sugar';

import { ToastController } from 'ionic-angular';

import { Data } from '../../Data';


@Component({
  selector: 'page-activity',
  templateUrl: 'activity.html'
})
export class ActivityPage extends ComponentBase {
  activity: any;
  instances: any = [];
  dfc: any;
  constructor(
    public toastCtrl: ToastController,
    public http: Http,
    public api: Api,
    public data: Data,
    public changeDetector: ChangeDetectorRef,
    public navCtrl: NavController,
    public modalController: ModalController,
    public navParams: NavParams) {
    super();
    this.initData();
    this.activity = this.navParams.get('activity');

    this.addValueProp(this, 'instances', {
      requires: { collection: 'instances' },
      get: (instances) => { return instances.filter(instance => instance.activity._id == this.activity._id) }
    });
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
    // this.dataFrame.changed(['activities']);
    // this.toastCtrl.create({
    //   message: 'Activity saved',
    //   duration: 3000
    // }).present();
  }

  async start() {
    await this.api.startActivity(this.activity);
    this.data.changed({ relationship: ['activityInstances', this.activity._id] });
    this.data.changed({ collections: 'instances' });
  }

  timeSince(instance) {
    return Sugar.Date.relative(Sugar.Date.create(instance.start));
  }

  goToInstance(instance) {
    this.navCtrl.push(InstancePage, {instance:instance});
  }

}

import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import { Api } from '../../api';
import { ComponentBase } from '../../util';
import { InstancePage } from '../instance/instance';
import Sugar from 'sugar';

import { ToastController } from 'ionic-angular';

import { DataFrame } from '../../DataFrame';


@Component({
  selector: 'page-activity',
  templateUrl: 'activity.html'
})
export class ActivityPage extends ComponentBase {
  activity: any;
  instances: any = [];
  dfc: any;
  constructor(
    public dataFrame: DataFrame,
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

    this.dfc = this.dataFrame.uses([['activityInstances', this.activity._id]], (collections) => {
      this.instances = collections[0].collection
    });
  }


  ngOnDestroy() {
    super.ngOnDestroy();
    this.dfc.destruct();;
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
    this.dataFrame.changed(['activities']);
    // this.toastCtrl.create({
    //   message: 'Activity saved',
    //   duration: 3000
    // }).present();
  }

  async start() {
    await this.api.startActivity(this.activity);
    this.dataFrame.changed([['activityInstances', this.activity._id]]);
  }

  timeSince(instance) {
    return Sugar.Date.relative(Sugar.Date.create(instance.start));
  }

  goToInstance(instance) {
    this.navCtrl.push(InstancePage, {instance:instance});
  }

}

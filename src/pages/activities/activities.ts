import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ModalController, Events } from 'ionic-angular';
import { ComponentBase } from '../../util';
import { ActivityPage } from '../activity/activity';
import { Data } from '../../Data';

@Component({
  selector: 'page-activities',
  templateUrl: 'activities.html'
})
export class ActivitiesPage extends ComponentBase {
  constructor(
    public data: Data,
    public changeDetector: ChangeDetectorRef,
    public navCtrl: NavController) {
    super();
    this.initData();
    this.addValueProp(this, 'activities', {
      requires: { collection: 'activities' },
      get(activities) { return activities }
    });
  }

  goToActivity(activity) {
    this.navCtrl.push(ActivityPage, {activity:activity});
  }
}

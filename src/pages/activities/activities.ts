import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ModalController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import Sugar from 'sugar';
import { ComponentBase } from '../../util';
import { ActivityPage } from '../activity/activity';

import { DataFrame } from '../../DataFrame';

@Component({
  selector: 'page-activities',
  templateUrl: 'activities.html'
})
export class ActivitiesPage extends ComponentBase {
  activities: any = [];
  dfc: any;
  constructor(
    public dataFrame: DataFrame,
    public http: Http,
    public events: Events,
    public changeDetector: ChangeDetectorRef,
    public navCtrl: NavController,
    public modalController: ModalController,
    public navParams: NavParams) {
    super();
    
    this.dfc = this.dataFrame.uses(['activities'], (collections) => {
      this.activities = collections[0].collection;
    });
  }

  ngOnDestroy() {
    this.dfc.destruct();
  }

  goToActivity(activity) {
    this.navCtrl.push(ActivityPage, {activity:activity});
  }

  load() {
    this.dfc.reload();;
  }
}

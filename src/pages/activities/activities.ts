import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ModalController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import Sugar from 'sugar';
import { ComponentBase } from '../../util';
import { ActivityPage } from '../activity/activity';

@Component({
  selector: 'page-activities',
  templateUrl: 'activities.html'
})
export class ActivitiesPage extends ComponentBase {
  activities: any = [];

  constructor(
    public http: Http,
    public events: Events,
    public changeDetector: ChangeDetectorRef,
    public navCtrl: NavController,
    public modalController: ModalController,
    public navParams: NavParams) {
    super();
    this.load();
    this.subscribe('data:reload', () => {
      this.load();
    });
  }

  load() {
    this.http.get('http://jonnycook.com:8000/v1/activities')
      .subscribe(response => {
        this.activities = response.json();
        this.activities.sort((a, b) => a.name < b.name ? -1 : 1)
      });
  }

  // timeSince(instance) {
  //   return Sugar.Date.relative(Sugar.Date.create(instance.start));
  // }

  goToActivity(activity) {
    this.navCtrl.push(ActivityPage, {activity:activity});
  }
}

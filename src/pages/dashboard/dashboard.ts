import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import { ComponentBase } from '../../util';
import { RoutinePage } from '../routine/routine';
import { InstancePage } from '../instance/instance';
import { ActivityPage } from '../activity/activity';

import { activityTotalTime, categoryTotalTime, routineTime } from '../../model';
import { DataFrame } from '../../DataFrame';

var model = { activityTotalTime, categoryTotalTime, routineTime };


import {CachedValuePool} from '../../CachedValuePool';
@Component({
  template: `
<ion-header>
  <ion-navbar>
    <button ion-button menuToggle>
      <ion-icon name="menu"></ion-icon>
    </button>
    <ion-title>{{ category }}</ion-title>
    <ion-buttons end>
      <button ion-button icon-only (click)="reload()">
        <ion-icon name="refresh"></ion-icon>
      </button>
    </ion-buttons>
  </ion-navbar>
</ion-header>
<ion-content>
  <button class="activity" ion-item detail-none (click)="startActivity(activity)" *ngFor="let activity of activities">
    {{ activity.name }}
    <span item-right>{{ activity.time }}</span>
  </button>
</ion-content>
  `
})
export class StartActivityList extends ComponentBase {
  activities: any = [];
  instances: any = [];
  category: any;
  dataFrame: DataFrame;

  constructor(
    private navController: NavController,
    private http: Http,
    private changeDetector: ChangeDetectorRef,
    public events: Events,
    private navParams: NavParams) {
    super();
    this.dataFrame = this.navParams.get('dataFrame');
    this.category = this.navParams.get('category');

    var valuePool = new CachedValuePool();
    this.setInterval(() => {
      valuePool.clear();
      this.changeDetector.detectChanges();
    }, 1000);

    this.activities = this.navParams.get('activities').map(activity => {
      let time = valuePool.newValue(() => model.activityTotalTime(this.dataFrame, activity));
      return Object.assign({}, activity, { get time() { return time.get() }});;
    });
  }

  ngOnInit() {
    [this.instances] = this.dataFrame.collections(['instances']);
  }

  startActivity(activity) {
    this.http.post('http://jonnycook.com:8000/v1/activities/' + activity._id + '/start', null).subscribe(() => {
      this.navController.popToRoot();
      this.dataFrame.changed(['instances']);
    });
  }
}

@Component({
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>
      New Activity
    </ion-title>
    <ion-buttons start>
      <button ion-button (click)="dismiss()">
        <span ion-text color="primary" showWhen="ios">Cancel</span>
        <ion-icon name="md-close" showWhen="android, windows"></ion-icon>
      </button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
<ion-content>
  <ion-list>
    <ion-item>
      <ion-input type="text" [(ngModel)]="name" placeholder="Name"></ion-input>
    </ion-item>
    <ion-item>
      <ion-input type="text" [(ngModel)]="category" placeholder="Category"></ion-input>
    </ion-item>
  </ion-list>
  <div padding>
    <button ion-button color="primary" block (click)="create()">Create Activity</button>
  </div>
</ion-content>`
})
export class NewActivityPage extends ComponentBase {
  name: any;
  category: any;
  constructor(private viewController: ViewController, public events: Events) {
    super();
  }
  dismiss() {
    this.viewController.dismiss();
  }
  create() {
    this.events.publish('activity:created', {name:this.name, category:this.category});
    this.viewController.dismiss();
  }
}


@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html'
})
export class DashboardPage extends ComponentBase {
  currentInstances: any = [];
  routines: any = [];
  activities: any;;

  timeValuePool: CachedValuePool = new CachedValuePool();

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

    this.dfc = this.dataFrame.uses(['instances', 'activities', 'routines'], (collections) => {
      for (let collection of collections) {
        switch (collection.key) {
          case 'activities': {
            this.activities = collection.collection.filter(activity => !activity.done);
            break;
          }
          case 'instances': {
            this.currentInstances = collection.collection.filter(instance => !instance.end);
            break;
          }
          case 'routines': {
            this.routines = collection.collection;
            for (let routine of this.routines) {
              let time = this.timeValuePool.newValue(() => model.routineTime(this.dataFrame, routine));
              Object.defineProperty(routine, 'time', { get: time.getter })
            }
          }
        }
      }
      this.refresh();
    });

    this.subscribe('activity:created', async (data) => {
      await this.http.post('http://jonnycook.com:8000/v1/activities', data).toPromise();;
      this.dataFrame.changed(['activities']);
    });

    this.setInterval(() => {
      this.timeValuePool.clear();
      this.changeDetector.detectChanges();
    }, 1000);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.dfc.destruct();
  }

  // ngOnInit() {
  //   for (var attribute in this.constructor.prototype) {
  //     if (attribute.match(/^constructor_/)) {
  //       this[attribute]();        
  //     }
  //   }
  // }


  startActivityEntries: any;
  refresh() {
    this.startActivityEntries = [];

    var categories = {};
    for (let activity of this.activities) {
      if (activity.category) {
        if (!categories[activity.category]) {
          categories[activity.category] = [];
        }
        categories[activity.category].push(activity);
      }
      else {
        var entry = { type: 'activity', activity: activity };
        let timerValue = this.timeValuePool.newValue(() => model.activityTotalTime(this.dataFrame, activity));
        Object.defineProperty(entry, 'time', { get: timerValue.getter });
        this.startActivityEntries.push(entry);
      }
    }

    for (let category in categories) {
      let entry = { type: 'category', category: category, activities: categories[category] }
      let timerValue = this.timeValuePool.newValue(() => model.categoryTotalTime(this.dataFrame, category));
      Object.defineProperty(entry, 'time', { get: timerValue.getter });
      this.startActivityEntries.push(entry);
    }
  }

  async reload() {
    await this.dfc.reload();
  }

  newActivity() {
    this.modalController.create(NewActivityPage).present()
  }

  async startActivity(event, activity) {
    await this.http.post('http://jonnycook.com:8000/v1/activities/' + activity._id + '/start', null).toPromise();
    this.dataFrame.changed(['instances']);
  }

  async stopInstance(event, instance) {
    await this.http.post('http://jonnycook.com:8000/v1/instances/' + instance._id + '/stop', null).toPromise();
    this.dataFrame.changed(['instances']);
  }

  goToCategory(category, activities) {
    this.navCtrl.push(StartActivityList, { category: category, activities: activities, dataFrame: this.dataFrame });
  }

  goToRoutine(routine) {
    this.navCtrl.push(RoutinePage, { routine: routine });
  }

  goToInstance(instance) {
    this.navCtrl.push(InstancePage, { instance: instance });
  }

  goToActivity(activity) {
    this.navCtrl.push(ActivityPage, { activity: activity });
  }
}

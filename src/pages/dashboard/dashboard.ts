import { Component, ChangeDetectorRef, SimpleChanges, Inject } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import { ComponentBase } from '../../util';
import { RoutinePage } from '../routine/routine';
import { InstancePage } from '../instance/instance';
import { ActivityPage } from '../activity/activity';

// import { activityTotalTime, } from '../../model';
import { DataFrame } from '../../DataFrame';
import { Api } from '../../api';
import { Data } from '../../Data';
import Sugar from 'sugar';
import { formatDuration } from '../../util';
import { activityTotalTime, routineTime, categoryTotalTime } from '../../model';

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

  constructor(
    private navController: NavController,
    private http: Http,
    protected data: Data,
    protected changeDetector: ChangeDetectorRef,
    private navParams: NavParams) {
    super();
    this.initData();

    this.category = this.navParams.get('category');

    Object.defineProperty(this, 'activities', { get: this.value({
      requires: { collection: 'activities' },
      get: (activities) => {
        return activities.filter(activity => activity.category == this.category).map(activity => {
          return Object.assign(this.valueProp('time', activityTotalTime, activity), activity);
        });
      }
    })});

    var valuePool = new CachedValuePool();
    this.setInterval(() => {
      valuePool.clear();
      this.changeDetector.detectChanges();
    }, 1000);

  //   this.activities = this.navParams.get('activities').map(activity => {
  //     // let time = valuePool.newValue(() => model.activityTotalTime(this.dataFrame, activity));
  //     return Object.assign({}, activity);
  //   });
  }

  startActivity(activity) {
    this.http.post('http://jonnycook.com:8000/v1/activities/' + activity._id + '/start', null).subscribe(() => {
      this.navController.popToRoot();
      this.data.changed({ collection: 'instances' });
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
  constructor(
    // private data: Data,
    private viewController: ViewController,
    public events: Events) {
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
  activities: any;
  page = 0;
  _values = [];

  constructor(
    public data: Data,
    public api: Api,
    public http: Http,
    public events: Events,
    public changeDetector: ChangeDetectorRef,
    public navCtrl: NavController,
    public modalController: ModalController) {
    super();
    this.initData();

    Object.defineProperty(this, 'activityEntries', {
      get: this.value({
        requires: { collection: 'activities' },
        get: (activities) => {
          var entries = [];
          var categories = {};

          for (let activity of activities) {
            if (activity.category) {
              if (!categories[activity.category]) {
                categories[activity.category] = [];
              }
              categories[activity.category].push(activity);
            }
            else {
              var entry = { type: 'activity', activity: activity };
              Object.defineProperty(entry, 'time', { get: this.value(activityTotalTime, activity) });
              entries.push(entry);
            }
          }

          for (let category in categories) {
            let entry = { type: 'category', category: category, activities: categories[category] }
            Object.defineProperty(entry, 'time', { get: this.value(categoryTotalTime, category) });
            entries.push(entry);
          }
          return entries;
        }
      })
    });

    Object.defineProperty(this, 'currentInstances', {
      get: this.value({
        prop: 'currentInstances',
        requires: { collection: 'instances' },
        get(instances) {
          return instances.filter(instance => !instance.end);
        }
      })
    });

    Object.defineProperty(this, 'routines', {
      get: this.value({
        requires: { collection: 'routines' },
        get: (routines) => {
          for (let routine of routines) {
            Object.defineProperty(routine, 'time', { get: this.value(routineTime, routine) });
          }
          return routines;
        }
      })
    });

    this.subscribe('activity:created', async (data) => {
      await this.http.post('http://jonnycook.com:8000/v1/activities', data).toPromise();;
      this.data.changed({ collection: 'activities' });
    });
  }

  reload() {
    this.data.reloadAll();
  }

  newActivity() {
    this.modalController.create(NewActivityPage).present()
  }

  async startActivity(event, activity) {
    await this.http.post('http://jonnycook.com:8000/v1/activities/' + activity._id + '/start', null).toPromise();
    this.data.changed({ collection: 'instances' })
  }

  async stopInstance(event, instance) {
    await this.http.post('http://jonnycook.com:8000/v1/instances/' + instance._id + '/stop', null).toPromise();
    this.data.changed({ collection: 'instances' })
  }

  goToCategory(category, activities) {
    this.navCtrl.push(StartActivityList, { category: category, activities: activities });
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

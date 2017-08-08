import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import Sugar from 'sugar';
import moment from 'moment';
import { ComponentBase } from '../../util';
import { RoutinePage } from '../routine/routine';
import { InstancePage } from '../instance/instance';
import { ActivityPage } from '../activity/activity';

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
    <span item-right>{{ activityTotalTime(activity) }}</span>
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
    private changeDetector: ChangeDetectorRef,
    public events: Events,
    private navParams: NavParams) {
    super();
    this.activities = this.navParams.get('activities');
    this.instances = this.navParams.get('instances');
    this.category = this.navParams.get('category');

  }

  ngOnInit() {
    this.totalActivityTime_init();
  }


  totalActivityTime: any;
  totalActivityTime_init() {
    this.totalActivityTime = {};
    this.setInterval(() => {
      this.totalActivityTime_update();
    }, 1000);
    this.totalActivityTime_update();
  }
  totalActivityTime_update() {
    this.totalActivityTime = {};
    for (let instance of this.instances.filter(instance => {
      return Sugar.Date.isBetween(Sugar.Date.create(instance.start), Sugar.Date.beginningOfDay(new Date()), Sugar.Date.endOfDay(new Date()));
    })) {
      if (!this.totalActivityTime[instance.activity._id]) {
        this.totalActivityTime[instance.activity._id] = 0;
      }
      this.totalActivityTime[instance.activity._id] += (instance.end ? Sugar.Date.create(instance.end) : new Date()).getTime() - Sugar.Date.create(instance.start).getTime();
    }


    for (let activity of this.activities) {
      let id = activity._id;
      if (!this.totalActivityTime[id]) {
        let mostRecent;
        for (let instance of this.instances) {
          if (instance.activity._id == id) {
            if (!mostRecent || instance.end && mostRecent < instance.end) {
              mostRecent = instance.end;
            }
          }
        }
        this.totalActivityTime[id] = mostRecent ? Sugar.Date.relative(Sugar.Date.create(mostRecent)) : 'never';
      }
      else {
        this.totalActivityTime[id] = formatDuration(this.totalActivityTime[id]);
      }
    }
    this.changeDetector.detectChanges();;
  }

  activityTotalTime(activity) {
    return this.totalActivityTime[activity._id];
  }

  startActivity(activity) {
    this.http.post('http://jonnycook.com:8000/v1/activities/' + activity._id + '/start', null).subscribe(() => {
      this.navController.popToRoot();
      this.events.publish('data:reload');
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
</ion-content>
`
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

function formatDuration(duration) {
  return moment.duration(duration, 'ms').format('h[h]m[m]s[s]');
}


class StartActivitySection {
  activities: any = [];
  instances: any = [];
  entries: any = [];

  totalTime: any;
  totalTime_timerId: any;
  totalTime_init() {
    this.totalTime = {};
    this.totalTime_timerId = setInterval(() => {
      this.totalTime_update();
    }, 1000);
    this.totalTime_update();
  }

  constructor(public changeDetector: ChangeDetectorRef) {
    // this.refresh();
  }

  destructor() {
    clearInterval(this.totalTime_timerId);
  }

  entryTotalTime(entry) {
    if (entry.type == 'activity') {
      return this.totalTime[entry.activity._id];
    }
    else if (entry.type == 'category') {
      return this.totalTime[entry.category];
    }
  }

  totalTime_update() {
    var totalActivityTime = {};
    for (let instance of this.instances.filter(instance => {
      return Sugar.Date.isBetween(Sugar.Date.create(instance.start), Sugar.Date.beginningOfDay(new Date()), Sugar.Date.endOfDay(new Date()));
    })) {
      if (!totalActivityTime[instance.activity._id]) {
        totalActivityTime[instance.activity._id] = 0;
      }
      totalActivityTime[instance.activity._id] += (instance.end ? Sugar.Date.create(instance.end) : new Date()).getTime() - Sugar.Date.create(instance.start).getTime();
    }

    this.totalTime = {};
    for (let entry of this.entries) {
      if (entry.type == 'activity') {
        if (totalActivityTime[entry.activity._id]) {
          this.totalTime[entry.activity._id] = formatDuration(totalActivityTime[entry.activity._id]);          
        }
        else {
          let mostRecent;
          for (let instance of this.instances) {
            if (instance.activity._id == entry.activity._id) {
              if (!mostRecent || instance.end && mostRecent < instance.end) {
                mostRecent = instance.end;
              }
            }
          }
          this.totalTime[entry.activity._id] = mostRecent ? Sugar.Date.relative(Sugar.Date.create(mostRecent)) : 'never';
        }
      }
      else if (entry.type == 'category') {
        this.totalTime[entry.category] = 0;
        for (let activity of this.activities) {
          if (activity.category == entry.category) {
            this.totalTime[entry.category] += totalActivityTime[activity._id] || 0;
          }
        }
        if (this.totalTime[entry.category]) {
          this.totalTime[entry.category] = formatDuration(this.totalTime[entry.category])
        }
        else {
          let mostRecent;
          for (let activity of this.activities) {
            if (activity.category == entry.category) {
              for (let instance of this.instances) {
                if (instance.activity._id == activity._id) {
                  if (!mostRecent || instance.end && mostRecent < instance.end) {
                    mostRecent = instance.end;
                  }
                }
              }
            }
          }
          if (mostRecent) {
            this.totalTime[entry.category] = Sugar.Date.relative(Sugar.Date.create(mostRecent));            
          }
          else {
            this.totalTime[entry.category] = 'never';
          }
        }
      }
    }
    this.changeDetector.detectChanges();;
  }

  refresh() {
    this.entries = [];

    var categories = {};
    for (let activity of this.activities) {
      if (activity.category) {
        if (!categories[activity.category]) {
          categories[activity.category] = [];
        }
        categories[activity.category].push(activity);
      }
      else {
        this.entries.push({ type: 'activity', activity: activity });
      }
    }

    for (var category in categories) {
      this.entries.push({ type: 'category', category: category, activities: categories[category] });
    }

    this.totalTime_update();
  }
}

@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html'
})
export class DashboardPage extends ComponentBase {
  currentInstances: any = [];
  instances: any = [];
  activities: any = [];
  startActivitySection: StartActivitySection;

  routines: any = [];

  constructor(
    public http: Http,
    public events: Events,
    public changeDetector: ChangeDetectorRef,
    public navCtrl: NavController,
    public modalController: ModalController,
    public navParams: NavParams) {
    super();

    this.reload();
    this.startActivitySection = new StartActivitySection(this.changeDetector);

    this.subscribe('data:reload', (name) => {
      this.reload();
    });
    this.subscribe('activity:created', (data) => {
      this.http.post('http://jonnycook.com:8000/v1/activities', data).subscribe(() => this.loadActivities());
    });
  }

  ngOnInit() {
    this.startActivitySection.totalTime_init();
    console.log(this.startActivitySection.totalTime);
    for (var attribute in this.constructor.prototype) {
      if (attribute.match(/^constructor_/)) {
        this[attribute]();        
      }
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.startActivitySection.destructor();
  }

  loadInstances() {
    this.http.get('http://jonnycook.com:8000/v1/instances')
      .subscribe(response => {
        this.instances = response.json();
        this.currentInstances = this.instances.filter(instance => !instance.end);
        this.startActivitySection.instances = this.instances;
        this.startActivitySection.refresh();
      });
  }

  loadActivities() {
    this.http.get('http://jonnycook.com:8000/v1/activities')
      .subscribe(response => {
        this.activities = response.json();
        this.activities.sort((a, b) => a.name < b.name ? -1 : 1);
        this.startActivitySection.activities = this.activities.filter(activity => !activity.done);
        this.startActivitySection.refresh();
      });
  }

  loadRoutines() {
    this.http.get('http://jonnycook.com:8000/v1/routines')
      .subscribe(response => {
        this.routines = response.json();
        this.routines.sort((a, b) => a.name < b.name ? -1 : 1);
      });
  }

  reload() {
    this.loadActivities();
    this.loadInstances();
    this.loadRoutines();
  }

  newActivity() {
    this.modalController.create(NewActivityPage).present()
  }

  startActivity(event, activity) {
    this.http.post('http://jonnycook.com:8000/v1/activities/' + activity._id + '/start', null).subscribe(() => this.loadInstances());
  }

  stopInstance(event, instance) {
    this.http.post('http://jonnycook.com:8000/v1/instances/' + instance._id + '/stop', null).subscribe(() => this.loadInstances());
  }

  goToCategory(category, activities) {
    this.navCtrl.push(StartActivityList, { category: category, activities: activities, instances: this.instances });
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

  constructor_routineTimeInfo() {
    this.routineTimeInfo_update();
    this.setInterval(() => {
      this.routineTimeInfo_update();
    }, 1000);
  }
  routineTimeInfo: any = {};
  routineTimeInfo_timerId: any;
  routineTimeInfo_update() {
    this.routineTimeInfo = {};
    for (let routine of this.routines) {
      var totalActivityTime = {};
      for (let instance of this.instances.filter(instance => {
        return Sugar.Date.isBetween(Sugar.Date.create(instance.start), Sugar.Date.beginningOfDay(new Date()), Sugar.Date.endOfDay(new Date()));
      })) {
        if (!totalActivityTime[instance.activity._id]) {
          totalActivityTime[instance.activity._id] = 0;
        }
        totalActivityTime[instance.activity._id] += (instance.end ? Sugar.Date.create(instance.end) : new Date()).getTime() - Sugar.Date.create(instance.start).getTime();
      }

      let totalTime = 0;

      for (let activity of routine.activities) {
        totalTime += totalActivityTime[activity._id] || 0;
      }

      if (totalTime) {
        this.routineTimeInfo[routine._id] = formatDuration(totalTime);
      }
      else {
        let mostRecent;
        for (let activity of routine.activities) {
            for (let instance of this.instances) {
              if (instance.activity._id == activity._id) {
                if (!mostRecent || instance.end && mostRecent < instance.end) {
                  mostRecent = instance.end;
                }
              }
            }
        }
        if (mostRecent) {
          this.routineTimeInfo[routine._id] = Sugar.Date.relative(Sugar.Date.create(mostRecent));            
        }
        else {
          this.routineTimeInfo[routine._id] = 'never';
        }
      }
    }
    this.changeDetector.detectChanges();
  }
}



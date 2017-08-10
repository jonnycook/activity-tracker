import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { InstancesPage } from '../pages/instances/instances';
import { ActivitiesPage } from '../pages/activities/activities';
import { Data } from '../Data';
import { Api } from '../api';
import 'moment-duration-format';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = DashboardPage;
  pages: Array<{title: string, component: any}>;

  constructor(
    public data: Data,
    public api: Api,
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen) {
    this.initializeApp();
    this.data.resources = [
      [
        'now',
        () => new Date()
      ],
      [
        { collection: 'instances' },
        () => this.api.instances()
      ],
      [
        { collection: 'activities' },
        () => this.api.activities()
      ],
      [
        { collection: 'routines' },
        () => this.api.routines()
      ],
      [
        { relationship: ['activityInstances'] },
        ({ relationship: [,id]}) => this.api.activityInstances(id)
      ]
    ];

    setInterval(() => {
      this.data.changed('now');
    }, 1000);

    this.pages = [
      { title: 'Dashboard', component: DashboardPage },
      { title: 'Instances', component: InstancesPage },
      { title: 'Activities', component: ActivitiesPage },
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }
}

import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { MyApp } from './app.component';
import { ListPage } from '../pages/list/list';
import { InstancesPage } from '../pages/instances/instances';
import { InstancePage } from '../pages/instance/instance';
import { ActivitiesPage } from '../pages/activities/activities';
import { ActivityPage } from '../pages/activity/activity';
import { RoutinePage } from '../pages/routine/routine';
import { DashboardPage, NewActivityPage, StartActivityList } from '../pages/dashboard/dashboard';
import { Duration } from '../components/duration/duration';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Api } from '../api';
import { Data } from '../Data';
import { DataFrame } from '../DataFrame';

@NgModule({
  declarations: [
    MyApp,
    ListPage,
    DashboardPage,
    NewActivityPage,
    InstancesPage,
    InstancePage,
    ActivitiesPage,
    ActivityPage,
    RoutinePage,
    Duration,
    StartActivityList,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ListPage,
    DashboardPage,
    InstancesPage,
    InstancePage,
    RoutinePage,
    ActivitiesPage,
    ActivityPage,
    NewActivityPage,
    StartActivityList,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Api,
    DataFrame,
    Data,
  ]
})
export class AppModule {}

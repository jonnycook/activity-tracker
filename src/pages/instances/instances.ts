import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ModalController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import { InstancePage } from '../instance/instance';
import Sugar from 'sugar';
import { ComponentBase } from '../../util';
@Component({
  selector: 'page-instances',
  templateUrl: 'instances.html'
})
export class InstancesPage extends ComponentBase {
  instances: any = [];

  constructor(
    public http: Http,
    public events: Events,
    public changeDetector: ChangeDetectorRef,
    public navCtrl: NavController,
    public modalController: ModalController,
    public navParams: NavParams) {
    super();
    this.reload();

    this.subscribe('data:reload', () => {
      this.reload();
      console.log('asdf');
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    console.log('destroy');
  }

  loadInstances() {
    this.http.get('http://jonnycook.com:8000/v1/instances')
      .subscribe(response => {
        this.instances = response.json();
        this.instances.sort((a, b) => a.start > b.start ? -1 : 1)
      });

  }

  timeSince(instance) {
    return Sugar.Date.relative(Sugar.Date.create(instance.start));
  }

  goToInstance(instance) {
    this.navCtrl.push(InstancePage, {instance:instance});
  }

  reload() {
    this.loadInstances();
  }
}

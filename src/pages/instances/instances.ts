import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ModalController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import { InstancePage } from '../instance/instance';
import Sugar from 'sugar';
import { ComponentBase } from '../../util';
import { DataFrame } from '../../DataFrame';

@Component({
  selector: 'page-instances',
  templateUrl: 'instances.html'
})
export class InstancesPage extends ComponentBase {
  instances: any;
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
  }

  ngOnInit() {
    this.dfc = this.dataFrame.uses(['instances'], collections => {
      this.instances = collections[0].collection;
      this.changeDetector.detectChanges();
    });
  }

  ngOnDestroy() {
    this.dfc.destruct();
  }

  timeSince(instance) {
    return Sugar.Date.relative(Sugar.Date.create(instance.start));
  }

  goToInstance(instance) {
    this.navCtrl.push(InstancePage, {instance:instance});
  }

  reload() {
    this.dfc.reload();
  }
}

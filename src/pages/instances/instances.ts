import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ModalController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import { InstancePage } from '../instance/instance';
import Sugar from 'sugar';
import { ComponentBase } from '../../util';
import { DataFrame } from '../../DataFrame';
import { Data } from '../../Data';

@Component({
  selector: 'page-instances',
  templateUrl: 'instances.html'
})
export class InstancesPage extends ComponentBase {
  instances: any;
  dfc: any;
  constructor(
    public data: Data,
    public changeDetector: ChangeDetectorRef,
    public navCtrl: NavController) {
    super();
    this.initData();
    this.addValueProp(this, 'instances', {
      requires: { collection: 'instances' },
      get(instances) { 
        return instances.map(instance => Object.assign({
          get time() { return Sugar.Date.relative(Sugar.Date.create(instance.start)); }
        }, instance));
      }
    });
  }

  goToInstance(instance) {
    this.navCtrl.push(InstancePage, {instance:instance});
  }

  reload() {
    this.data.reloadAll();
  }
}

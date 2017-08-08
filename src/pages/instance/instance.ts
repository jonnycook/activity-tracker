import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import { ActivityPage } from '../activity/activity';

@Component({
  selector: 'page-instance',
  templateUrl: 'instance.html'
})
export class InstancePage {
  instance: any;
  constructor(
    public http: Http,
    public events: Events,
    public changeDetector: ChangeDetectorRef,
    public navCtrl: NavController,
    public modalController: ModalController,
    public navParams: NavParams) {
    this.instance = this.navParams.get('instance');;
  }

  goToActivity() {
    this.navCtrl.push(ActivityPage, { activity: this.instance.activity });
  }

  async save() {
    await this.http.patch('http://jonnycook.com:8000/v1/instances/' + this.instance._id, this.instance).toPromise();
    // this.events.publish('data:reload');
  }

  delete() {
    if (confirm('Are you sure you want to delete this instance?')) {
      this.http.delete('http://jonnycook.com:8000/v1/instances/' + this.instance._id).subscribe(() => {
        this.navCtrl.pop();
        this.events.publish('data:reload');
      });
    }
  }
  resume() {
    this.http.patch('http://jonnycook.com:8000/v1/instances/' + this.instance._id, {end:null}).subscribe(() => {
      this.navCtrl.pop();
      this.events.publish('data:reload');
      console.log('adf');
    });
  }
}

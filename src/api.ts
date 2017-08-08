import { Inject } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Events } from 'ionic-angular';

export class Api {
	constructor(
		@Inject(Http) public http: Http,
		@Inject(Events) public events: Events) {

	}
	async instances(){
    var response = await this.http.get('http://jonnycook.com:8000/v1/instances').toPromise();
    return response.json();
	}

	async activityInstances(activity) {
    var response = await this.http.get(`http://jonnycook.com:8000/v1/activities/${activity._id}/instances`).toPromise();
    return response.json();
	}

	async stopInstance(instance) {
    await this.http.post('http://jonnycook.com:8000/v1/instances/' + instance._id + '/stop', null).toPromise();
    this.events.publish('data:reload');
	}

	async startActivity(activity) {
    await this.http.post('http://jonnycook.com:8000/v1/activities/' + activity._id + '/start', null).toPromise();
    this.events.publish('data:reload');
	}
}

import { Inject } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Events } from 'ionic-angular';

export class Api {
	constructor(
		@Inject(Http) public http: Http,
		@Inject(Events) public events: Events) {
	}

	async instances() {
    var response = await this.http.get('http://jonnycook.com:8000/v1/instances').toPromise();
    var instances = response.json()
    instances.sort((a, b) => a.start > b.start ? -1 : 1);
    return instances;
	}

	async activities() {
    var response = await this.http.get('http://jonnycook.com:8000/v1/activities').toPromise();
    var activities = response.json();
    activities.sort((a, b) => a.name < b.name ? -1 : 1);
    return activities;
	}

	async routines() {
    var response = await this.http.get('http://jonnycook.com:8000/v1/routines').toPromise();
    return response.json();
	}

	async activityInstances(activity) {
    var response = await this.http.get(`http://jonnycook.com:8000/v1/activities/${activity}/instances`).toPromise();
    var instances = response.json();
    instances.sort((a, b) => a.start > b.start ? -1 : 1);
    return instances;
	}

	async stopInstance(instance) {
    await this.http.post('http://jonnycook.com:8000/v1/instances/' + instance._id + '/stop', null).toPromise();
	}

	async startActivity(activity) {
    await this.http.post('http://jonnycook.com:8000/v1/activities/' + activity._id + '/start', null).toPromise();
	}
}

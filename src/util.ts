import { Events } from 'ionic-angular';
import moment from 'moment';

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}


export class ComponentBase {
	events: Events;
	private handlers: any;
	private timerIds = [];
	subscribe(event, handler) {
		if (!this.handlers) {
			this.handlers = {};
		}

		if (!this.handlers[event]) {
			this.handlers[event] = [handler];
		}
		else {
			this.handlers[event].push(handler);
		}

		this.events.subscribe(event, handler);
	}

	setInterval(func, time) {
		this.timerIds.push(setInterval(func, time));
	}


	unsubscribeAll() {
		if (this.handlers) {
			for (var event in this.handlers) {
				for (var handler of this.handlers[event]) {
					this.events.unsubscribe(event, handler);
				}
			}
		}
	}

	ngOnDestroy() {
		this.unsubscribeAll();
		for (let id of this.timerIds) {
			clearInterval(id);
		}
	}
}


export function formatDuration(duration) {
  return moment.duration(duration, 'ms').format('h[h]m[m]s[s]');
}

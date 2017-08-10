import { Events } from 'ionic-angular';
import moment from 'moment';
import Sugar from 'sugar';
import { Data } from './Data';

import { ChangeDetectorRef } from '@angular/core';;
export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}


export class ComponentBase {
	protected events: Events;
	protected data: Data;
	protected changeDetector: ChangeDetectorRef;

	private handlers: any;
	private timerIds = [];

	initData() {
    this.data.onChanged(() => this._dependencies, this, () => {
      this.changeDetector.detectChanges();
    }, 1);
	}

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

	_destroyed = false;

	ngOnDestroy() {
		this.unsubscribeAll();
		for (let id of this.timerIds) {
			clearInterval(id);
		}

		if (this.data) {
	    this.data.removeObserver(this);			
		}
    this._destroyed = true;


    clearTimeout(this._detectChangesTimerId);
	}

  ngDoCheck() {
    ++ this._tick;
    this._dependencies = [];
    // console.log('ngDoCheck');
  }

  _tick = 0;
  _dependencies = [];
  depends(resources) {
    if (!Sugar.Object.isArray(resources)) {
      resources = [resources];
    }
    for (let resource of resources) {
      if (!this._dependencies.find((res) => Sugar.Object.isEqual(res, resource))) {
        this._dependencies.push(resource);
      }
    }
  }

  addValueProp(obj, prop, opts, ...args) {
  	opts.prop = prop;
  	Object.defineProperty(obj, prop, {
  		get: this.value(opts, ...args)
  	});
  }

  valueProp(prop, opts, ...args) {
  	var obj = {};
  	this.addValueProp(obj, prop, opts, ...args);
  	return obj;
  }

  _detectChangesTimerId;
  detectChanges() {
    clearTimeout(this._detectChangesTimerId);
    this._detectChangesTimerId = setTimeout(() => {
      if (!this._destroyed) {
        this.changeDetector.detectChanges();        
      }
    }, 50);
  }

  value({requires, get, ...opts}, ...args) {
    let getting = false, gotten = false, value;
    let tick;
    let _requires, prevRequires;

    if (typeof _requires != 'function') _requires = requires;
    var tag = {prop:opts.prop};

    return () => {
      if (this._tick != tick) {
        if (typeof requires == 'function') {
          _requires = requires();
          if (!Sugar.Object.isEqual(_requires, prevRequires)) {
            gotten = false;
          }
          prevRequires = _requires;
        }
        this.depends(_requires);
        tick = this._tick;
      }

      if (!gotten && !getting) {
        getting = true;

        this.data.removeObserver(tag);
        this.data.onChanged(_requires, tag, () => {
          if (tick != this._tick || this._destroyed) {
            this.data.removeObserver(tag);
          }
          gotten = false;
        }, 0);

        this.data.get(_requires).then(data => {
          value = get(...data, ...args);
          gotten = true;
          getting = false;
          this.detectChanges();
        });
      }

      return value;
    }
  }

}


export function formatDuration(duration) {
  return moment.duration(duration, 'ms').format('h[h]m[m]s[s]');
}

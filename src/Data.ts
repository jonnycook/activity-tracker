import { Inject } from '@angular/core';
import Sugar from 'sugar';
import isSubset from 'is-subset';

export class Data {
  observers = [];
  _cache = {};
  _loadingPromises = {};
  _keyGetters: any = {};
  _getters: any = [];

  // constructor() {}

  public set resources(getters) {
    this._getters = getters;
    let i = 0;
    let toDelete = [];
    for (let getter of this._getters) {
      if (typeof getter[0] == 'string') {
        toDelete.unshift(i);
        this._keyGetters[getter[0]] = getter[1];
      }
      ++ i;
    }

    for (let i of toDelete) {
      this._getters.splice(i, 1);
    }
  }

  private _key(res) { return typeof res == 'string' ? res : JSON.stringify(res) }

  private _get(res) {
    let key = this._key(res);
    if (this._cache[key]) {
      return this._cache[key];
    }

    if (this._loadingPromises[key]) {
      return this._loadingPromises[key];
    }

    let value;

    if (typeof res == 'string') {
      value = this._keyGetters[key]();
    }
    else {
      for (let getter of this._getters) {
        if (res == getter[0] || isSubset(res, getter[0])) {
          value = getter[1](res);
           break;
        }
      }
    }

    if (value.then) {
      this._loadingPromises[key] = value;
      value.then(() => {
        delete this._loadingPromises[key];
      });
      return value;
    }
    else {
      return this._cache[key] = value;
    }
  }

  public async get(resources) {
    var values = [];

    if (!Sugar.Object.isArray(resources)) {
      resources = [resources];
    }

    for (let i = 0; i < resources.length; ++ i) {
      let resource = resources[i];
      let value = this._get(resource);
      if (value && typeof value.then == 'function') {
        value = await value;
      }
      values.push(value);
    }

    return values;
  }

  public onChanged(resource, tag, cb, weight=0) {
    this.observers.push({ tag, resource, cb, weight });
    this.observers.sort((a, b) => a.weight - b.weight);
  }

  public removeObserver(tag) {
    let index = this.observers.findIndex(observer => observer.tag == tag);
    if (index != -1) {
      this.observers.splice(index, 1);      
    }
  }

  public reloadAll() {
    this._cache = {};
    this._loadingPromises = {};
    for (let observer of this.observers) {
      observer.cb();
    }
  }

  public changed(resource) {
    delete this._cache[this._key(resource)];
    for (let observer of this.observers) {
      let observerResources;
      if (typeof observer.resource == 'function') {
        observerResources = observer.resource();
      }
      else {
        observerResources = observer.resource;
      }

      if (!Sugar.Object.isArray(observerResources)) {
        observerResources = [observerResources];
      }

      if (observerResources.find(res => Sugar.Object.isEqual(res, resource))) {
        observer.cb();
        continue;
      }
    }
  }
}

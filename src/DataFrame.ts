import { Inject } from '@angular/core';
import { Api } from './api';
import intersection from 'array-intersection';

class Context {
	constructor(public dataFrame, public collections, public onChange) {}
	reload() {
		return this.dataFrame.load(this.collections, true);
	}
	destruct() {
		var index = this.dataFrame.contexts.indexOf(this);
		this.dataFrame.contexts.splice(index, 1);
	}
}

export class DataFrame {
	constructor(@Inject(Api) private api: Api) {

	}
	_collections: any = {};
	contexts: Array<Context> = [];

	public uses(collections, onChange) {
		collections = collections.map(collection => JSON.stringify(collection));
		this.load(collections);
		var context = new Context(this, collections, onChange);
		this.contexts.push(context);
		this.notify(collections, context);
		return context;
	}

	private notifyAll(collections) {
		for (let context of this.contexts) {
			this.notify(collections, context);
		}
	}


	public collections(collections) {
		var values = [];
		for (let col of collections) {
			values.push(this._collections[JSON.stringify(col)]);
		}
		return values;
	}
	private notify(collections, context) {
		let colNames = intersection(context.collections, collections);
		if (colNames.length) {
			var cols = [];
			for (let colName of colNames) {
				let value;
				if (!(value = this._collections[colName])) {
					return;
				}
				cols.push({key:JSON.parse(colName), collection: value});
			}
			context.onChange(cols);
		}
	}

	public async changed(collections) {
		collections = collections.map(collection => JSON.stringify(collection));
		await this.load(collections);
		this.notifyAll(collections);
	}

	private load(collections, force=false) {
		var promises = [];
		for (let collection of collections) {
			let key;
			try {
				key = JSON.parse(collection);

			}
			catch (e) {
				console.log(collection);;
			}

			let promise;

			if (typeof key == 'string') {
				promise = this.api[key]();
			}
			else {
				console.log(key.slice(1));
				promise = this.api[key[0]].apply(this.api, key.slice(1));
			}

			promise.then(response => {
				this._collections[collection] = response;
			});
			promises.push(promise);
		}
		let promise = Promise.all(promises);
		promise.then(() => this.notifyAll(collections));
		return promise;
	}
}
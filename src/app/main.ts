import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
import 'rxjs/add/operator/toPromise';

import Sugar from 'sugar';
Sugar.extend();

platformBrowserDynamic().bootstrapModule(AppModule);

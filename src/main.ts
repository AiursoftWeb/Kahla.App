import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { ApiService } from './app/Services/ApiService';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}
ApiService.serverAddress = environment.server;

platformBrowserDynamic().bootstrapModule(AppModule);

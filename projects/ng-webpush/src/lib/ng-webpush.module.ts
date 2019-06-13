import { NgWebPushService } from './ng-webpush.service';
import { FIREBASE_CONFIG_DI_TOKEN } from './di/di-tokens';
import { NgModule, ModuleWithProviders } from '@angular/core';

@NgModule({
  declarations: [],
  imports: [],
  exports: [],
  providers: [NgWebPushService]
})
export class NgWebPushModule {
  static forRoot(firebaseConfig: any): ModuleWithProviders {
    return {
      ngModule: NgWebPushModule,
      providers: [
        {
          provide: FIREBASE_CONFIG_DI_TOKEN,
          useValue: firebaseConfig
        }
      ]
    }
  }
}

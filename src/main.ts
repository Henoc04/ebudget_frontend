import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
// import { KeycloakService } from './app/services/keycloak.service';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));


  // const keycloakConfig = new KeycloakService();
  // keycloakConfig.init().then(() => {
  //   console.log('Keycloak initialized successfully');
  // }).catch((error) => {
  //   console.error('Keycloak initialization failed', error);
  // });
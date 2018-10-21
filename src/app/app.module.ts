import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { RedirectComponent } from './redirect/redirect.component';
import { HomeComponent } from './home/home.component';
import { environment } from './../environments/environment';

import {
    AuthModule,
    OidcSecurityService,
    OpenIDImplicitFlowConfiguration,
    OidcConfigService,
    AuthWellKnownEndpoints
} from 'angular-auth-oidc-client';

export function loadConfig(oidcConfigService: OidcConfigService) {
    console.log('APP_INITIALIZER STARTING');
    return () => oidcConfigService.load_using_custom_stsServer('https://login.microsoftonline.com/fabrikamb2c.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=b2c_1_susi');
}

const appRoutes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'redirect.html', component: RedirectComponent }
];

@NgModule({
    declarations: [
        AppComponent,
        RedirectComponent,
        HomeComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AuthModule.forRoot(),
        RouterModule.forRoot(appRoutes),
    ],
    providers: [
        OidcConfigService,
        {
            provide: APP_INITIALIZER,
            useFactory: loadConfig,
            deps: [OidcConfigService],
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {

    constructor(
        private oidcSecurityService: OidcSecurityService,
        private oidcConfigService: OidcConfigService,
    ) {
        this.oidcConfigService.onConfigurationLoaded.subscribe(() => {

            const openIDImplicitFlowConfiguration = new OpenIDImplicitFlowConfiguration();

            openIDImplicitFlowConfiguration.stsServer = 'https://login.microsoftonline.com/tfp/fabrikamb2c.onmicrosoft.com/b2c_1_susi/oauth2/v2.0/';
            openIDImplicitFlowConfiguration.redirect_url = 'http://localhost:65328/redirect.html';
            openIDImplicitFlowConfiguration.client_id = 'e760cab2-b9a1-4c0d-86fb-ff7084abd902';
            openIDImplicitFlowConfiguration.response_type = 'id_token token';
            openIDImplicitFlowConfiguration.scope = 'openid https://fabrikamb2c.onmicrosoft.com/demoapi/demo.read';
            openIDImplicitFlowConfiguration.post_logout_redirect_uri = 'http://localhost:65328';
            openIDImplicitFlowConfiguration.post_login_route = '/home';
            openIDImplicitFlowConfiguration.forbidden_route = '/home';
            openIDImplicitFlowConfiguration.unauthorized_route = '/home';
			openIDImplicitFlowConfiguration.silent_renew = false;
            openIDImplicitFlowConfiguration.auto_userinfo = false;
            openIDImplicitFlowConfiguration.log_console_warning_active = true;
            openIDImplicitFlowConfiguration.log_console_debug_active = !environment.production;
            openIDImplicitFlowConfiguration.max_id_token_iat_offset_allowed_in_seconds = 30;

            const authWellKnownEndpoints = new AuthWellKnownEndpoints();
            authWellKnownEndpoints.setWellKnownEndpoints(this.oidcConfigService.wellKnownEndpoints);

            this.oidcSecurityService.setupModule(openIDImplicitFlowConfiguration, authWellKnownEndpoints);

        });

        console.log('APP STARTING');
    }
}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegistroComponent } from './features/auth/registro/registro.component';
import { HomeComponent } from './features/solicitudes/home/home.component';
import { NuevaSolicitudComponent } from './features/solicitudes/nueva-solicitud/nueva-solicitud.component';
import { DetalleSolicitudComponent } from './features/solicitudes/detalle-solicitud/detalle-solicitud.component';
import { PerfilComponent } from './features/perfil/perfil.component';
import { NotFoundComponent } from './features/not-found/not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    RegistroComponent,
    HomeComponent,
    NuevaSolicitudComponent,
    DetalleSolicitudComponent,
    PerfilComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

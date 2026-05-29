import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegistroComponent } from './features/auth/registro/registro.component';
import { HomeComponent } from './features/solicitudes/home/home.component';
import { NuevaSolicitudComponent } from './features/solicitudes/nueva-solicitud/nueva-solicitud.component';
import { DetalleSolicitudComponent } from './features/solicitudes/detalle-solicitud/detalle-solicitud.component';
import { PerfilComponent } from './features/perfil/perfil.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';

// Definición de rutas de la aplicación.
// Las rutas marcadas con canActivate: [authGuard] son privadas
// y requieren que el usuario esté autenticado para acceder.
const routes: Routes = [
  { path: '',                component: LandingComponent },
  { path: 'login',           component: LoginComponent },
  { path: 'registro',        component: RegistroComponent },
  { path: 'home',            component: HomeComponent,            canActivate: [authGuard] },
  { path: 'nueva-solicitud', component: NuevaSolicitudComponent,  canActivate: [authGuard] },
  { path: 'solicitud/:id',   component: DetalleSolicitudComponent, canActivate: [authGuard] },
  { path: 'perfil',          component: PerfilComponent,          canActivate: [authGuard] },
  { path: 'dashboard',       component: DashboardComponent,       canActivate: [authGuard] },
  { path: '**',              component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
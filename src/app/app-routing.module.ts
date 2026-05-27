import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegistroComponent } from './features/auth/registro/registro.component';
import { HomeComponent } from './features/solicitudes/home/home.component';
import { NuevaSolicitudComponent } from './features/solicitudes/nueva-solicitud/nueva-solicitud.component';
import { DetalleSolicitudComponent } from './features/solicitudes/detalle-solicitud/detalle-solicitud.component';
import { PerfilComponent } from './features/perfil/perfil.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'nueva-solicitud', component: NuevaSolicitudComponent, canActivate: [authGuard] },
  { path: 'solicitud/:id', component: DetalleSolicitudComponent, canActivate: [authGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
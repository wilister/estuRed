import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-nueva-solicitud',
  templateUrl: './nueva-solicitud.component.html',
  styleUrls: ['./nueva-solicitud.component.scss']
})
export class NuevaSolicitudComponent implements OnInit {
  asignatura = '';
  descripcion = '';
  nivel = '';
  error = '';
  cargando = false;

  niveles = ['ESO', 'Bachillerato', 'Grado Medio', 'Grado Superior', 'Universidad'];

  constructor(private supabase: SupabaseService, public router: Router) {}

  async ngOnInit() {}

  async publicar() {
  this.error = '';
  if (!this.asignatura || !this.descripcion || !this.nivel) {
    this.error = 'Rellena todos los campos';
    return;
  }
  this.cargando = true;
  const user = await this.supabase.getUser();
  if (!user) { this.router.navigate(['/login']); return; }
  
  const { data: perfil, error: perfilError } = await this.supabase.getPerfil(user.id);
  
  if (perfilError || !perfil) {
    this.error = 'Error al obtener tu perfil. Vuelve a iniciar sesión.';
    this.cargando = false;
    return;
  }

  const { error } = await this.supabase.crearSolicitud(
    user.id, perfil.alias, this.asignatura, this.descripcion, this.nivel
  );

  if (error) {
    this.error = 'Error al publicar: ' + error.message;
    this.cargando = false;
    return;
  }

  this.cargando = false;
  this.router.navigate(['/home']);
}
}

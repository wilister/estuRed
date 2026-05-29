import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { RateLimitService } from '../../../core/services/rate-limit.service';

@Component({
  selector: 'app-nueva-solicitud',
  templateUrl: './nueva-solicitud.component.html',
  styleUrls: ['./nueva-solicitud.component.scss']
})
export class NuevaSolicitudComponent {
  asignatura = '';
  descripcion = '';
  nivel = '';
  error = '';
  cargando = false;

  niveles = ['ESO', 'Bachillerato', 'Grado Medio', 'Grado Superior', 'Universidad'];

  constructor(
    private supabase: SupabaseService,
    private rateLimit: RateLimitService,
    public router: Router
  ) {}

  async publicar() {
    this.error = '';

    // Comprueba el rate limiting antes de procesar la solicitud
    if (!this.rateLimit.puedeEjecutar('solicitud')) {
      this.error = `Demasiadas solicitudes. Espera ${this.rateLimit.tiempoRestante('solicitud')} segundos.`;
      return;
    }

    // Validaciones de campos obligatorios y longitud mínima
    if (!this.asignatura || !this.descripcion || !this.nivel) {
      this.error = 'Rellena todos los campos';
      return;
    }
    if (this.asignatura.length < 2) {
      this.error = 'La asignatura debe tener mínimo 2 caracteres';
      return;
    }
    if (this.descripcion.length < 10) {
      this.error = 'La descripción debe tener mínimo 10 caracteres';
      return;
    }

    // Sanitización de inputs para prevenir XSS
    this.asignatura = this.supabase.sanitizar(this.asignatura);
    this.descripcion = this.supabase.sanitizar(this.descripcion);

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

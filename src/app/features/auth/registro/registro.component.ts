import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { RateLimitService } from '../../../core/services/rate-limit.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  email = '';
  password = '';
  alias = '';
  nivel = '';
  centro = '';
  error = '';
  cargando = false;

  niveles = ['ESO', 'Bachillerato', 'Grado Medio', 'Grado Superior', 'Universidad'];

  constructor(
    private supabase: SupabaseService,
    private rateLimit: RateLimitService,
    private router: Router
  ) {}

  async registrar() {
    this.error = '';

    // Comprueba el rate limiting antes de procesar el registro
    if (!this.rateLimit.puedeEjecutar('registro')) {
      this.error = `Demasiados intentos. Espera ${this.rateLimit.tiempoRestante('registro')} segundos.`;
      return;
    }

    // Validaciones de campos obligatorios y longitud mínima
    if (!this.email || !this.password || !this.alias || !this.nivel || !this.centro) {
      this.error = 'Rellena todos los campos';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener mínimo 6 caracteres';
      return;
    }
    if (this.alias.length < 3) {
      this.error = 'El alias debe tener mínimo 3 caracteres';
      return;
    }

    // Sanitización de inputs para prevenir XSS antes de guardar en la base de datos
    this.alias = this.supabase.sanitizar(this.alias);
    this.centro = this.supabase.sanitizar(this.centro);

    this.cargando = true;
    const { data, error } = await this.supabase.registrar(this.email, this.password);

    if (error) {
      this.error = 'Error al registrarse: ' + error.message;
      this.cargando = false;
      return;
    }

    // Si el registro es exitoso, crea el perfil del usuario en la base de datos
    if (data.user) {
      await this.supabase.crearPerfil(data.user.id, this.alias, this.nivel, this.centro);
    }

    this.cargando = false;
    this.router.navigate(['/home']);
  }
}

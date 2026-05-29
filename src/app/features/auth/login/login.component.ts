import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { RateLimitService } from '../../../core/services/rate-limit.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  cargando = false;

  constructor(
    private supabase: SupabaseService,
    private rateLimit: RateLimitService,
    private router: Router
  ) {}

  async login() {
    this.error = '';

    if (!this.rateLimit.puedeEjecutar('login')) {
      this.error = `Demasiados intentos. Espera ${this.rateLimit.tiempoRestante('login')} segundos.`;
      return;
    }

    this.cargando = true;
    const { error } = await this.supabase.login(this.email, this.password);
    this.cargando = false;
    if (error) {
      this.error = 'Email o contraseña incorrectos';
    } else {
      this.router.navigate(['/home']);
    }
  }
}
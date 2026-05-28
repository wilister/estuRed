import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

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

  constructor(private supabase: SupabaseService, private router: Router) {}

  async registrar() {
  this.error = '';
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

  this.alias = this.supabase.sanitizar(this.alias);
  this.centro = this.supabase.sanitizar(this.centro);

  this.cargando = true;
  const { data, error } = await this.supabase.registrar(this.email, this.password);
  if (error) {
    this.error = 'Error al registrarse: ' + error.message;
    this.cargando = false;
    return;
  }
  if (data.user) {
    await this.supabase.crearPerfil(data.user.id, this.alias, this.nivel, this.centro);
  }
  this.cargando = false;
  this.router.navigate(['/home']);
}
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

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

  constructor(private supabase: SupabaseService, private router: Router) {}

  async login() {
    this.error = '';
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
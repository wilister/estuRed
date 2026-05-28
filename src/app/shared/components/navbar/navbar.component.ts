import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  usuario: any = null;
  alias = '';
  menuAbierto = false;

  constructor(private supabase: SupabaseService, private router: Router) {}

  async ngOnInit() {
    this.usuario = await this.supabase.getUser();
    if (this.usuario) {
      const { data: perfil } = await this.supabase.getPerfil(this.usuario.id);
      this.alias = perfil?.alias || '';
    }
    this.supabase.onAuthChange(async (user: any) => {
      this.usuario = user;
      if (user) {
        const { data: perfil } = await this.supabase.getPerfil(user.id);
        this.alias = perfil?.alias || '';
      } else {
        this.alias = '';
      }
    });
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

  async cerrarSesion() {
    await this.supabase.logout();
    this.usuario = null;
    this.alias = '';
    this.menuAbierto = false;
    this.router.navigate(['/login']);
  }

  navegarA(ruta: string) {
    this.menuAbierto = false;
    this.router.navigate([ruta]);
  }
}
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
    // Carga el usuario y su alias al inicializar la navbar
    this.usuario = await this.supabase.getUser();
    if (this.usuario) {
      const { data: perfil } = await this.supabase.getPerfil(this.usuario.id);
      this.alias = perfil?.alias || '';
    }

    // Se suscribe a los cambios de autenticación para actualizar
    // el alias en tiempo real cuando el usuario inicia o cierra sesión
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

  // Alterna la visibilidad del menú hamburguesa en móvil
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

  // Navega a la ruta indicada y cierra el menú móvil si estaba abierto
  navegarA(ruta: string) {
    this.menuAbierto = false;
    this.router.navigate([ruta]);
  }
}
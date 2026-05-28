import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  usuario: any = null;
  alias = '';
  notificaciones = 0;
  mostrarNotificaciones = false;
  listaNotificaciones: any[] = [];
  private canal: any = null;

  constructor(private supabase: SupabaseService, private router: Router) {}

  async ngOnInit() {
    this.usuario = await this.supabase.getUser();
    if (this.usuario) {
      const { data: perfil } = await this.supabase.getPerfil(this.usuario.id);
      this.alias = perfil?.alias || '';
      await this.cargarNotificaciones();
      this.suscribirseANotificaciones();
    }

    this.supabase.onAuthChange(async (user: any) => {
      this.usuario = user;
      if (user) {
        const { data: perfil } = await this.supabase.getPerfil(user.id);
        this.alias = perfil?.alias || '';
        await this.cargarNotificaciones();
        this.suscribirseANotificaciones();
      } else {
        this.alias = '';
        this.notificaciones = 0;
      }
    });
  }

  async cargarNotificaciones() {
    if (!this.usuario) return;
    const { data } = await this.supabase.getNotificaciones(this.usuario.id);
    this.listaNotificaciones = data || [];
    this.notificaciones = this.listaNotificaciones.length;
  }

  suscribirseANotificaciones() {
    if (!this.usuario) return;
    this.canal = this.supabase.suscribirseANotificaciones(
      this.usuario.id,
      async () => {
        await this.cargarNotificaciones();
      }
    );
  }

  async toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (this.mostrarNotificaciones && this.notificaciones > 0) {
      await this.supabase.marcarNotificacionesLeidas(this.usuario.id);
      this.notificaciones = 0;
    }
  }

  irASolicitud(solicitudId: string) {
    this.mostrarNotificaciones = false;
    this.router.navigate(['/solicitud', solicitudId]);
  }

  async cerrarSesion() {
    if (this.canal) this.canal.unsubscribe();
    await this.supabase.logout();
    this.usuario = null;
    this.alias = '';
    this.notificaciones = 0;
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    if (this.canal) this.canal.unsubscribe();
  }
}
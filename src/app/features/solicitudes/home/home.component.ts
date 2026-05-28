import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Solicitud } from '../../../core/models/modelos';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  solicitudes: Solicitud[] = [];
  solicitudesFiltradas: Solicitud[] = [];
  contadores: { [id: string]: number } = {};
  cargando = true;
  busqueda = '';
  nivelFiltro = '';
  ordenActivo = 'recientes';
  alias = '';
  totalSolicitudes = 0;
  totalRespuestas = 0;

  niveles = ['ESO', 'Bachillerato', 'Grado Medio', 'Grado Superior', 'Universidad'];

  constructor(private supabase: SupabaseService, private router: Router) {}

  async ngOnInit() {
    const user = await this.supabase.getUser();
    if (user) {
      const { data: perfil } = await this.supabase.getPerfil(user.id);
      this.alias = perfil?.alias || '';
    }

    const { data } = await this.supabase.getSolicitudes();
    this.solicitudes = data || [];

    for (const s of this.solicitudes) {
      const { count } = await this.supabase.contarRespuestas(s.id);
      this.contadores[s.id] = count || 0;
    }

    this.totalSolicitudes = this.solicitudes.length;
    this.totalRespuestas = Object.values(this.contadores).reduce((a, b) => a + b, 0);

    this.filtrar();
    this.cargando = false;
  }

  filtrar() {
    let resultado = this.solicitudes.filter(s => {
      const coincideBusqueda = s.asignatura.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        s.descripcion.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincideNivel = this.nivelFiltro ? s.nivel === this.nivelFiltro : true;
      return coincideBusqueda && coincideNivel;
    });

    if (this.ordenActivo === 'recientes') {
      resultado = resultado.sort((a, b) =>
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      );
    } else if (this.ordenActivo === 'mas-respondidas') {
      resultado = resultado.sort((a, b) =>
        (this.contadores[b.id] || 0) - (this.contadores[a.id] || 0)
      );
    } else if (this.ordenActivo === 'sin-respuesta') {
      resultado = resultado.filter(s => (this.contadores[s.id] || 0) === 0);
    }

    this.solicitudesFiltradas = resultado;
  }

  ordenar(tipo: string) {
    this.ordenActivo = tipo;
    this.filtrar();
  }

  verDetalle(id: string) {
    this.router.navigate(['/solicitud', id]);
  }

  nuevaSolicitud() {
    this.router.navigate(['/nueva-solicitud']);
  }

  getNivelClass(nivel: string): string {
    return 'nivel-' + nivel.replace(/ /g, '-');
  }
}
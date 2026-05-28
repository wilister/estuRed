import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Solicitud, Respuesta } from '../../../core/models/modelos';

@Component({
  selector: 'app-detalle-solicitud',
  templateUrl: './detalle-solicitud.component.html',
  styleUrls: ['./detalle-solicitud.component.scss']
})
export class DetalleSolicitudComponent implements OnInit {
  solicitud: Solicitud | null = null;
  respuestas: Respuesta[] = [];
  nuevaRespuesta = '';
  cargando = true;
  enviando = false;
  usuarioId = '';
  esAutor = false;
  valoraciones: { [respuestaId: string]: number } = {};
  votados: { [respuestaId: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private supabase: SupabaseService,
    public router: Router
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    const user = await this.supabase.getUser();
    this.usuarioId = user?.id || '';

    const { data: solicitudes } = await this.supabase.getSolicitudes();
    this.solicitud = solicitudes?.find((s: Solicitud) => s.id === id) || null;
    this.esAutor = this.solicitud?.usuario_id === this.usuarioId;

    await this.cargarRespuestas();
    this.cargando = false;
  }

  async cargarRespuestas() {
    const id = this.route.snapshot.paramMap.get('id')!;
    const { data: respuestas } = await this.supabase.getRespuestas(id);
    this.respuestas = respuestas || [];

    for (const r of this.respuestas) {
      const { data: vals } = await this.supabase.getValoraciones(r.id);
      this.valoraciones[r.id] = vals?.length || 0;
      this.votados[r.id] = vals?.some((v: any) => v.usuario_id === this.usuarioId) || false;
    }
  }

  async toggleVoto(respuestaId: string) {
    if (!this.usuarioId) return;
    if (this.votados[respuestaId]) {
      await this.supabase.quitarValoracion(respuestaId, this.usuarioId);
      this.valoraciones[respuestaId]--;
      this.votados[respuestaId] = false;
    } else {
      await this.supabase.valorar(respuestaId, this.usuarioId);
      this.valoraciones[respuestaId]++;
      this.votados[respuestaId] = true;
    }
  }

  async enviarRespuesta() {
    if (!this.nuevaRespuesta.trim()) return;
    this.enviando = true;
    const user = await this.supabase.getUser();
    if (!user) return;
    const { data: perfil } = await this.supabase.getPerfil(user.id);
    await this.supabase.crearRespuesta(
      this.solicitud!.id, user.id, perfil.alias, this.nuevaRespuesta
    );
    await this.cargarRespuestas();
    this.nuevaRespuesta = '';
    this.enviando = false;
  }

  async eliminarSolicitud() {
    if (!confirm('¿Seguro que quieres eliminar esta solicitud?')) return;
    await this.supabase.eliminarSolicitud(this.solicitud!.id);
    this.router.navigate(['/home']);
  }
}
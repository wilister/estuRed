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

    const { data: respuestas } = await this.supabase.getRespuestas(id);
    this.respuestas = respuestas || [];
    this.cargando = false;
  }

  async enviarRespuesta() {
    if (!this.nuevaRespuesta.trim()) return;
    this.enviando = true;
    const user = await this.supabase.getUser();
    if (!user) return;
    const { data: perfil } = await this.supabase.getPerfil(user.id);
    await this.supabase.crearRespuesta(this.solicitud!.id, user.id, perfil.alias, this.nuevaRespuesta);
    const { data: respuestas } = await this.supabase.getRespuestas(this.solicitud!.id);
    this.respuestas = respuestas || [];
    this.nuevaRespuesta = '';
    this.enviando = false;
  }

  async eliminarSolicitud() {
    if (!confirm('¿Seguro que quieres eliminar esta solicitud?')) return;
    await this.supabase.eliminarSolicitud(this.solicitud!.id);
    this.router.navigate(['/home']);
  }
}
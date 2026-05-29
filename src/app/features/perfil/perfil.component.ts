import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { Perfil, Solicitud } from '../../core/models/modelos';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  perfil: Perfil | null = null;
  misSolicitudes: Solicitud[] = [];
  contadores: { [id: string]: number } = {};
  cargando = true;
  editando = false;
  guardando = false;
  mensaje = '';

  aliasEdit = '';
  nivelEdit = '';
  centroEdit = '';

  niveles = ['ESO', 'Bachillerato', 'Grado Medio', 'Grado Superior', 'Universidad'];

  constructor(private supabase: SupabaseService, private router: Router) {}

  async ngOnInit() {
    const user = await this.supabase.getUser();
    if (user) {
      // Carga el perfil y las solicitudes publicadas por el usuario
      const { data } = await this.supabase.getPerfil(user.id);
      this.perfil = data;

      const { data: solicitudes } = await this.supabase.getMisSolicitudes(user.id);
      this.misSolicitudes = solicitudes || [];

      // Cuenta las respuestas de cada solicitud del usuario
      for (const s of this.misSolicitudes) {
        const { count } = await this.supabase.contarRespuestas(s.id);
        this.contadores[s.id] = count || 0;
      }
    }
    this.cargando = false;
  }

  // Activa el modo edición cargando los datos actuales en los campos del formulario
  activarEdicion() {
    this.aliasEdit = this.perfil!.alias;
    this.nivelEdit = this.perfil!.nivel;
    this.centroEdit = this.perfil!.centro;
    this.editando = true;
    this.mensaje = '';
  }

  cancelarEdicion() {
    this.editando = false;
    this.mensaje = '';
  }

  async guardarCambios() {
    // Validaciones de campos obligatorios y longitud mínima
    if (!this.aliasEdit || !this.nivelEdit || !this.centroEdit) {
      this.mensaje = 'Rellena todos los campos';
      return;
    }
    if (this.aliasEdit.length < 3) {
      this.mensaje = 'El alias debe tener mínimo 3 caracteres';
      return;
    }

    // Sanitización de inputs para prevenir XSS
    this.aliasEdit = this.supabase.sanitizar(this.aliasEdit);
    this.centroEdit = this.supabase.sanitizar(this.centroEdit);

    this.guardando = true;
    const user = await this.supabase.getUser();
    if (!user) return;

    const { error } = await this.supabase.actualizarPerfil(
      user.id, this.aliasEdit, this.nivelEdit, this.centroEdit
    );

    if (error) {
      this.mensaje = 'Error al guardar los cambios';
    } else {
      // Actualiza los datos del perfil en memoria sin recargar
      this.perfil!.alias = this.aliasEdit;
      this.perfil!.nivel = this.nivelEdit;
      this.perfil!.centro = this.centroEdit;
      this.editando = false;
      this.mensaje = 'Perfil actualizado correctamente';
    }
    this.guardando = false;
  }

  verDetalle(id: string) {
    this.router.navigate(['/solicitud', id]);
  }
}
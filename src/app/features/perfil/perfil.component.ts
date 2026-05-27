import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { Perfil } from '../../core/models/modelos';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  perfil: Perfil | null = null;
  cargando = true;
  editando = false;
  guardando = false;
  mensaje = '';

  aliasEdit = '';
  nivelEdit = '';
  centroEdit = '';

  niveles = ['ESO', 'Bachillerato', 'Grado Medio', 'Grado Superior', 'Universidad'];

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const user = await this.supabase.getUser();
    if (user) {
      const { data } = await this.supabase.getPerfil(user.id);
      this.perfil = data;
    }
    this.cargando = false;
  }

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
    if (!this.aliasEdit || !this.nivelEdit || !this.centroEdit) {
      this.mensaje = 'Rellena todos los campos';
      return;
    }
    this.guardando = true;
    const user = await this.supabase.getUser();
    if (!user) return;
    const { error } = await this.supabase.actualizarPerfil(user.id, this.aliasEdit, this.nivelEdit, this.centroEdit);
    if (error) {
      this.mensaje = 'Error al guardar los cambios';
    } else {
      this.perfil!.alias = this.aliasEdit;
      this.perfil!.nivel = this.nivelEdit;
      this.perfil!.centro = this.centroEdit;
      this.editando = false;
      this.mensaje = '✅ Perfil actualizado correctamente';
    }
    this.guardando = false;
  }
}
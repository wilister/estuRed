import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Perfil, Solicitud, Respuesta } from '../models/modelos';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private canales: { [key: string]: any } = {};

  constructor() {
  this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
    auth: {
      persistSession: true,
      storageKey: 'estuRed-auth',
      storage: window.localStorage,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: 'implicit',
      lock: async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
        return fn();
      }
    }
  });
}

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // AUTH
  async registrar(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  async login(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async logout() {
    return this.supabase.auth.signOut();
  }

  async getUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }

  async getSession() {
    return this.supabase.auth.getSession();
  }

  onAuthChange(callback: (user: any) => void) {
    this.supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }

  // PERFILES
  async crearPerfil(id: string, alias: string, nivel: string, centro: string) {
    return this.supabase.from('perfiles').insert({ id, alias, nivel, centro });
  }

  async getPerfil(id: string) {
    return this.supabase.from('perfiles').select('*').eq('id', id).single();
  }

  async actualizarPerfil(id: string, alias: string, nivel: string, centro: string) {
    return this.supabase.from('perfiles').update({ alias, nivel, centro }).eq('id', id);
  }

  // SOLICITUDES
  async crearSolicitud(usuario_id: string, alias_usuario: string, asignatura: string, descripcion: string, nivel: string) {
    return this.supabase.from('solicitudes').insert({ usuario_id, alias_usuario, asignatura, descripcion, nivel });
  }

  async getSolicitudes() {
    return this.supabase.from('solicitudes').select('*').order('created_at', { ascending: false });
  }

  async eliminarSolicitud(id: string) {
    return this.supabase.from('solicitudes').delete().eq('id', id);
  }

  // RESPUESTAS
  async crearRespuesta(solicitud_id: string, usuario_id: string, alias_usuario: string, contenido: string) {
    return this.supabase.from('respuestas').insert({ solicitud_id, usuario_id, alias_usuario, contenido });
  }

  async getRespuestas(solicitud_id: string) {
    return this.supabase.from('respuestas').select('*').eq('solicitud_id', solicitud_id).order('created_at', { ascending: true });
  }

  async contarRespuestas(solicitud_id: string) {
    return this.supabase
      .from('respuestas')
      .select('id', { count: 'exact', head: true })
      .eq('solicitud_id', solicitud_id);
  }

  // VALORACIONES
  async getValoraciones(respuesta_id: string) {
    return this.supabase
      .from('valoraciones')
      .select('*')
      .eq('respuesta_id', respuesta_id);
  }

  async valorar(respuesta_id: string, usuario_id: string) {
    return this.supabase
      .from('valoraciones')
      .insert({ respuesta_id, usuario_id });
  }

  async quitarValoracion(respuesta_id: string, usuario_id: string) {
    return this.supabase
      .from('valoraciones')
      .delete()
      .eq('respuesta_id', respuesta_id)
      .eq('usuario_id', usuario_id);
  }

  async getValoracionesDeRespuestas(solicitud_id: string) {
    return this.supabase
      .from('valoraciones')
      .select('*')
      .in('respuesta_id',
        (await this.supabase
          .from('respuestas')
          .select('id')
          .eq('solicitud_id', solicitud_id)
        ).data?.map((r: any) => r.id) || []
      );
  }

  // NOTIFICACIONES
  async getNotificaciones(usuario_id: string) {
    return this.supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', usuario_id)
      .eq('leida', false)
      .order('created_at', { ascending: false });
  }

  async crearNotificacion(usuario_id: string, solicitud_id: string, respuesta_id: string, mensaje: string) {
    return this.supabase
      .from('notificaciones')
      .insert({ usuario_id, solicitud_id, respuesta_id, mensaje });
  }

  async marcarNotificacionesLeidas(usuario_id: string) {
    return this.supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('usuario_id', usuario_id);
  }

  suscribirseANotificaciones(usuario_id: string, callback: (payload: any) => void) {
    const canalKey = 'notificaciones-' + usuario_id;

    if (this.canales[canalKey]) {
      this.supabase.removeChannel(this.canales[canalKey]);
    }

    this.canales[canalKey] = this.supabase
      .channel(canalKey)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `usuario_id=eq.${usuario_id}`
        },
        callback
      )
      .subscribe();

    return this.canales[canalKey];
  }
}
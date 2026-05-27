export interface Perfil {
  id: string;
  alias: string;
  nivel: string;
  centro: string;
  created_at?: string;
}

export interface Solicitud {
  id: string;
  usuario_id: string;
  alias_usuario: string;
  asignatura: string;
  descripcion: string;
  nivel: string;
  created_at?: string;
}

export interface Respuesta {
  id: string;
  solicitud_id: string;
  usuario_id: string;
  alias_usuario: string;
  contenido: string;
  created_at?: string;
}
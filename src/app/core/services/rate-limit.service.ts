import { Injectable } from '@angular/core';

// Servicio de limitación de peticiones mediante el patrón de ventana deslizante.
// Previene el spam y los ataques de fuerza bruta limitando el número de acciones
// que un usuario puede realizar en un período de tiempo determinado.
@Injectable({ providedIn: 'root' })
export class RateLimitService {
  private intentos: { [key: string]: number[] } = {};

  // Límites configurados por tipo de acción (max intentos / ventana en ms)
  private readonly LIMITES: { [key: string]: { max: number; ventana: number } } = {
    login:     { max: 5,  ventana: 60000 },
    registro:  { max: 3,  ventana: 60000 },
    solicitud: { max: 5,  ventana: 60000 },
    respuesta: { max: 10, ventana: 60000 },
    valoracion:{ max: 20, ventana: 60000 }
  };

  // Comprueba si la acción puede ejecutarse y registra el intento
  puedeEjecutar(accion: string): boolean {
    const ahora = Date.now();
    const limite = this.LIMITES[accion];
    if (!limite) return true;

    if (!this.intentos[accion]) {
      this.intentos[accion] = [];
    }

    // Elimina los intentos que han superado la ventana de tiempo
    this.intentos[accion] = this.intentos[accion].filter(
      t => ahora - t < limite.ventana
    );

    if (this.intentos[accion].length >= limite.max) {
      return false;
    }

    this.intentos[accion].push(ahora);
    return true;
  }

  // Devuelve los segundos restantes hasta que la acción vuelva a estar disponible
  tiempoRestante(accion: string): number {
    const ahora = Date.now();
    const limite = this.LIMITES[accion];
    if (!limite || !this.intentos[accion]?.length) return 0;

    const masAntiguo = this.intentos[accion][0];
    const restante = limite.ventana - (ahora - masAntiguo);
    return Math.ceil(restante / 1000);
  }
}
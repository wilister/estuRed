import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RateLimitService {
  private intentos: { [key: string]: number[] } = {};

  private readonly LIMITES: { [key: string]: { max: number; ventana: number } } = {
    login: { max: 5, ventana: 60000 },
    registro: { max: 3, ventana: 60000 },
    solicitud: { max: 5, ventana: 60000 },
    respuesta: { max: 10, ventana: 60000 },
    valoracion: { max: 20, ventana: 60000 }
  };

  puedeEjecutar(accion: string): boolean {
    const ahora = Date.now();
    const limite = this.LIMITES[accion];
    if (!limite) return true;

    if (!this.intentos[accion]) {
      this.intentos[accion] = [];
    }

    this.intentos[accion] = this.intentos[accion].filter(
      t => ahora - t < limite.ventana
    );

    if (this.intentos[accion].length >= limite.max) {
      return false;
    }

    this.intentos[accion].push(ahora);
    return true;
  }

  tiempoRestante(accion: string): number {
    const ahora = Date.now();
    const limite = this.LIMITES[accion];
    if (!limite || !this.intentos[accion]?.length) return 0;

    const masAntiguo = this.intentos[accion][0];
    const restante = limite.ventana - (ahora - masAntiguo);
    return Math.ceil(restante / 1000);
  }
}
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { SupabaseService } from '../../core/services/supabase.service';

// Registro global de todos los tipos de gráficas de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  // Referencias a los elementos canvas donde se renderizan las gráficas
  @ViewChild('chartNiveles') chartNiveles!: ElementRef;
  @ViewChild('chartAsignaturas') chartAsignaturas!: ElementRef;
  @ViewChild('chartDias') chartDias!: ElementRef;

  totalSolicitudes = 0;
  totalRespuestas = 0;
  totalUsuarios = 0;
  cargando = true;

  private solicitudes: any[] = [];

  constructor(private supabase: SupabaseService) {}

  // ngOnInit carga los datos de la base de datos de forma asíncrona
  async ngOnInit() {
    const { data: solicitudes } = await this.supabase.getSolicitudes();
    this.solicitudes = solicitudes || [];
    this.totalSolicitudes = this.solicitudes.length;

    // Cuenta el total de respuestas de todas las solicitudes
    let totalResp = 0;
    for (const s of this.solicitudes) {
      const { count } = await this.supabase.contarRespuestas(s.id);
      totalResp += count || 0;
    }
    this.totalRespuestas = totalResp;

    const { data: perfiles } = await this.supabase.getTodosPerfiles();
    this.totalUsuarios = perfiles?.length || 0;

    this.cargando = false;
  }

  // ngAfterViewInit espera a que los datos estén cargados antes de inicializar las gráficas
  // ya que los elementos canvas deben estar disponibles en el DOM
  async ngAfterViewInit() {
    await this.esperarDatos();
    this.crearGraficas();
  }

  // Espera a que ngOnInit termine de cargar los datos mediante polling
  esperarDatos(): Promise<void> {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        if (!this.cargando) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  crearGraficas() {
    this.crearGraficaNiveles();
    this.crearGraficaAsignaturas();
    this.crearGraficaDias();
  }

  // Gráfica de donut: distribución de solicitudes por nivel educativo
  crearGraficaNiveles() {
    const niveles: { [key: string]: number } = {};
    this.solicitudes.forEach(s => {
      niveles[s.nivel] = (niveles[s.nivel] || 0) + 1;
    });

    new Chart(this.chartNiveles.nativeElement, {
      type: 'doughnut',
      data: {
        labels: Object.keys(niveles),
        datasets: [{
          data: Object.values(niveles),
          backgroundColor: ['#5b9bd5', '#4caf7d', '#e8935a', '#b07dd5', '#d5b55a'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#ffffff', padding: 16 }
          }
        }
      }
    });
  }

  // Gráfica de barras: top 6 asignaturas más consultadas
  crearGraficaAsignaturas() {
    const asignaturas: { [key: string]: number } = {};
    this.solicitudes.forEach(s => {
      const key = s.asignatura.toLowerCase();
      asignaturas[key] = (asignaturas[key] || 0) + 1;
    });

    const sorted = Object.entries(asignaturas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    new Chart(this.chartAsignaturas.nativeElement, {
      type: 'bar',
      data: {
        labels: sorted.map(([k]) => k),
        datasets: [{
          label: 'Solicitudes',
          data: sorted.map(([, v]) => v),
          backgroundColor: '#e94560',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#aaaaaa' }, grid: { color: '#333' } },
          y: { ticks: { color: '#aaaaaa', stepSize: 1 }, grid: { color: '#333' } }
        }
      }
    });
  }

  // Gráfica de línea: actividad de solicitudes en los últimos 7 días
  crearGraficaDias() {
    const dias: { [key: string]: number } = {};

    // Inicializa los últimos 7 días con valor 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      dias[key] = 0;
    }

    // Cuenta las solicitudes de cada día
    this.solicitudes.forEach(s => {
      const fecha = new Date(s.created_at);
      const key = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      if (dias[key] !== undefined) {
        dias[key]++;
      }
    });

    new Chart(this.chartDias.nativeElement, {
      type: 'line',
      data: {
        labels: Object.keys(dias),
        datasets: [{
          label: 'Solicitudes',
          data: Object.values(dias),
          borderColor: '#e94560',
          backgroundColor: 'rgba(233,69,96,0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#e94560'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#aaaaaa' }, grid: { color: '#333' } },
          y: { ticks: { color: '#aaaaaa', stepSize: 1 }, grid: { color: '#333' }, min: 0 }
        }
      }
    });
  }
}

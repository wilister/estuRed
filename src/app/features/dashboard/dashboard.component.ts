import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { SupabaseService } from '../../core/services/supabase.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('chartNiveles') chartNiveles!: ElementRef;
  @ViewChild('chartAsignaturas') chartAsignaturas!: ElementRef;
  @ViewChild('chartDias') chartDias!: ElementRef;

  totalSolicitudes = 0;
  totalRespuestas = 0;
  totalUsuarios = 0;
  cargando = true;

  private solicitudes: any[] = [];
  private respuestas: any[] = [];

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const { data: solicitudes } = await this.supabase.getSolicitudes();
    this.solicitudes = solicitudes || [];

    const { data: respuestas } = await this.supabase.getRespuestas('');
    this.respuestas = respuestas || [];

    this.totalSolicitudes = this.solicitudes.length;

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

  async ngAfterViewInit() {
    await this.esperarDatos();
    this.crearGraficas();
  }

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
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { ticks: { color: '#aaaaaa' }, grid: { color: '#333' } },
          y: {
            ticks: { color: '#aaaaaa', stepSize: 1 },
            grid: { color: '#333' }
          }
        }
      }
    });
  }

  crearGraficaDias() {
    const dias: { [key: string]: number } = {};
    const ultimosDias = 7;

    for (let i = ultimosDias - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      dias[key] = 0;
    }

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
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { ticks: { color: '#aaaaaa' }, grid: { color: '#333' } },
          y: {
            ticks: { color: '#aaaaaa', stepSize: 1 },
            grid: { color: '#333' },
            min: 0
          }
        }
      }
    });
  }
}

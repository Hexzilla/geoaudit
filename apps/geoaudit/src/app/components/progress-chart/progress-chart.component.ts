import { Component, Input, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  // ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexFill,
  ApexLegend,
  ApexYAxis,
  ApexGrid,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  fill: ApexFill;
  legend: ApexLegend;
  grid: ApexGrid;
};

@Component({
  selector: 'geoaudit-progress-chart',
  templateUrl: './progress-chart.component.html',
  styleUrls: ['./progress-chart.component.scss']
})
export class ProgressChartComponent implements OnInit {
  @Input() series;

  public chartOptions: Partial<ChartOptions> = {
    series: [],
    chart: {
      type: 'bar',
      height: 70,
      stacked: true,
      stackType: '100%',
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      sparkline: {
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "100%"
      },
    },
    stroke: {
      show: false,
      width: 0,
      colors: ['#fff'],
    },
    title: {
      text: '',
    },
    xaxis: {
      categories: [],
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    tooltip: {
      x: {
        show: false,
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
      show: false,
      position: 'bottom',
      horizontalAlign: 'left',
      offsetX: 40,
    },
  };
  constructor() {
    console.log("progress-chart", this.series);
  }

  ngOnInit(): void {
    console.log("progress-chart-ngOnInit", this.series);
    this.chartOptions.series = this.series;
  }
}

import { CommonModule } from '@angular/common';
import { Component, ContentChild, ContentChildren, Input, QueryList, TemplateRef } from '@angular/core';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-table',
  imports: [TableModule, CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
  @Input() datos: any[] = [];
  @Input() columnas: any[] = [];
  @ContentChildren(PrimeTemplate) plantillas: QueryList<PrimeTemplate> | undefined;

  plantillaEncabezado: TemplateRef<any> | undefined;
  plantillaCuerpo: TemplateRef<any> | undefined;

  @ContentChild('customHeader', { static: false }) customHeader: TemplateRef<any> | undefined;
  @ContentChild('customBody', { static: false }) customBody: TemplateRef<any> | undefined;

  ngAfterContentInit() {
    this.plantillas?.forEach((plantilla) => {
      switch (plantilla.getType()) {
        case 'header':
          this.plantillaEncabezado = plantilla.template;
          break;
        case 'body':
          this.plantillaCuerpo = plantilla.template;
          break;
      }
    });
  }
}

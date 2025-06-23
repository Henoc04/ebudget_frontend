import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByCode',
  standalone: true // Uncomment if you want to use this pipe as a standalone pipe in Angular 14+
})
export class FilterByCodePipe implements PipeTransform {

    transform(items: any[], searchNomenclatureCode: string, fields: string[]): any[] {
    if (!items || !searchNomenclatureCode || !fields?.length) return items;

    const term = searchNomenclatureCode.toString().toLowerCase();

    return items.filter(item =>
      fields.some(fieldPath => {
        const value = this.getNestedValue(item, fieldPath);
        return value?.toString().toLowerCase().includes(term);
      })
    );
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }


}

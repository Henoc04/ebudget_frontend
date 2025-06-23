import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'multiFieldFilter',
  standalone: true // Uncomment if you want to use this pipe as a standalone pipe in Angular 14+
  // pure: true // Uncomment if you want to make this pipe pure (default is true)
})
export class MultiFieldFilterPipe implements PipeTransform {

  transform(
  items: any[],
  code: string,
  codeFields: string[],
  financing: string,
  financingFields: string[]
): any[] {
  if (!items) return [];
  
  let filtered = items;

  // Filtrer par code si présent
  if (code && codeFields?.length) {
    const codeTerm = code.toLowerCase();
    filtered = filtered.filter(item =>
      codeFields.some(fieldPath => {
        const value = this.getNestedValue(item, fieldPath);
        return value?.toString().toLowerCase().includes(codeTerm);
      })
    );
  }

  // Puis filtrer par financing si présent
  if (financing && financingFields?.length && financing !== "All financings") {
    const financingTerm = financing.toLowerCase();
    filtered = filtered.filter(item =>
      financingFields.some(fieldPath => {
        const value = this.getNestedValue(item, fieldPath);
        return value?.toString().toLowerCase().includes(financingTerm);
      })
    );
  }

  return filtered;
}

private getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}



}

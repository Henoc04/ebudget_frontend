
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customcurrency',
  standalone: true // Uncomment if you want to use this pipe as a standalone pipe in Angular 14+
})
export class CustomcurrencyPipe implements PipeTransform {
  
  transform(value: any): any {
    if (value === null || value === undefined) {
      return '';
    }
    return Number(value).toLocaleString('de-DE') + ' FCFA';    
  }


}

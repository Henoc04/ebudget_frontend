import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { HeaderComponent } from "./components/ui/header/header.component";
import { FooterComponent } from './components/ui/footer/footer.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent, 
    CommonModule, 
    ReactiveFormsModule,
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'eBudget';

  constructor(public authService: AuthService, private readonly router: Router) {}
  
  getUserName(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
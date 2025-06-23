import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true, // nécessaire pour standalone component
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('200ms ease-out', style({ transform: 'translateX(0%)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)' })),
      ]),
    ]),
  ],
})
export class HeaderComponent {
  userMenuOpen = false;
  mobileMenuOpen = false;

  constructor(public authService: AuthService, private readonly router: Router) {}

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

@ViewChild('menuButton') menuButtonRef!: ElementRef;
@ViewChild('userMenu') userMenuRef!: ElementRef;
@HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent) {
  const target = event.target as Node;
  if (
    this.userMenuRef &&
    this.menuButtonRef &&
    !this.userMenuRef.nativeElement.contains(target) &&
    !this.menuButtonRef.nativeElement.contains(target)
  ) {
    this.userMenuOpen = false;
    this.mobileMenuOpen = false;
  }
}

  navLinks = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Centers', route: '/centers' },
    { label: 'Budgets', route: '/budgets' },
    { label: 'Payment Orders', route: '/payment-ordersh' },
    { label: 'Wire Transfers', route: '/wire-transfersh' }
  ];
}

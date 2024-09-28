import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  showProgressBar: any;

  constructor(private router: Router) {}

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  logOut() {
    this.showProgressBar = true;
    setTimeout(() => {
      this.showProgressBar = false;
      this.router.navigate(['/login']);
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('role');
    }, 1000);
  }
}

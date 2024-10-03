import { Injectable } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PrintServiceService {
  public isListenerAttached = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.attachPrintListener(); // Attach when navigation ends
      } else if (event instanceof NavigationStart) {
        this.removePrintListener(); // Remove before navigating away
      }
    });
  }

  // Attach the event listener if it's not already attached
  public attachPrintListener(): void {
    if (!this.isListenerAttached) {
      document.addEventListener('keydown', this.onKeyPress);
      this.isListenerAttached = true;
    }
  }

  // Remove the event listener when no longer needed
  public removePrintListener(): void {
    if (this.isListenerAttached) {
      document.removeEventListener('keydown', this.onKeyPress);
      this.isListenerAttached = false;
    }
  }

  // Handle the Control + P key event
  public onKeyPress(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'p') {
      event.preventDefault();
      window.print();
    }
  }
}

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReminderService {
  constructor() {}

  public reminders = new Subject<string>();
  reminders$ = this.reminders.asObservable();

  // Function to convert dd-mm-yyyy to Date object
  public parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // Month is 0-based
  }

  setReminder(expiryDateString: string) {
    const expiryDate = this.parseDate(expiryDateString);
    const reminderDate = new Date(expiryDate);
    reminderDate.setMonth(reminderDate.getMonth() - 1); // 1 month before

    const now = new Date();

    // Check if the current date is the reminder date
    if (now.toDateString() === reminderDate.toDateString()) {
      this.reminders.next(
        `Reminder: Expiry date is approaching on ${expiryDate.toLocaleDateString()}`
      );
    }
  }
}

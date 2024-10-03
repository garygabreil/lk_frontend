import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReminderService {
  public reminders = new Subject<string>();
  reminders$ = this.reminders.asObservable();

  // Function to convert dd-mm-yyyy to Date object
  public parseDate(dateString: string): Date | null {
    if (!dateString || typeof dateString !== 'string') {
      return null; // Return null if the input is invalid
    }

    const [day, month, year] = dateString.split('-').map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return null; // Return null if any component is invalid
    }

    return new Date(year, month - 1, day); // Month is 0-based
  }

  setReminder(expiryDateString: string) {
    const expiryDate = this.parseDate(expiryDateString);

    // Check if the date parsing was successful
    if (!expiryDate) {
      return; // Exit the function if parsing failed
    }

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

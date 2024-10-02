import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}

  // create product
  createProduct(product: any) {
    return this.http.post('http://localhost:3000/api/product/create', product);
  }

  //getAllProducts
  getAllProducts() {
    return this.http.get('http://localhost:3000/api/product/getAll');
  }

  //getAllProducts
  getProductByName(mde: any) {
    return this.http.post('http://localhost:3000/api/product/getMedicine', {
      medicineName: mde,
    });
  }

  //getAllProducts
  getProductBySupplierName(mde: any) {
    return this.http.post('http://localhost:3000/api/product/getSupplier', {
      supplierName: mde,
    });
  }
  //getProductById
  getProductById(id: any) {
    return this.http.get(
      'http://localhost:3000/api/product/getProductById/' + id
    );
  }

  //updateProductById
  updateProductById(id: any, product: any) {
    return this.http.put(
      'http://localhost:3000/api/product/updateProductById/' + id,
      product
    );
  }

  //deleteProductById
  deleteProductById(id: any) {
    return this.http.delete(
      'http://localhost:3000/api/product/deleteProductById/' + id
    );
  }

  // PATIENT
  // create patient
  createPatient(patient: any) {
    return this.http.post('http://localhost:3000/api/patient/create', patient);
  }

  //getAllPatient
  getAllPatient() {
    return this.http.get('http://localhost:3000/api/patient/getAll');
  }

  //getProductById
  getPatientById(id: any) {
    return this.http.get(
      'http://localhost:3000/api/patient/getPatientById/' + id
    );
  }

  //updateProductById
  updatePatientById(id: any, patient: any) {
    return this.http.put(
      'http://localhost:3000/api/patient/updatePatientById/' + id,
      patient
    );
  }
  getPatientByName(name: any) {
    return this.http.get('http://localhost:3000/api/patient/getName/' + name);
  }

  //deleteProductById
  deletePatientById(id: any) {
    return this.http.delete(
      'http://localhost:3000/api/patient/deletePatientById/' + id
    );
  }

  //INVOICES
  // createInvoice
  createInvoice(invoice: any) {
    return this.http.post('http://localhost:3000/api/invoices/create', invoice);
  }
  createPoInvoice(invoice: any) {
    return this.http.post(
      'http://localhost:3000/api/po/invoices/create',
      invoice
    );
  }

  getAllInvoices() {
    return this.http.get('http://localhost:3000/api/invoices/getAll');
  }
  getAllPoInvoices() {
    return this.http.get('http://localhost:3000/api/po/invoices/getAll');
  }

  //getInvoiceById
  getInvoiceById(id: any) {
    return this.http.get(
      'http://localhost:3000/api/invoices/getInvoiceByID/' + id
    );
  }

  getInvoiceByPoId(id: any) {
    return this.http.get(
      'http://localhost:3000/api/po/invoices/getInvoiceByID/' + id
    );
  }
  //updateInvoiceByd
  updateInvoiceById(id: any, invoice: any) {
    return this.http.put(
      'http://localhost:3000/api/invoices/updateInvoiceById/' + id,
      invoice
    );
  }
  updateInvoiceByPoId(id: any, invoice: any) {
    return this.http.put(
      'http://localhost:3000/api/po/invoices/updateInvoiceById/' + id,
      invoice
    );
  }
  getInvoiceDate(formattedDate: any) {
    return this.http.post(
      'http://localhost:3000/api/invoices/groupedInvoicesByDate',
      {
        date: formattedDate,
      }
    );
  }
  getInvoicePoDate(formattedDate: any) {
    return this.http.post(
      'http://localhost:3000/api/po/invoices/groupedInvoicesByDate',
      {
        date: formattedDate,
      }
    );
  }
  getInvoicesTodayInvoices() {
    return this.http.get(
      'http://localhost:3000/api/invoices/groupedInvoicesCreatedToday'
    );
  }
  getInvoicesTodayPoInvoices() {
    return this.http.get(
      'http://localhost:3000/api/po/invoices/groupedInvoicesCreatedToday'
    );
  }

  //Qua
  updateQuantity(id: any) {
    return this.http.post('http://localhost:3000/api/product/updateQ', id);
  }
  //updateInvoiceByd
  // getAllInvoiceByDate() {
  //   return this.http.get('http://localhost:3000/api/invoices/groupedInvoices');
  // }
  deleteInvoiceById(id: any) {
    return this.http.delete('http://localhost:3000/api/invoices/delete/' + id);
  }

  deleteInvoiceByPoId(id: any) {
    return this.http.delete(
      'http://localhost:3000/api/po/invoices/delete/' + id
    );
  }
  //DOCTORS
  // create doctor
  createDoctor(doctor: any) {
    return this.http.post('http://localhost:3000/api/doctor/create', doctor);
  }

  //getAllDoctors
  getAllDoctors() {
    return this.http.get('http://localhost:3000/api/doctor/getAll');
  }

  //getDoctorById
  getDoctorById(id: any) {
    return this.http.get(
      'http://localhost:3000/api/doctor/getDoctorById/' + id
    );
  }

  //updateDoctorById
  updateDoctorById(id: any, doctor: any) {
    return this.http.put(
      'http://localhost:3000/api/doctor/updateDoctorById/' + id,
      doctor
    );
  }

  //deleteDoctorById
  deleteDoctorById(id: any) {
    return this.http.delete(
      'http://localhost:3000/api/doctor/deleteDoctorById/' + id
    );
  }

  // STAFF
  // 1
  // create staff
  createStaff(staff: any) {
    return this.http.post('http://localhost:3000/api/staff/create', staff);
  }

  // 2
  //getAllDoctors
  getAllStaffs() {
    return this.http.get('http://localhost:3000/api/staff/getAll');
  }

  // 3
  //getDoctorById
  getStaffById(id: any) {
    return this.http.get('http://localhost:3000/api/staff/getStaffById/' + id);
  }

  // 4
  //updateDoctorById
  updateStaffById(id: any, staff: any) {
    return this.http.put(
      'http://localhost:3000/api/staff/updateStaffById/' + id,
      staff
    );
  }
  // 5
  //deleteDoctorById
  deleteStaffById(id: any) {
    return this.http.delete(
      'http://localhost:3000/api/staff/deleteStaffById/' + id
    );
  }

  // getPatient
  getPatientByPid(id: any) {
    return this.http.get('http://localhost:3000/api/staff/getStaffByPID/' + id);
  }

  // states
  getInvoicesSpecificDate(todayInvoices: any) {
    return this.http
      .post('http://localhost:3000/api/invoices/getInvoiceByDate', {
        invoiceDate: todayInvoices,
      })
      .pipe(
        catchError(this.handleError) // Handle the error here
      );
  }
  // Error handling method
  private handleError(error: HttpErrorResponse): Observable<any> {
    if (error.status === 404) {
      // Silently handle the 404 error without logging
      return of(null); // Return a null observable or any fallback data you need
    } else {
      // Log and handle other errors if needed
      console.error(`Error occurred: ${error.message}`);
      return throwError(
        () => new Error('Something went wrong, please try again later.')
      );
    }
  }

  getInvoicesPoSpecificDate(todayInvoices: any) {
    return this.http
      .post('http://localhost:3000/api/po/invoices/getInvoiceByDate', {
        invoiceDate: todayInvoices,
      })
      .pipe(
        catchError(this.handleError) // Handle the error here
      );
  }
}

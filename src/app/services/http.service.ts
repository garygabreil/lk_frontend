import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
    return this.http.get(
      'http://localhost:3000/api/product/getMedicine/' + mde
    );
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

  getAllInvoices() {
    return this.http.get('http://localhost:3000/api/invoices/getAll');
  }

  //getInvoiceById
  getInvoiceById(id: any) {
    return this.http.get(
      'http://localhost:3000/api/invoices/getInvoiceByID/' + id
    );
  }
  //updateInvoiceByd
  updateInvoiceById(id: any, invoice: any) {
    return this.http.put(
      'http://localhost:3000/api/invoices/updateInvoiceById/' + id,
      invoice
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
}

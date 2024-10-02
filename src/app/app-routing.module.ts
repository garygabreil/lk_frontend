import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CreatePatientComponent } from './patient/create-patient/create-patient.component';
import { ManagePatientComponent } from './patient/manage-patient/manage-patient.component';
import { CreateDoctorComponent } from './pages/doctor/create-doctor/create-doctor.component';
import { ManageDoctorComponent } from './pages/doctor/manage-doctor/manage-doctor.component';
import { CreateStaffComponent } from './pages/staff/create-staff/create-staff.component';
import { ManageStaffComponent } from './pages/staff/manage-staff/manage-staff.component';
import { OpManagementComponent } from './pages/appointment/op-management/op-management.component';
import { IpManagementComponent } from './pages/appointment/ip-management/ip-management.component';
import { CreateMedicineComponent } from './pharmacy/create-medicine/create-medicine.component';
import { ManageMedicineComponent } from './pharmacy/manage-medicine/manage-medicine.component';
import { CreateBillComponent } from './pharmacy/create-bill/create-bill.component';
import { ManageInvoicesComponent } from './pharmacy/manage-invoices/manage-invoices.component';
import { ViewIndividualInvoicesComponent } from './pharmacy/view-individual-invoices/view-individual-invoices.component';
import { CreatePoComponent } from './pharmacy/create-po/create-po.component';
import { InvoiceHomeComponent } from './pages/invoice-home/invoice-home.component';
import { ManagePoInvoicesComponent } from './pharmacy/manage-po-invoices/manage-po-invoices.component';
import { ViewIndividualPoInvoicesComponent } from './pharmacy/view-individual-po-invoices/view-individual-po-invoices.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'create-patient', component: CreatePatientComponent },
  { path: 'manage-patient', component: ManagePatientComponent },
  { path: 'create-doctor', component: CreateDoctorComponent },
  { path: 'manage-doctor', component: ManageDoctorComponent },
  { path: 'create-staff', component: CreateStaffComponent },
  { path: 'manage-staff', component: ManageStaffComponent },
  { path: 'op-appointment', component: OpManagementComponent },
  { path: 'ip-appointment', component: IpManagementComponent },
  { path: 'create-medicine', component: CreateMedicineComponent },
  { path: 'manage-medicine', component: ManageMedicineComponent },
  { path: 'create-bill', component: CreateBillComponent },
  { path: 'view-bill', component: ManageInvoicesComponent },
  { path: 'view-invoice/:id', component: ViewIndividualInvoicesComponent },
  { path: 'create-po', component: CreatePoComponent },
  { path: 'invoice-home', component: InvoiceHomeComponent },
  { path: 'view-po-bill', component: ManagePoInvoicesComponent },
  { path: 'view-po-invoice/:id', component: ViewIndividualPoInvoicesComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

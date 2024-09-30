import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SidemenuComponent } from './pages/sidemenu/sidemenu.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreatePatientComponent } from './patient/create-patient/create-patient.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatIconModule } from '@angular/material/icon';
import { ManagePatientComponent } from './patient/manage-patient/manage-patient.component';
import { SearchPipe } from './pipes/search.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { DatePipe } from '@angular/common';
import { CreateDoctorComponent } from './pages/doctor/create-doctor/create-doctor.component';
import { ManageDoctorComponent } from './pages/doctor/manage-doctor/manage-doctor.component';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { CreateStaffComponent } from './pages/staff/create-staff/create-staff.component';
import { ManageStaffComponent } from './pages/staff/manage-staff/manage-staff.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OpManagementComponent } from './pages/appointment/op-management/op-management.component';
import { IpManagementComponent } from './pages/appointment/ip-management/ip-management.component';
import { CreateMedicineComponent } from './pharmacy/create-medicine/create-medicine.component';
import { ManageMedicineComponent } from './pharmacy/manage-medicine/manage-medicine.component';
import { CreateBillComponent } from './pharmacy/create-bill/create-bill.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ManageInvoicesComponent } from './pharmacy/manage-invoices/manage-invoices.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { ViewIndividualInvoicesComponent } from './pharmacy/view-individual-invoices/view-individual-invoices.component';
import { CreatePoComponent } from './pharmacy/create-po/create-po.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    SidemenuComponent,
    CreatePatientComponent,
    ManagePatientComponent,
    SearchPipe,
    CreateDoctorComponent,
    ManageDoctorComponent,
    CreateStaffComponent,
    ManageStaffComponent,
    OpManagementComponent,
    IpManagementComponent,
    CreateMedicineComponent,
    ManageMedicineComponent,
    CreateBillComponent,
    ManageInvoicesComponent,
    ViewIndividualInvoicesComponent,
    CreatePoComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    NgxPaginationModule,
    HttpClientModule,
    FontAwesomeModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    NgxDatatableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    SearchPipe,
    DatePipe,
    provideHttpClient(withFetch()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

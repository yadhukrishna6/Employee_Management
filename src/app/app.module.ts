import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { RatingModule } from 'primeng/rating';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { StyleClassModule } from 'primeng/styleclass';

// Components
import { EmployeeComponent } from './view/employee/employee.component';
import { LoginComponent } from './view/login/login.component';
import { ProfileComponent } from './view/profile/profile.component';
import { ProfileViewComponent } from './view/profile-view/profile-view.component';
import { ProjectComponent } from './view/project/project.component';
import { ProjectEmployeeComponent } from './view/project-employee/project-employee.component';
import { SidebarModule } from 'primeng/sidebar';
import { BrowserModule } from '@angular/platform-browser';  // Only import here in root module
import { AppComponent } from './app.component';

import { NavbarComponent } from './view/navbar/navbar.component';
import { SidebarComponent } from './view/sidebar/sidebar.component';
import { FooterComponent } from './view/footer/footer.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    RatingModule,
    MenuModule,
    BadgeModule,
    InputTextModule,
    SelectButtonModule,
    StyleClassModule,
    BrowserAnimationsModule, 
    SidebarModule,
   
    BrowserModule
    
    // Removed BrowserModule from this module
  ],

  providers: [],
  bootstrap: [AppComponent],  
  declarations: [
    NavbarComponent,
    SidebarComponent,
    AppComponent,  // Make sure AppComponent is declared here
    LoginComponent,
    EmployeeComponent,
    ProfileViewComponent,
    ProjectComponent,
    ProjectEmployeeComponent,
    ProfileComponent,
   
   
  ],
  exports: [
    ProfileComponent,
   
  ],
})
export class AppModule {}

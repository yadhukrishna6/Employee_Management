import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { RatingModule } from 'primeng/rating';
import { MenuModule } from 'primeng/menu';
import { EmployeeComponent } from './view/employee/employee.component';
import { LayoutComponent } from './view/layout/layout.component';
import { LoginComponent } from './view/login/login.component';
import { ProfileComponent } from './view/profile/profile.component';
import { ProfileViewComponent } from './view/profile-view/profile-view.component';
import { ProjectComponent } from './view/project/project.component';
import { ProjectEmployeeComponent } from './view/project-employee/project-employee.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    RatingModule,
    RippleModule,
    MenuModule,
  ],
  declarations: [
    EmployeeComponent,
    LayoutComponent,
    LoginComponent,
    ProfileComponent,
    ProfileViewComponent,
    ProjectComponent,
    ProjectEmployeeComponent


  ]
})
export class AppModule {

}

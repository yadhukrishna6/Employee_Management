import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './view/dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './view/profile/profile.component';
import { TimetableComponent } from './pages/timetable/timetable.component';
import { EmployeesComponent } from './view/employees/employees.component';
import { ProfileEditComponent } from './view/profile-edit/profile-edit.component';
import { WsWebsiteComponent } from './view/ws-website/ws-website.component'; // Import the new component

const routes: Routes = [
  { path: 'ws-website', redirectTo: 'ws-website', pathMatch: 'full' }, // Set the new component as the default route
  { path: 'ws-website', component: WsWebsiteComponent }, // Add the new route
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'employees', component: EmployeesComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'timetable', component: TimetableComponent },
  { path: 'profile-edit', component: ProfileEditComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
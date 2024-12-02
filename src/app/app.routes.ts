import { Routes } from '@angular/router';
import { LoginComponent } from './view/login/login.component';
import { LayoutComponent } from './view/layout/layout.component';
import { DashboardComponent } from './view/dashboard/dashboard.component';
import { EmployeeComponent } from './view/employee/employee.component';
import { ProjectEmployeeComponent } from './view/project-employee/project-employee.component';
import { ProjectComponent } from './view/project/project.component';
import { ProfileComponent } from './view/profile/profile.component';
import { ProfileViewComponent } from './view/profile-view/profile-view.component';



export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },

    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'dashboard',
                component: DashboardComponent
            },
            {
                path: 'profile-view',
                component: ProfileViewComponent
            },
            {
                path: 'profile',
                component: ProfileComponent
            },
            {
                path: 'employee',
                component: EmployeeComponent
            },
            {
                path: 'projects',
                component: ProjectComponent
            },
            {
                path: 'project-employee',
                component: ProjectEmployeeComponent
            },

        ]

    }

];

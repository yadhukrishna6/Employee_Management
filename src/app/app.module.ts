import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TabViewModule } from 'primeng/tabview';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidenav/sidenav.component';
import { MainComponent } from './main/main.component';
import { RouterLinkActiveExactDirective } from './main/appRouterLinkActiveExact.directive';
import { ProfileComponent } from './view/profile/profile.component';
import { TimetableComponent } from './pages/timetable/timetable.component';
import { EmployeesComponent } from './view/employees/employees.component';
import { ProfileEditComponent } from './view/profile-edit/profile-edit.component';
import { WsWebsiteComponent } from './view/ws-website/ws-website.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToolbarModule } from 'primeng/toolbar';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    SidebarComponent,
    MainComponent,
    RouterLinkActiveExactDirective,
    ProfileComponent,
    ProfileEditComponent,
    TimetableComponent,
    EmployeesComponent,
    ProfileEditComponent,
    WsWebsiteComponent,
  ],
  imports: [
  CommonModule,
    BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserAnimationsModule,
    
       
        MatSidenavModule,
        MatToolbarModule,
        MatMenuModule,
        MatIconModule,
        MatDividerModule,
        MatListModule,
        MatButtonModule,
        MatCardModule,
        FormsModule,
        MatTableModule,MatToolbarModule, MatButtonModule, MatButtonModule,
        BrowserModule,
        BrowserAnimationsModule,
        ButtonModule,
        TableModule,
        InputTextModule,
        ToolbarModule,
        ButtonModule,
         InputTextModule,
         DropdownModule,
         FormsModule, InputTextModule,
         CalendarModule,
         TabMenuModule,
            TabViewModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
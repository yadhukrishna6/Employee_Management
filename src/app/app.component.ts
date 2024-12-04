import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SidebarComponent } from './view/sidebar/sidebar.component';
import { NavbarComponent } from './view/navbar/navbar.component';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SidebarComponent, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'admin-dashboard';
  isSidebarToggled = false;

  toggleSidebar() {
    this.isSidebarToggled = !this.isSidebarToggled;

    // Pass the toggle state to the sidebar using an Angular event or shared service.
    document.querySelector('.sidebar')?.classList.toggle('toggled', this.isSidebarToggled);
  }
}
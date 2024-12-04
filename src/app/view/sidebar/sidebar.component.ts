import { CommonModule } from '@angular/common';
import { Component, Input  } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isToggled = false; // Accept toggle state from the parent component

  isEmployeesExpanded: boolean = false;
  isSidebarToggled: boolean = false; 

  toggleEmployees() {
    this.isEmployeesExpanded = !this.isEmployeesExpanded;
  }
  toggleSide() {
    this.isToggled = !this.isToggled;
}
toggleSidebar() {
  this.isSidebarToggled = !this.isSidebarToggled;


}}
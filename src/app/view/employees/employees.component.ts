import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employees',
  
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent {
items: any;
constructor(private router: Router) {}

navigateToEditProfile() {
  this.router.navigate(['/profile-edit']);
}

}

import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
encapsulation:ViewEncapsulation.None
 
})
export class ProfileComponent {
  positions = [
    { label: 'Manager', value: 'Manager' },
    { label: 'Employee', value: 'Employee' },
    { label: 'Intern', value: 'Intern' }
];
activeTab = 'employment'; // Default tab

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }


}






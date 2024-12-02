import { Component, ViewChild, ElementRef } from '@angular/core';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
}) 
export class ProfileComponent {
  profileImageUrl: string | ArrayBuffer | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef;
  router: any;

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }


  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImageUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
  onSaveProfile() {
    this.router.navigate(['/profile-view']);
  }
  onCancelProfile() {
    this.router.navigate(['/profile-view']);
  }
}

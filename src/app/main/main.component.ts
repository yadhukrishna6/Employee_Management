import { Component } from '@angular/core';
import { SidebarService } from '../services/sidebar/sidebar.service';
import { SidebarComponent } from "../layout/sidenav/sidenav.component";
import { HeaderComponent } from "../layout/header/header.component";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],

 
})
export class MainComponent {

  isSidebarVisible = true;
  constructor(private sidebarService: SidebarService) {}


  ngOnInit() {
    this.sidebarService.sidebarVisibility$.subscribe((isVisible) => {
      console.log(isVisible)
      this.isSidebarVisible = isVisible;
    });
  }


}

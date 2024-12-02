import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MasterService } from '../../service/master.service';
import { IApiResponse, IParentDept } from '../../model/interface/master';


@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css'
})
export class EmployeeComponent implements OnInit {
  isFormVisible=signal<boolean>(false);
  masterSrv=inject(MasterService);
  parentDeptList=signal<IParentDept[]>([]);

  ngOnInit(): void {
    this.getParentDept();
  }

  getParentDept(){
    this.masterSrv.getAllDept().subscribe((res:IApiResponse)=>{
      this.parentDeptList.set(res.data);  
    });
  }
}

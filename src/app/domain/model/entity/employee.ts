import { 
    IsString, 
    IsNotEmpty, 
    IsEmail, 
    IsNumber, 
    IsOptional, 
    MinLength, 
    MaxLength, 
    IsDateString 
  } from 'class-validator';
  
  export class Employee {
    @IsNumber()
    id?: number 
  
    @IsString()
    @IsNotEmpty()
    firstname: string
  
    @IsString()
    @IsNotEmpty()
    lastname: string;
  
    @IsEmail()
    email: string;
  
    @IsNumber()
    employeeeid: number;
  
    @IsString()
    @MinLength(10)
    @MaxLength(15)
    contactNumber: string;
  
    @IsString()
    qualification: string;
  
    @IsNumber()
    @IsOptional()
    experience: number;
  
    @IsString()
    employeetype: string;
  
    @IsString()
    aadhaarNo: string;
  
    @IsString()
    gender: string;
  
    @IsNumber()
    contactTel: number;
  
    @IsNumber()
    officeTel: number;
  
    @IsNumber()
    postcode: number;
  
    @IsString()
    religion: string;
  
    @IsString()
    city: string;
  
    @IsString()
    maritialstatus: string;
  
    @IsString()
    nationality: string;
  
    @IsString()
    bankname: string;
  
    @IsString()
    branch: string;
  
    @IsNumber()
    ifsc: number;
  
    @IsString()
    bankaddress: string;
  
    @IsString()
    department: string;
  
    @IsString()
    shiftinfo: string;
  
    @IsNumber()
    accnum: number;
  
    @IsString()
    jobposition: string;
  
    @IsString()
    company: string;
  
    @IsString()
    address: string;
  
    @IsDateString()
    hireDate: string;
  
    @IsDateString()
    birthday: string;
  
    @IsNumber()
    salary: number;
  }
  
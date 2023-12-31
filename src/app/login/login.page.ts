import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { User } from 'firebase/auth';
import { AuthLoginService } from '../services/auth-login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: FormControl = new FormControl('', [Validators.required, Validators.email]);
  password: FormControl = new FormControl('', [Validators.required, Validators.minLength(6)])
  showSpinner:boolean = false;

  users = [
    {email:"admin@admin.com" , password:"111111"},
    {email:"invitado@invitado.com" , password:"222222"},
    {email:"usuario@usuario.com" , password:"333333"}
  ]

  constructor(private authServise:AuthLoginService) 
  {

  }

  login()
  {
    const correoL = this.email.value?.toString()
    const passL = this.password.value?.toString()
    this.showSpinner=true;

    this.authServise.signIn(correoL,passL);

  }

  hardcode(i:number)
  {
    this.email.setValue(this.users[i].email);
    this.password.setValue(this.users[i].password);
  }


  // Register(number:any)
  // {
  //   const user:User;

  // }
}

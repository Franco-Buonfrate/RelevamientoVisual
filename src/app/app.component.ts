import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import  firebase  from 'firebase/compat/app';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    public router: Router
  ) {
    this.initializeApp();
  }

  ngOnInit()
  {
    firebase.initializeApp(environment.firebase);
    // this.navCtrl.navigateRoot(['/splash']);
  }

  initializeApp(){
    this.platform.ready().then(()=>{
      this.router.navigateByUrl('splash');
    });
  }
}

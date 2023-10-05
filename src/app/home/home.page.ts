import { Component, OnInit } from '@angular/core';
import { AuthLoginService } from '../services/auth-login.service';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { FirestoreService } from '../services/firestore.service';
import * as moment from 'moment';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  user: any = null;
  menu: number = 0;
  pressedButton: boolean = false;
  menuTittle: string = 'COSAS LINDAS';
  userImagesCosasLindas: boolean = false;
  userImagesCosasFeas: boolean = false;
  cosasLindasList: any = [];
  cosasFeasList: any = [];

  constructor(
    private authService:AuthLoginService,
    //public photoService: PhotoService,
    private firestoreService:FirestoreService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Para formatear una fecha
    // const fecha = moment(new Date(1663533813133)).format('DD-MM-YYYY HH:mm:ss');
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        this.user = user;
        this.firestoreService.getCosasLindas().subscribe((value) => {
          this.cosasLindasList = value;
          this.cosasLindasList.sort(this.sortList);
          for (let i = 0; i < this.cosasLindasList.length; i++) {
            const photo = this.cosasLindasList[i];
            photo.hour = moment(new Date(parseInt(photo.hour))).format(
              'DD-MM-YYYY HH:mm:ss'
            );
          }
        });

        this.firestoreService.getCosasFeas().subscribe((value) => {
          this.cosasFeasList = value;
          this.cosasFeasList.sort(this.sortList);
          for (let i = 0; i < this.cosasFeasList.length; i++) {
            const photo = this.cosasFeasList[i];
            photo.hour = moment(new Date(parseInt(photo.hour))).format(
              'DD-MM-YYYY HH:mm:ss'
            );
          }
        });
      }
    });
  }



  logout()
  {
    this.userService.logout();
  }

  volverMenu() {
    this.userImagesCosasLindas = false;
    this.userImagesCosasFeas = false;
  }

  chooseMenu(view: number) {
    this.pressedButton = true;
    if (view === 1) {
      setTimeout(() => {
        this.menu = 1;
        this.menuTittle = 'COSAS LINDAS';
        this.pressedButton = false;
      }, 2000);
    } else if (view === 2) {
      setTimeout(() => {
        this.menu = 2;
        this.menuTittle = 'COSAS FEAS';
        this.pressedButton = false;
      }, 2000);
    } else if (view === 3) {
      setTimeout(() => {
        this.menu = 3;
        this.pressedButton = false;
        setTimeout(() => {
          
        }, 1000);
      }, 2000);
    } else if (view === 4) {
      setTimeout(() => {
        this.menu = 4;
        this.pressedButton = false;
        setTimeout(() => {
          
        }, 1000);
      }, 2000);
    }
    else {
      setTimeout(() => {
        this.menu = 0;
        this.userImagesCosasLindas = false;
        this.userImagesCosasFeas = false;
        this.pressedButton = false;
      }, 2000);
    }
  }

  addPhotoToGallery() {
    const type = this.menu;
    const photo = {
      userName: this.user.userName,
      pathFoto: '',
      email: this.user.userEmail,
      hour: '',
      likes: [],
    };
    this.photoService.addNewToGallery(photo, type).then(() => {
      this.pressedButton = true;
      setTimeout(() => {
        this.pressedButton = false;
      }, 3000);

    });
  }

  sortList(photo1: any, photo2: any) {
    let rtn = 0;
    if (parseInt(photo1.hour) > parseInt(photo2.hour)) {
      rtn = -1;
    } else if (parseInt(photo1.hour) < parseInt(photo2.hour)) {
      rtn = 1;
    }
    return rtn;
  }
}

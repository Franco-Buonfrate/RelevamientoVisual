import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthLoginService } from '../services/auth-login.service';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { FirestoreService } from '../services/firestore.service';
import * as moment from 'moment';
import { PhotoService } from '../services/photo.service';
import { Subject } from 'rxjs';
import { Chart, ChartEvent } from 'chart.js';
import Swal from 'sweetalert2';


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


  public usuarioActual?: string;
  public photosLindas: any;
  public photosFeas: any;
  private photosSubject = new Subject<any>();
  photos$ = this.photosSubject.asObservable();
  colors?: string[];

  data = [15, 20, 25, 10, 30];
  pieChart?: any;
  @ViewChild('pieCanvas', { static: true }) pieCanvas!: ElementRef;

  constructor(
    private ref: ChangeDetectorRef,
    public photoService: PhotoService,
    private authService: AuthLoginService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    this.ref.detectChanges();
    this.usuarioActual = this.authService.usuarioAutenticado;
    const photoRefs: any[] = await this.authService.getPhotoRefs();
    const photos = await Promise.all(photoRefs.map(async (photoRef) => ({
      ...photoRef,
      imagen: await this.authService.getPhotos(photoRef.photoRef),
      liked: await this.authService.getLikes(photoRef.photoRef),
      likes: await this.authService.countLikes(photoRef.photoRef)
    })));
    this.photosLindas = photos.filter((photo: { tipo: string; }) => photo.tipo === "cosasLindas");
    this.photosLindas.sort((a: any, b: any) => {
      const dateA =a.fecha; // Convierte la cadena de fecha en objeto Date
      const dateB = b.fecha; // Convierte la cadena de fecha en objeto Date
      if (dateA < dateB) {
        return 1; // date1 is greater
      } else if (dateA > dateB) {
        return -1; // date2 is greater
      } else {
        return 0; // dates are equal
      }
  });

    this.photosFeas = photos.filter((photo: { tipo: string; }) => photo.tipo === "cosasFeas");

    this.photosFeas.sort((a: any, b: any) => {
      const dateA =a.fecha; // Convierte la cadena de fecha en objeto Date
      const dateB = b.fecha; // Convierte la cadena de fecha en objeto Date
      if (dateA < dateB) {
        return 1; // date1 is greater
      } else if (dateA > dateB) {
        return -1; // date2 is greater
      } else {
        return 0; // dates are equal
      }
  });

  }

  generarGraficoLindo()
  {
    this.photosSubject.next(this.photosLindas); // emit the new value
    const fotosConLikes = this.photosLindas.filter((photo: { likes: number; }) => photo.likes > 0);
    const data = {
      labels: fotosConLikes.map((photo: any) => photo.photoRef),
      datasets: [{
        data: fotosConLikes.map((photo: any) => photo.likes),
        backgroundColor: this.colors
      }]
    };
    this.generateRandomColors();
       if (this.pieChart) {
      this.pieChart.destroy();
    }

    const ctx = (<any>document.getElementById('cosasLindas')).getContext('2d');

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: data,
      options: {
        
        plugins: {

        },
        onClick: async (e: ChartEvent, activeEls: any) => {
          let datasetLabel = fotosConLikes[activeEls[0].index];
          console.log(datasetLabel);
          this.mostrarUnaFoto(datasetLabel.imagen);

        }
      }
    });
    this.pieChart.update();
  }

  generarGraficoFeo()
  {
    this.photosSubject.next(this.photosFeas); // emit the new value
    const fotosConLikes = this.photosFeas.filter((photo: { likes: number; }) => photo.likes > 0);
    const data = {
      labels: fotosConLikes.map((photo: any) => photo.photoRef),
      datasets: [{
        data: fotosConLikes.map((photo: any) => photo.likes),
        backgroundColor: this.colors
      }]
    };
    this.generateRandomColors();
    if (this.pieChart) {
      this.pieChart.destroy();
    }

    const ctx = (<any>document.getElementById('cosasFeas')).getContext('2d');

    this.pieChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        
        plugins: {

        },
        onClick: async (e: ChartEvent, activeEls: any) => {
          let datasetLabel = fotosConLikes[activeEls[0].index];
          console.log(datasetLabel);
          this.mostrarUnaFoto(datasetLabel.imagen);

        }
      }
    });
    this.pieChart.update();
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
          this.generarGraficoLindo();
        }, 1000);
      }, 2000);
    } else if (view === 4) {
      setTimeout(() => {
        this.menu = 4;
        this.pressedButton = false;
        setTimeout(() => {
          this.generarGraficoFeo();
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



  generateRandomColors() {
    this.colors = [];
    for (let i = 0; i < this.data.length; i++) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      this.colors.push(`rgb(${r}, ${g}, ${b})`);
    }


  }
  mostrarUnaFoto(ulr :string){
    Swal.fire({
      imageUrl: ulr,
      imageWidth: 640,
      heightAuto: false,
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        image: 'center-image'
      },
      backdrop: `
        rgba(0,0,123,0.4)
        center top
        no-repeat
      `
    });
  }
  tomarFotos(menu:number) {
    if(menu === 1)
    {
      this.photoService.takePhoto("cosasLindas").then((photos) => {
        console.log('Photos taken:', photos);
        this.photosLindas = [...this.photosLindas, ...photos]; // update the photos array
        this.photosSubject.next(this.photosLindas); // emit the new value
      }).then(
          respuesta => {
          this.authService.showLoading("Subiendo");
          this.reload();
        });
    }else if(menu === 2)
    {
      this.photoService.takePhoto("cosasFeas").then((photos) => {
        console.log('Photos taken:', photos);
        this.photosFeas = [...this.photosFeas, ...photos]; // update the photos array
        this.photosSubject.next(this.photosFeas); // emit the new value
      }).then(
          respuesta => {
          this.authService.showLoading("Subiendo");
          this.reload();
        });
    }
    
  }
  reload() {
    this.ngOnInit();
  }
  votar(photo: any) {
    this.authService.uploadLikes(photo.photoRef).then(
      respuesta => {

        this.reload();
      });
  }
  quitarVoto(photo: any) {
    this.authService.quitarLikes(photo.photoRef).then(
      respuesta => {

        this.reload();
      });
  }

}

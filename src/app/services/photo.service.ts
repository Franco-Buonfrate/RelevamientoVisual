import { Injectable } from '@angular/core';
import { AuthLoginService } from './auth-login.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FirestoreService } from './firestore.service';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { getStorage, ref, uploadString } from 'firebase/storage';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  user: any = null;
  loaded: boolean = false;

  public photos: any[] = [];


  constructor(
    private authService: AuthLoginService,
    private angularFirestorage: AngularFireStorage,
    private firestoreService: FirestoreService
  ) {
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        this.user = user;
      }
    });
  }

  async addNewToGallery(photo: any, type: number) {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100,
      webUseInput: true,
    });

    const storage = getStorage();
    const date = new Date().getTime();

    photo.hour = date;

    const name = `${this.user.userEmail} ${date}`;
    const storageRef = ref(storage, name);
    const url = this.angularFirestorage.ref(name);
    
    this.loaded=true;
    uploadString(storageRef as any, capturedPhoto.dataUrl as any, 'data_url').then(() => {
      this.loaded=false;
      url.getDownloadURL().subscribe((url1: any) => {
        photo.pathFoto = url1;
        this.firestoreService.addPhoto(photo, type);
        this.authService.toast('Foto subida con éxito', 'success');
      });
    });
  }








  async takePhoto(routa: string): Promise<any[]> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: true,
      });

      this.photos.push(image);

      const confirm = await Swal.fire({
        title: 'Camara',
        text: '¿Desea usted tomar fotos adicionales?',
        showCancelButton: true,
        confirmButtonText: 'Si',
        cancelButtonText: 'No',
        heightAuto: false
      });

      if (confirm.value) {
        return this.takePhoto(routa);
      } else {
        await this.authService.uploadPhotosRef(this.photos, routa);
        this.photos=[];
        return this.photos;
      }
    } catch (error) {
      console.log('Error taking photo:', error);
      // Return an empty array if an error occurred
      return [];
    }
  }
}

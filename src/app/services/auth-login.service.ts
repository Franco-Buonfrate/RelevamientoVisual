import { Injectable } from '@angular/core';
import { User } from '../Entidades/user';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { Observable, of} from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/storage'
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/storage'
import 'firebase/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthLoginService {
  user$:Observable<User | undefined | null>;
  user!:User

  public usuarioAutenticado:any;

  constructor(private angularFireAuth:AngularFireAuth,
    private angularFirestore:AngularFirestore,
    private router: NavController,
    private LoadingController:LoadingController,
    private toastController:ToastController,
    private loadingCtrl: LoadingController)
  {
    this.user$ = this.angularFireAuth.authState.pipe(
      switchMap((user) => {
        if(user)
        {
          return this.angularFirestore.doc<User>(`user/${user.uid}`).valueChanges();
        }else{
          return of(null);
        }
      })
    );
  }

  async signIn(email:any, password:any)
  {
    try {
      const loading = await this.LoadingController.create({
        message: 'Verificando',
        spinner: 'crescent',
        showBackdrop: true,
      });
      loading.present();
      this.angularFireAuth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        this.usuarioAutenticado = firebase.auth().currentUser;
        loading.dismiss();
        this.router.navigateRoot(['/home']);
      })
      .catch((error) => {
        loading.dismiss();
        this.toast(this.createMessage(error.code), 'danger');
      });
    }catch(error:any)
    {
      console.log(error.message);
    }
  }

  async signOut() {
    try {
      const loading = await this.LoadingController.create({
        message: 'Cerrando',
        showBackdrop: true,
        spinner: "dots"
      });
      loading.present();

      this.angularFireAuth.signOut().then(() => {
        setTimeout(() => {
          loading.dismiss();
          this.router.navigateRoot(['/login']);
        }, 2000);
      });
    } catch (error: any) {
      console.log(error.message);
    }
  }

  getUserLogged() {
    return this.angularFireAuth.authState;
  }

  async toast(message: any, status: any) {
    try {
      const toast = await this.toastController.create({
        message: message,
        color: status,
        position: 'top',
        duration: 2000,
      });
      toast.present();
    } catch (error: any) {
      console.log(error.message);
    }
  }

  private createMessage(errorCode: string): string {
    let message: string = '';
    switch (errorCode) {
      case 'auth/internal-error':
        message = 'Los campos estan vacios';
        break;
      case 'auth/operation-not-allowed':
        message = 'La operación no está permitida.';
        break;
      case 'auth/email-already-in-use':
        message = 'El email ya está registrado.';
        break;
      case 'auth/invalid-email':
        message = 'El email no es valido.';
        break;
      case 'auth/weak-password':
        message = 'La contraseña debe tener al menos 6 caracteres';
        break;
      case 'auth/user-not-found':
        message = 'No existe ningún usuario con estos identificadores';
        break;
      default:
        message = 'Dirección de email y/o contraseña incorrectos';
        break;
    }

    return message;
  }




  async uploadPhotosRef(photos: any[], tipo: string) {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        throw new Error("Usuario no ingreso");
      }

      const photoRefCollection = firebase.firestore().collection('photoRef');

      for (const photo of photos) {
        const id = Math.random().toString(36).substring(2);
        const filePath = `photos/${id}`;
        const storageRef = firebase.storage().ref().child(filePath);
        const photoData = await fetch(photo.webPath);
        const blob = await photoData.blob();
        const task = storageRef.put(blob);
        await task;
        const photoRefDoc = {
          currentUser: user.email,
          photoRef: id,
          fecha: new Date().toLocaleString('es-AR'),
          likes: 0,
          tipo: tipo
        };

        await photoRefCollection.add(photoRefDoc);
      }
    } catch (error) {
      console.log("Error uploading photos:", error);
      throw error;
    }
  }

  async getPhotoRefs(): Promise<any[]> {
    const photoRefCollection = firebase.firestore().collection('photoRef');
    const querySnapshot = await photoRefCollection.get();
    const photoRefs: any[] | PromiseLike<any[]> = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      photoRefs.push(data);
    });
    return photoRefs;
  }

  async getPhotos(photoRefs: string) {
    const photos = "";
    const storageRef = firebase.storage().ref().child(`photos/${photoRefs}`);
    const photoUrl = await storageRef.getDownloadURL();
    return photoUrl;
  }

  async getLikes(idFoto: string) {
    const user = firebase.auth().currentUser;
    if (!user) {
      return false;
    }
    const photoRefCollection = firebase.firestore().collection('likes');

    const photoRefQuery = photoRefCollection
      .where('usuario', '==', user.email)
      .where('photoRef', '==', idFoto)
      .limit(1);

    const snapshot = await photoRefQuery.get();
    if (snapshot.empty) {
      return false;
    } else {

      return true;
    }
  }

  async countLikes(idFoto: string) {
    const user = firebase.auth().currentUser;
    if (!user) {
      return 0;
    }
    const photoRefCollection = firebase.firestore().collection('likes');

    const photoRefQuery = photoRefCollection
      .where('photoRef', '==', idFoto);

    const snapshot = await photoRefQuery.get();
    if (snapshot.empty) {
      return 0;
    } else {
      return snapshot.size;
    }
  }

  async showLoading(mensaje:string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      duration: 3000,
      translucent:true,
      cssClass: 'custom-loading'
      
    });
    loading.present();
    return new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));
  }

  async uploadLikes(idFoto: string) {
    try {
      const user = this.usuarioAutenticado;
      if (!user) {
        throw new Error("Usuario no ingreso");
      }

      const photoRefCollection = firebase.firestore().collection('likes');

      const photoRefDoc = {
        usuario: user.email,
        photoRef: idFoto,
      };

      await photoRefCollection.add(photoRefDoc);
    }
    catch (error) {
      throw error;
    }
  }

  async quitarLikes(idFoto: string) {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        throw new Error("Usuario no ingreso");
      }

      const photoRefCollection = firebase.firestore().collection('likes');

      const photoRefQuery = photoRefCollection
        .where('usuario', '==', user.email)
        .where('photoRef', '==', idFoto)
        .limit(1);

      const snapshot = await photoRefQuery.get();

      if (snapshot.empty) {
        return;
      }

      const photoRefDoc = snapshot.docs[0].ref;
      await photoRefDoc.delete();
    }
    catch (error) {
      throw error;
    }
  }
}

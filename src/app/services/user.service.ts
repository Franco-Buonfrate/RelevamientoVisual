import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { ToastService } from './toast.service';



@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private toastService: ToastService,
    private navCtrl: NavController,
    private LoadingController: LoadingController) { }


  login(correo: any, password: any) {

    firebase.auth().signInWithEmailAndPassword(correo, password).then((response) => {
      let userCorreo = response.user?.email ? response.user?.email : '';
      localStorage.setItem("correo", userCorreo);
      this.navCtrl.navigateRoot('/home');
    })
      .catch(async (error) => {
        let errorMessage = error.message;

        let color = 'danger';

        if (errorMessage.includes('correo', 'password') || !correo.valid && !password.valid) {
          errorMessage = 'Debe ingresar un correo y contraseña correcta';

        } else if (errorMessage.includes('password') || !password.valid) {
          errorMessage = 'Por favor, ingrese una contraseña válida.';
        } else {
          errorMessage = "Usuario inexistente";
        }
        this.toastService.CrearToast(errorMessage, "bottom", color);
      });
  }

  async logout() {
    const loading = await this.LoadingController.create({
      message: 'Cerrando...',
      showBackdrop: true,
      spinner: "dots"
    });
    loading.present();
    firebase.auth().signOut().then(() => {
      setTimeout(() => {
        this.navCtrl.navigateRoot('/login');
        loading.dismiss();
      }, 1500);

    });
  }

  getEmailUser() {
    return firebase.auth().currentUser?.email || null;
  }
}

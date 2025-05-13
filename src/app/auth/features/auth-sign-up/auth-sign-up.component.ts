import { Component, inject } from '@angular/core';
import { AuthService } from '../../data-access/auth.service';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

interface SignUpForm {
  email: FormControl<null | string>;
  password: FormControl<null | string>;
  username: FormControl<null | string>;
}

@Component({
  selector: 'app-auth-sign-up',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: `./auth-sign-up.html`,
  styleUrl: './auth-sign-up.component.css'
})
export default class AuthSignUpComponent {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthService);

  form = this._formBuilder.group<SignUpForm>({
    email: this._formBuilder.control(null, [Validators.required, Validators.email]),
    password: this._formBuilder.control(null, [Validators.required,]),
    username: this._formBuilder.control(null, [Validators.required,]),
  });

  async submit() {
    if (this.form.invalid) return;

    try {
    const authResponse = await this._authService.signUp({
      username: this.form.value.username ?? '',
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? '',
    });

    if (authResponse.error) throw authResponse.error;
    alert('Verifica tu correo para activar tu cuenta');
    } catch (error) {
      console.error('Error during sign up:', error);
    }
  }
}

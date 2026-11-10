import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  loginForm = inject(FormBuilder).group ({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isLoading = signal(false);
  result = signal('');
  
  formStatus = toSignal(this.loginForm.statusChanges, { initialValue: "INVALID" as const });
  canSubmit = computed(() => this.formStatus() === 'VALID' && !this.isLoading()); 

  onSubmit(): void {
    console.log('Crendentials', this.loginForm.value);
    this.result.set('Trying to log in...');
  }
}

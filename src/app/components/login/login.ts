import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { LoginRequest } from '../../flights/auth';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router)
  private destroyRef = inject(DestroyRef);


  loginForm = inject(FormBuilder).group ({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isLoading = signal(false);
  result = signal('');
  
  formStatus = toSignal(this.loginForm.statusChanges, { initialValue: "INVALID" as const });
  canSubmit = computed(() => this.formStatus() === 'VALID' && !this.isLoading()); 

  onSubmit(): void {
    if (!this.canSubmit()) { return; }
    this.isLoading.set(true);
    const credentials= this.loginForm.value as LoginRequest;

    this.authService.login(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef)) //Evita que la subscripción quede viva después de que el componente se destruya
      .subscribe({
        next: (response) => {
          this.authService.saveSession(response);
          this.result.set('Login successful');
          this.router.navigate(['/']); 
        },
        error : () => {
          this.isLoading.set(false);
          this.result.set('Login failed: ');
        }
      });
  }
}

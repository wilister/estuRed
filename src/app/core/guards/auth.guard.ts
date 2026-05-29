import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

// Guard de autenticación que protege las rutas privadas de la aplicación.
// Si el usuario no está autenticado, redirige automáticamente al login.
export const authGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);
  const user = await supabase.getUser();

  if (user) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
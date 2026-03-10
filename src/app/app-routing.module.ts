import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './helpers/auth/auth.guards';
import { ComprehensiveEyeExamComponent } from './pages/components/comprehensive-eye-exam/comprehensive-eye-exam.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'authentication',
    pathMatch: 'full'
  },
  {
    path: 'authentication',
    loadChildren: () => import('./authentication/authentication.module').then( m => m.AuthenticationPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'layout',
    loadChildren: () => import('./pages/loayout/loayout.module').then( m => m.LoayoutPageModule),
    canActivate: [AuthGuard]
  },
  {
   path: 'eye_exam', component: ComprehensiveEyeExamComponent, 
  canActivate: [AuthGuard] 
  },
  { path: 'eye_exam/:reference_number', component: ComprehensiveEyeExamComponent, canActivate: [AuthGuard]}, 

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

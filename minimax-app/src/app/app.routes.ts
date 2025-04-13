import { Routes } from '@angular/router';
import { CoffeeComponent } from './components/coffeeStart/coffee/coffee.component';
import { CoffePlaneviewComponent } from './components/coffe-planeview/coffe-planeview.component';

export const routes: Routes = [
    { path: 'coffee', component: CoffePlaneviewComponent },
    { path: '', component: CoffeeComponent, pathMatch: 'full' },
    { path: '**', redirectTo: '' }
];

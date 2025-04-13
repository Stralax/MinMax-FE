import { Routes } from '@angular/router';
import { CoffeeComponent } from './components/coffeeStart/coffee/coffee.component';
import { CoffePlaneviewComponent } from './components/coffe-planeview/coffe-planeview.component';
import { ChatbotPageComponent } from './components/chatbot-page/chatbot-page.component';

export const routes: Routes = [
    { path: 'coffee', component: CoffePlaneviewComponent },
    { path: 'chatbot', component: ChatbotPageComponent, pathMatch: 'full'},
    { path: '', component: CoffeeComponent, pathMatch: 'full' },
    { path: '**', redirectTo: '' }
];

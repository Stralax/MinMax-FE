import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { CoffeeComponent } from './components/coffeeStart/coffee/coffee.component';  // Import your CoffeeComponent

@NgModule({
  declarations: [
    AppComponent,
    CoffeeComponent,  // Declare your CoffeeComponent here
  ],
  imports: [BrowserModule, RouterModule.forRoot(routes)],
  bootstrap: [AppComponent],  // Ensure the root component is bootstrapped
})
export class AppModule {}

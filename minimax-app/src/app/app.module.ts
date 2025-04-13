import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { CoffeeComponent } from './components/coffeeStart/coffee/coffee.component';  // Import your CoffeeComponent

@NgModule({
  
  imports: [AppComponent, CoffeeComponent, BrowserModule, RouterModule.forRoot(routes)],
  
})
export class AppModule {}

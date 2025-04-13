import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coffee',
  imports: [],
  templateUrl: "./coffee.component.html",
  host: {
    'ngSkipHydration': 'true'  // <-- Add this
  },
  styles: ``
})
export class CoffeeComponent {
  constructor(private router: Router) {}  // <-- Inject Router

  navigateToCoffee() {
    this.router.navigate(['coffee']);  // <-- Define navigation method
  }

}

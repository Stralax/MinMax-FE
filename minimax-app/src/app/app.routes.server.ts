import { RenderMode, ServerRoute } from '@angular/ssr';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoffeeComponent } from './components/coffeeStart/coffee/coffee.component';

export const serverRoutes: ServerRoute[] = [,
  { path: '', component: CoffeeComponent },
  { path: '**', renderMode: RenderMode.Prerender }
];

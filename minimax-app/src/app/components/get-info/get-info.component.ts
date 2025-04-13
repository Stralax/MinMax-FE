import { Component, OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotepadComponent } from '../notepad/notepad/notepad.component';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CoffeeService } from '../../services/coffee.service';
import { env } from 'process';

@Component({
  selector: 'app-get-info',
  imports: [],
  templateUrl: './get-info.component.html',
  styleUrl: './get-info.component.css'
})

export class GetInfoComponent {

  private data: string = "";

  constructor(
    private router: Router,
    private coffeeService: CoffeeService
  ) {} 

  ngOnInit(): void {
    this.fetchData();
  }

  async fetchData(): Promise<void>{
    let p = await this.coffeeService.getText(environment.link);
    this.data = p.toString();
    environment.resultIMG = this.extractLinkFromText(this.data);
    console.log(environment.resultIMG);
    // Find the index of the marker
    const marker = "Image uploaded:";
    const index = this.data.indexOf(marker);

    // Extract the part before the marker
    environment.data = index !== -1 ? this.data.substring(0, index) : this.data;
    console.log(environment.data);
  }

  private extractLinkFromText(text: string): string{
    // Find the line that starts with "Link: "
    const linkLine = text.split('\n').find(line => line.startsWith('Link: '));
    
    if (linkLine) {
      // Extract everything after "Link: "
      return linkLine.replace('Link: ', '').trim();
    }
    
    return ""; // Return null if no link found
  }

  private extractDataFromText(text: string, marker: string): string {
    const lines = text.split('\n');
  
    for (const line of lines) {
      if (line.includes(marker)) {
        return line.trim(); // ali karkoli želiš vrniti (npr. samo del vrstice)
      }
    }
  
    return ""; // če nobena vrstica ne vsebuje markerja
  }  
}

import { Component, OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotepadComponent } from '../notepad/notepad/notepad.component';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CoffeeService } from '../../services/coffee.service';
import { env } from 'process';
import * as fs from 'fs';
import * as net from "net"

// dotenv.config();

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
    const data2 = index !== -1 ? this.data.substring(0, index) : this.data;
    console.log(environment.data);
    // (process.env as { SEED_PREDICTION?: string }).SEED_PREDICTION = environment.data;
    // fs.writeFileSync('../../../../MinMax-BE/shared-data.txt', data2, 'utf8');
    // const client = new net.Socket();
    // client.connect(8080, "localhost", () => {
    //   client.write(data2);
    //   client.end();
    // })
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

import { Injectable } from '@angular/core';
import { text } from 'stream/consumers';


@Injectable({
  providedIn: 'root'
})
export class CoffeeService {

  private url = "http://localhost:8000/coffee?image_url=";


  public async getText(texti: string): Promise<string> {
    console.log("Uploading file:", texti);


    try {
      const fullUrl = this.url + texti;

      const response = await fetch(fullUrl, {
        method: 'GET',
      });

      //const data = await response.json();

      const textData = await response.text();
      console.log("Received text response:", textData);

      return textData
    } catch (error) {
      console.error("Error uploading image:", error);
      return "Error: Something went wrong!";
    }
  }
}

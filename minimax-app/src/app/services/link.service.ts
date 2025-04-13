import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class LinkService {

  private url = "https://api.imgbb.com/1/upload";

  private imgbbApiKey = '63db8ca1d56f9c50ecbcee756b05f668';


  public async getLink(file: File): Promise<string> {
    console.log("Uploading file:", file);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const fullUrl = `${this.url}?key=${this.imgbbApiKey}&expiration=600`;

      const response = await fetch(fullUrl, {
        method: 'POST',
        body: formData 
      });

      const data = await response.json();

      if (data.success) {
        console.log("Image upload successful:", data);
        return data.data.url; 
      } else {
        console.error("Image upload failed:", data);
        return "Error: Upload failed!";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      return "Error: Something went wrong!";
    }
  }
}

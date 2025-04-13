import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotepadComponent } from '../notepad/notepad/notepad.component';
import { LinkService } from '../../services/link.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coffe-planeview',
  standalone: true,
  imports: [CommonModule, NotepadComponent],
  templateUrl: './coffe-planeview.component.html',
  styles: ''
})
export class CoffePlaneviewComponent {
  uploadedImages: File[] = [];
  imageUrls: string[] = [];
  noPictureYet = true;
  private link: string = "";
  private images: FileList[] = [];

  constructor(
    private linkService: LinkService,
    private router: Router
  ) {} // Fixed constructor syntax


  async onSubmit(): Promise<void> {
    console.log("ALO");
    
    for(let i=0; i<1; i++){
      let p = await this.linkService.getLink(this.uploadedImages[i]);
      this.link = p.toString();
      console.log(this.link);
      // this.product.images.push(this.link);
      // console.log(this.product.images);
      console.log(this.link);
    }
    this.router.navigate(['chatbot']);
  }

  // Suggested additional method for image handling
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.images = [input.files]; // Store FileList
      this.noPictureYet = false;
      
      // Create preview URLs
      this.imageUrls = [];
      for (let i = 0; i < input.files.length; i++) {
        this.imageUrls.push(URL.createObjectURL(input.files[i]));
      }
      console.log(this.imageUrls);
    }
  }

    onImageDrop(event: DragEvent): void {
      event.preventDefault();
      if (event.dataTransfer && event.dataTransfer.files.length > 0) {
        console.log(event.dataTransfer.files);
        this.imagePreview(event.dataTransfer.files);
        this.noPictureYet=false
      }
    }

    imagePreview(files: FileList): void {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          this.uploadedImages.push(file);
          const reader = new FileReader();
          reader.onload = () => {
            this.imageUrls.push(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    onImageChange(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        console.log(input.files);
        this.imagePreview(input.files);
      }
    }


}
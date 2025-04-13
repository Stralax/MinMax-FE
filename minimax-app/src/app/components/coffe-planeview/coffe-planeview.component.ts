import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotepadComponent } from '../notepad/notepad/notepad.component';

@Component({
  selector: 'app-coffe-planeview',
  imports: [CommonModule, NotepadComponent],
  templateUrl: './coffe-planeview.component.html',
  styles: ''
})
export class CoffePlaneviewComponent {

  uploadedImages: File[] = [];
  imageUrls: string[] = [];
  noPictureYet = true;

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imagePreview(input.files);
    }
  }

  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.imagePreview(event.dataTransfer.files);
      this.noPictureYet=false
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
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



  // private readonly uploadedImages: File[] = [];

  // onImageChange(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     this.imagePreview(input.files);
  //   }
  // }

  // onImageDrop(event: DragEvent): void {
  //   event.preventDefault();
  //   if (event.dataTransfer && event.dataTransfer.files.length > 0) {
  //     this.imagePreview(event.dataTransfer.files);
  //   }
  // }

  // imagePreview(files: FileList): void {
   

    // for (let i = 0; i < files.length; i++) {
    //   const file = files[i];
    //   if (file) {
    //     this.uploadedImages.push(file);
    //     const reader = new FileReader();
    //     reader.onload = () => {
    //       this.imageUrls.push(reader.result as string);
    //     };
    //     reader.readAsDataURL(file);
    //   }
    // }
    // this.images[0] = files;
  //}

}

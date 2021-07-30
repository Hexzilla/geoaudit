import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UploadService } from '../../services';

class FileSnippet {
  constructor(public src: string, public file: File) {}
}

export enum FileTypes {
  IMAGE = "IMAGE",
  DOCUMENT = "DOCUMENT"
}

@Component({
  selector: 'geoaudit-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit {

  @Input() fileType: FileTypes;

  @Input() label?: string;

  @Input() multiple? = false;

  @Input() template?: 'GENERAL' | 'AVATAR' = 'GENERAL' ;

  @Input() src?: string;

  selectedFile: FileSnippet;

  @Output() upload: EventEmitter<any> = new EventEmitter();

  @Output() preview?: EventEmitter<any> = new EventEmitter();

  constructor(private uploadService: UploadService) {}

  ngOnInit(): void {}

  process(input: any): void {
    const length = input.files.length;

    let i = 0;

    for (i = 0; i < length; i++) {
      const file: File = input.files[i];

      const reader = new FileReader();

      reader.addEventListener('load', (event: any) => {
        this.selectedFile = new FileSnippet(event.target.result, file);

        const formData = new FormData();

        formData.append('files', file);

        this.uploadService.post(formData).subscribe(
          (res) => {
            this.upload.emit(res[0]);
          },
          (err) => {
            // Alert service
          },

          () => {
            console.log('we are finished')
          }
        );
      });

      reader.readAsDataURL(file)
    }
  }

  getAcceptedInput(): string {
    switch (this.fileType) {
      case FileTypes.IMAGE:
        return 'image/*';
      case FileTypes.DOCUMENT:
        return 'doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf'
    }
  }

  handleOnPreview() {
    if (this.preview) this.preview.emit();
  }
}

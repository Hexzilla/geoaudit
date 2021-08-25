import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Image } from '../models';
import { FileTypes } from '../components/file-upload/file-upload.component';
import { IAlbum, Lightbox } from 'ngx-lightbox';
import { MatDialog } from '@angular/material/dialog';
import { AttachmentModalComponent } from '../modals/attachment-modal/attachment-modal.component';

@Injectable()
export class UploadService {

  constructor(
    private http: HttpClient,
    private _lightbox: Lightbox,
    private dialog: MatDialog) {}

  post(data: any): Observable<any> {
    return this.http.post<any>(
      `${environment.API_URL}/upload`,
      data
    );
  }

  onPreview(fileType: FileTypes, images: Array<Image>, documents: Array<Image>): void {
    switch (fileType) {
      case FileTypes.IMAGE:
        let _album: Array<IAlbum> = [];

        images.map((image: Image) => {
          const album = {
            src: `${environment.API_URL}${image.url}`,
            caption: image.name,
            thumb: `${environment.API_URL}${image.formats.thumbnail.url}`,
          };

          _album.push(album);
        });

        this._lightbox.open(_album, 0);
        break;

      case FileTypes.DOCUMENT:
        const dialogRef = this.dialog.open(AttachmentModalComponent, {
          data: {
            fileType,
            documents,
          },
        });

        dialogRef.afterClosed().subscribe((result) => {});
        break;
    }
  }

  getImageUploadFiles(images: Array<Image>): Array<any> {
    return images.map((image: Image, index) => {
      const src = `${environment.API_URL}${image.url}`
      const thumb = image.formats?.thumbnail?.url || src
      return {
        index: index,
        src: src,
        caption: image.name,
        thumb: thumb,
      };
    });
  }

  getDocumentUploadFiles(documents: Array<Image>): Array<any> {
    return documents.map((document: Image, index) => {
      return {
        index: index,
        src: `${environment.API_URL}${document.url}`,
        caption: document.name,
      };
    });
  }

  getUploadFiles(fileType: FileTypes, images: Array<Image>, documents: Array<Image>): Array<any> {
    switch (fileType) {
      case FileTypes.IMAGE:
        let _album: Array<any> = [];

        images.map((image: Image, index) => {
          const album = {
            index: index,
            src: `${environment.API_URL}${image.url}`,
            caption: image.name,
            thumb: `${environment.API_URL}${image.formats?.thumbnail.url}`,
          };

          _album.push(album);
        });

        return _album;
        break;

      case FileTypes.DOCUMENT:
        let _document: Array<any> = [];

        documents.map((document: Image, index) => {
          const album = {
            index: index,
            src: `${environment.API_URL}${document.url}`,
            caption: document.name,
          };

          _document.push(album);
        });

        return _document;
        break;
    }
  }

  onItemPreview(fileType: FileTypes, images: Array<Image>, documents: Array<Image>, index: number): void {
    switch (fileType) {
      case FileTypes.IMAGE:
        let _album: Array<IAlbum> = [];

        images.map((image: Image) => {
          const album = {
            src: `${environment.API_URL}${image.url}`,
            caption: image.name,
            thumb: `${environment.API_URL}${image.formats.thumbnail.url}`,
          };

          _album.push(album);
        });

        this._lightbox.open(_album, index);
        break;

      case FileTypes.DOCUMENT:
        const dialogRef = this.dialog.open(AttachmentModalComponent, {
          data: {
            fileType,
            documents,
          },
        });

        dialogRef.afterClosed().subscribe((result) => {});
        break;
    }
  }
}

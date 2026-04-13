import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

type PresignPutResponse = {
  url: string;
  key: string;
  publicUrl: string;
};

@Injectable({ providedIn: 'root' })
export class S3UploadService {
  private readonly http = inject(HttpClient);

  async uploadProfilePhoto(file: File): Promise<{ key: string; url: string }> {
    const presign = await firstValueFrom(
      this.http.post<PresignPutResponse>('/api/s3/presign-put', {
        fileName: file.name,
        contentType: file.type
      })
    );

    const putRes = await fetch(presign.url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file
    });

    if (!putRes.ok) {
      throw new Error(`S3 upload failed (${putRes.status})`);
    }

    return { key: presign.key, url: presign.publicUrl };
  }
}


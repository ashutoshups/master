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
    try {
      const presign = await firstValueFrom(
        this.http.post<PresignPutResponse>('/api/s3/presign-put', {
          fileName: file.name,
          contentType: file.type || 'image/jpeg' // Ensure correct content-type
        })
      );
      console.log('presign >>>>> ', presign);

      let putRes: Response;
      try {
        putRes = await fetch(presign.url, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type || 'image/jpeg'  // Ensure Content-Type matches backend pre-sign generation
          },
          body: file
        });
      } catch (e) {
        throw new Error(`S3 upload request failed (network/CORS). ${e instanceof Error ? e.message : e}`);
      }

      if (!putRes.ok) {
        let responseText = '';
        try {
          responseText = await putRes.text();
        } catch {
          // ignore
        }
        const snippet = responseText ? responseText.slice(0, 500) : '(no response body)';
        throw new Error(`S3 upload failed (${putRes.status}). ${snippet}`);
      }

      return { key: presign.key, url: presign.publicUrl };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      throw new Error(message);
    }
  }
}
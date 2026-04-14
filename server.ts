import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const DEFAULT_AWS_REGION = 'ap-south-1';
const DEFAULT_S3_BUCKET_NAME = 'my-from-profile-bucket';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.use(express.json({ limit: '1mb' }));

  server.post('/api/s3/presign-put', async (req, res) => {
    try {
      // Never allow caching of presigned URLs (they expire quickly and cached responses cause "Request has expired").
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Pragma', 'no-cache');

      const region = process.env['AWS_REGION'] ?? DEFAULT_AWS_REGION;
      const bucket = process.env['S3_BUCKET_NAME'] ?? DEFAULT_S3_BUCKET_NAME;
      if (!region || !bucket) {
        return res.status(500).json({ message: 'Missing AWS_REGION or S3_BUCKET_NAME env vars.' });
      }

      const fileNameRaw = String(req.body?.fileName ?? '');
      const contentType = String(req.body?.contentType ?? '');
      if (!fileNameRaw || !contentType) {
        return res.status(400).json({ message: 'fileName and contentType are required.' });
      }

      if (!contentType.startsWith('image/')) {
        return res.status(400).json({ message: 'Only image uploads are supported.' });
      }

      const safeName = fileNameRaw.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
      const key = `profile-photos/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;

      // For browser uploads via presigned PUT, avoid adding optional checksum requirements
      // (those appear as x-amz-checksum-* query params and can cause 403s when the browser
      // doesn't provide matching checksum headers/payload).
      const s3 = new S3Client({ region, requestChecksumCalculation: 'WHEN_REQUIRED' });
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType
      });

      // 60s is often too short in dev (refreshes, retries, debugger pauses, slow networks).
      // Use a slightly longer window while testing.
      const url = await getSignedUrl(s3, command, { expiresIn: 300 });
      const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key).replace(/%2F/g, '/')}`;

      return res.json({ url, key, publicUrl });
    } catch (err) {
      const e = err as any;
      const httpStatusCode = e?.$metadata?.httpStatusCode;
      const requestId = e?.$metadata?.requestId;
      const extendedRequestId = e?.$metadata?.extendedRequestId;
      const code = e?.name ?? e?.Code ?? 'UnknownError';
      const message = typeof e?.message === 'string' ? e.message : 'Failed to generate presigned URL.';

      console.error('Error generating presigned S3 URL:', {
        code,
        message,
        httpStatusCode,
        requestId,
        extendedRequestId
      });

      // Safe for the frontend; doesn't expose credentials.
      return res.status(500).json({
        message,
        code,
        requestId,
        extendedRequestId
      });
    }
  });

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  }));

  // All regular routes use the Angular engine
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();

import { NextResponse } from 'next/server';
import crypto from 'crypto';

function sha256(message: string): string {
  return crypto.createHash('sha256').update(message).digest('hex');
}

function hmacSha256(key: string, message: string): Buffer {
  return crypto.createHmac('sha256', key).update(message).digest();
}

function getSignature(secretKey: string, date: string, service: string, stringToSign: string): string {
  const dateKey = hmacSha256('TC3' + secretKey, date);
  const serviceKey = hmacSha256(dateKey.toString(), service);
  const signingKey = hmacSha256(serviceKey.toString(), 'tc3_request');
  return crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
}

export async function GET() {
  const secretId = process.env.COS_SECRET_ID;
  const secretKey = process.env.COS_SECRET_KEY;
  const bucket = process.env.COS_BUCKET;
  const region = process.env.COS_REGION;

  if (!secretId || !secretKey || !bucket || !region) {
    return NextResponse.json(
      { error: 'COS credentials not configured', missing: { secretId: !secretId, secretKey: !secretKey, bucket: !bucket, region: !region } },
      { status: 500 }
    );
  }

  try {
    const host = 'sts.tencentcloudapi.com';
    const service = 'sts';
    const version = '2018-08-13';
    const action = 'GetFederationToken';
    const payload = JSON.stringify({
      Name: 'video-upload',
      Policy: JSON.stringify({
        version: '2.0',
        statement: [
          {
            effect: 'allow',
            action: [
              'name/cos:PutObject',
              'name/cos:InitiateMultipartUpload',
              'name/cos:ListParts',
              'name/cos:UploadPart',
              'name/cos:CompleteMultipartUpload',
              'name/cos:AbortMultipartUpload',
            ],
            resource: [`qcs::cos:${region}:uid/100050234507:${bucket}/*`],
          },
        ],
      }),
      DurationSeconds: 1800,
    });

    const timestamp = Math.floor(Date.now() / 1000);
    const date = new Date(timestamp * 1000).toISOString().slice(0, 10);
    const hashedPayload = sha256(payload);

    const canonicalRequest = [
      'POST',
      '/',
      '',
      `content-type:application/json\nhost:${host}\n`,
      'content-type;host',
      hashedPayload,
    ].join('\n');

    const credentialScope = `${date}/${service}/tc3_request`;
    const stringToSign = [
      'TC3-HMAC-SHA256',
      timestamp,
      credentialScope,
      sha256(canonicalRequest),
    ].join('\n');

    const signature = getSignature(secretKey, date, service, stringToSign);
    const authorization = `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=content-type;host, Signature=${signature}`;

    const response = await fetch(`https://${host}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Host': host,
        'X-TC-Action': action,
        'X-TC-Version': version,
        'X-TC-Timestamp': String(timestamp),
        'Authorization': authorization,
      },
      body: payload,
    });

    const data = await response.json();

    if (data.Response?.Error) {
      throw new Error(JSON.stringify(data.Response.Error));
    }

    const creds = data.Response?.Credentials;
    if (!creds) {
      throw new Error('No credentials returned');
    }

    return NextResponse.json({
      credentials: {
        tmpSecretId: creds.TmpSecretId,
        tmpSecretKey: creds.TmpSecretKey,
        sessionToken: creds.Token,
      },
      expiredTime: creds.ExpiredTime,
      startTime: timestamp,
      bucket,
      region,
    });
  } catch (error: any) {
    console.error('COS STS error:', error);
    return NextResponse.json(
      { error: 'Failed to generate COS credentials', detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}

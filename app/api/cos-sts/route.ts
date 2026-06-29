import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

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
    const sts = await import('qcloud-cos-sts');

    const policy = {
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
          resource: [`qcs::cos:${region}:uid/*:${bucket}/*`],
        },
      ],
    };

    const result = await sts.getCredential({
      secretId,
      secretKey,
      region,
      policy,
      durationSeconds: 1800,
    });

    if (result && result.credentials) {
      return NextResponse.json({
        credentials: {
          tmpSecretId: result.credentials.tmpSecretId,
          tmpSecretKey: result.credentials.tmpSecretKey,
          sessionToken: result.credentials.sessionToken,
        },
        expiredTime: result.expiredTime,
        startTime: result.startTime,
        bucket,
        region,
      });
    } else {
      throw new Error('No credentials returned from STS');
    }
  } catch (error: any) {
    console.error('COS STS error:', error);
    return NextResponse.json(
      { error: 'Failed to generate COS credentials', detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import STS from 'qcloud-cos-sts';

export async function GET() {
  const secretId = process.env.COS_SECRET_ID;
  const secretKey = process.env.COS_SECRET_KEY;
  const bucket = process.env.COS_BUCKET;
  const region = process.env.COS_REGION;

  if (!secretId || !secretKey || !bucket || !region) {
    return NextResponse.json(
      { error: 'COS credentials not configured' },
      { status: 500 }
    );
  }

  try {
    const data = await STS.getCredential({
      secretId,
      secretKey,
      durationSeconds: 1800,
      policy: {
        version: '2.0',
        statement: [
          {
            action: [
              'name/cos:PutObject',
              'name/cos:InitiateMultipartUpload',
              'name/cos:ListParts',
              'name/cos:UploadPart',
              'name/cos:CompleteMultipartUpload',
              'name/cos:AbortMultipartUpload',
            ],
            effect: 'allow',
            principal: { qcs: ['*'] },
            resource: [`qcs::cos:${region}:uid/1250000000:${bucket}/*`],
          },
        ],
      },
    });

    return NextResponse.json({
      credentials: data.credentials,
      expiredTime: data.expiredTime,
      startTime: data.startTime,
      bucket,
      region,
    });
  } catch (error) {
    console.error('COS STS error:', error);
    return NextResponse.json(
      { error: 'Failed to generate COS credentials' },
      { status: 500 }
    );
  }
}

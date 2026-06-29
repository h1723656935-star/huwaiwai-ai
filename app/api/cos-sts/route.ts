import { NextResponse } from 'next/server';
import STS from 'qcloud-cos-sts';

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
    // 使用简化配置（自动处理 resource，无需 APPID）
    const data: any = await new Promise((resolve, reject) => {
      (STS as any).getCredential({
        secretId,
        secretKey,
        durationSeconds: 1800,
        bucket,
        region,
        allowPrefix: '*',
        allowActions: [
          'name/cos:PutObject',
          'name/cos:InitiateMultipartUpload',
          'name/cos:ListParts',
          'name/cos:UploadPart',
          'name/cos:CompleteMultipartUpload',
          'name/cos:AbortMultipartUpload',
        ],
      }, (err: any, data: any) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    return NextResponse.json({
      credentials: data.credentials,
      expiredTime: data.expiredTime,
      startTime: data.startTime,
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

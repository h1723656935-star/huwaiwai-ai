import { NextResponse } from 'next/server';

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
    // 动态导入 qcloud-cos-sts，避免构建时类型问题
    const STS = await import('qcloud-cos-sts').then(m => m.default || m);

    const data: any = await new Promise((resolve, reject) => {
      try {
        // 构造 policy（不需要 APPID）
        const policy = {
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
        };

        (STS as any).getCredential(
          {
            secretId,
            secretKey,
            durationSeconds: 1800,
            policy,
          },
          (err: any, data: any) => {
            if (err) reject(err);
            else resolve(data);
          }
        );
      } catch (innerErr) {
        reject(innerErr);
      }
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
      {
        error: 'Failed to generate COS credentials',
        detail: error?.message || String(error),
        stack: error?.stack?.split('\n').slice(0, 3).join(' \n') || '',
      },
      { status: 500 }
    );
  }
}

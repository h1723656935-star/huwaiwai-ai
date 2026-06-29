import { NextResponse } from 'next/server';

function serializeError(error: any): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message + (error.stack ? ' \n' + error.stack.split('\n').slice(0, 3).join(' \n') : '');
  if (typeof error === 'object' && error !== null) {
    const keys = Object.keys(error);
    if (keys.length === 0) return '[empty object]';
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return keys.map(k => `${k}: ${typeof error[k] === 'object' ? '[object]' : String(error[k])}`).join(' | ');
    }
  }
  return String(error);
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
    const mod = await import('qcloud-cos-sts');
    const STS = mod.default || mod;

    // 检查 STS 模块的可用方法
    const methods = Object.keys(STS).filter(k => typeof (STS as any)[k] === 'function');

    const data: any = await new Promise((resolve, reject) => {
      try {
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
            if (err) reject({ source: 'getCredential-callback', error: err });
            else resolve(data);
          }
        );
      } catch (innerErr) {
        reject({ source: 'getCredential-sync', error: innerErr });
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
    const detail = serializeError(error?.error || error);
    console.error('COS STS error:', detail);
    return NextResponse.json(
      {
        error: 'Failed to generate COS credentials',
        detail,
        moduleMethods: error?.moduleMethods || undefined,
      },
      { status: 500 }
    );
  }
}

const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    let alertMsg = '';
    page.on('dialog', async d => {
      alertMsg = d.message();
      console.log('[Alert]:', alertMsg.substring(0, 500));
      await d.accept();
    });

    const requests = [];
    page.on('request', req => {
      if (req.url().includes('supabase.co') && (req.method() === 'POST' || req.method() === 'PATCH')) {
        requests.push(req.method() + ' ' + req.url().replace('https://afegiqdarppxaskppfbf.supabase.co', '').substring(0, 120));
      }
    });

    console.log('1. 打开 admin 页面...');
    await page.goto('https://666-weld-kappa.vercel.app/admin', { waitUntil: 'domcontentloaded' });
    await sleep(2000);

    // 登录
    await page.type('input[type="password"]', 'ai@studio2024', { delay: 10 });
    await sleep(500);
    const loginBtn = await page.evaluateHandle(() =>
      Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('登')));
    if (loginBtn.asElement()) await loginBtn.asElement().click();
    await sleep(3000);

    // 选分类
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === '人像');
      if (btn) btn.click();
    });
    await sleep(500);

    // 标题
    const titleInput = await page.evaluateHandle(() => document.querySelector('input[placeholder*="作品标题"]'));
    if (titleInput.asElement()) {
      await titleInput.asElement().click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await titleInput.asElement().type('VERIFY_PROMPT_TEST', { delay: 5 });
    }

    // 标签
    const tagsInput = await page.evaluateHandle(() => document.querySelector('input[placeholder*="标签"]'));
    if (tagsInput.asElement()) await tagsInput.asElement().type(',test', { delay: 5 });

    // 正向 Prompt
    const promptArea = await page.evaluateHandle(() => document.querySelector('textarea[placeholder*="masterpiece"]'));
    if (promptArea.asElement()) {
      await promptArea.asElement().click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await promptArea.asElement().type('VERIFY_PROMPT_VALUE_masterpiece_best_quality', { delay: 5 });
    }

    // 负向 Prompt
    const negArea = await page.evaluateHandle(() => document.querySelector('textarea[placeholder*="lowres"]'));
    if (negArea.asElement()) await negArea.asElement().type('VERIFY_NEG_lowres', { delay: 5 });

    // 模型
    const modelInput = await page.evaluateHandle(() => document.querySelector('input[placeholder*="SDXL"]'));
    if (modelInput.asElement()) await modelInput.asElement().type('SDXL', { delay: 5 });

    // 尺寸
    const dimInput = await page.evaluateHandle(() => document.querySelector('input[placeholder*="1024"]'));
    if (dimInput.asElement()) await dimInput.asElement().type('1024x1536', { delay: 5 });

    // 描述
    const descArea = await page.evaluateHandle(() => document.querySelector('textarea[placeholder*="创作思路"]'));
    if (descArea.asElement()) await descArea.asElement().type('VERIFY_DESC_test_description', { delay: 5 });

    await sleep(500);

    // 上传图片
    const fileInputs = await page.$$('input[type="file"]');
    if (fileInputs.length > 0) {
      const imageData = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0, '#7865F8'); grad.addColorStop(1, '#FF6B9D');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = 'white'; ctx.font = 'bold 64px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('VERIFY', 256, 280);
        return canvas.toDataURL('image/png');
      });
      const buf = Buffer.from(imageData.replace(/^data:image\/png;base64,/, ''), 'base64');
      fs.writeFileSync('d:\\666\\verify-test.png', buf);
      await fileInputs[0].uploadFile('d:\\666\\verify-test.png');
      await sleep(2500);
    }

    console.log('2. 检查按钮状态...');
    const btnInfo = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('上传图片'));
      if (!btn) return { found: false };
      return { found: true, disabled: btn.disabled };
    });
    console.log('  按钮:', btnInfo);

    if (btnInfo.found && !btnInfo.disabled) {
      console.log('3. 点击上传...');
      requests.length = 0;
      const uploadBtn = await page.evaluateHandle(() =>
        Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('上传图片')));
      await uploadBtn.asElement().click();
      await sleep(8000);
    }

    console.log('\n4. POST/PATCH 请求:');
    requests.forEach(r => console.log('  ' + r));

    console.log('\n5. Alert:', alertMsg || '(无)');

    // 检查数据库
    console.log('\n6. 验证数据库...');
    const url = 'https://afegiqdarppxaskppfbf.supabase.co';
    const key = 'sb_publishable_FNWk10ZtDmPAZcUpwIxnZw_52PlnjDC';
    const res = await fetch(url + '/rest/v1/artworks?title=eq.VERIFY_PROMPT_TEST&select=*', {
      headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
    });
    const data = await res.json();
    if (data.length > 0) {
      const d = data[0];
      console.log('  ✓ 找到作品:', d.title);
      console.log('    prompt:', d.prompt || '(null)');
      console.log('    negativePrompt:', d.negativePrompt || '(null)');
      console.log('    model:', d.model || '(null)');
      console.log('    dimensions:', d.dimensions || '(null)');
      console.log('    description:', d.description || '(null)');
    } else {
      console.log('  ✗ 未找到 VERIFY_PROMPT_TEST');
    }
  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e); process.exit(1); });

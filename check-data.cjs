const url = 'https://afegiqdarppxaskppfbf.supabase.co';
const key = 'sb_publishable_FNWk10ZtDmPAZcUpwIxnZw_52PlnjDC';

(async () => {
  const res = await fetch(url + '/rest/v1/artworks?select=*&order=created_at.desc&limit=10', {
    headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
  });
  const data = await res.json();
  data.forEach((d, i) => {
    console.log('[' + (i+1) + '] id=' + d.id + ' title=' + d.title);
    console.log('    prompt:', d.prompt ? '"' + d.prompt.substring(0, 60) + '"' : '(null)');
    console.log('    negativePrompt:', d.negativePrompt || '(null)');
    console.log('    model:', d.model || '(null)');
    console.log('    dimensions:', d.dimensions || '(null)');
    console.log('    description:', d.description || '(null)');
    console.log('    categories:', JSON.stringify(d.categories));
    console.log('    tags:', JSON.stringify(d.tags));
    console.log('');
  });
})();

import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const catalogue=JSON.parse(await readFile(new URL('../public/observations/index.json',import.meta.url),'utf8'));

for(const region of ['jamuna','sundarbans']){
 test(region+': map-first layout preserves tools, dates and collapsible evidence',async({page})=>{
  await page.goto('/observatory/'+region);
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-map-loaded','true');
  await expect(page.locator('.obs-sidebar')).toBeHidden();
  const map=await page.locator('.restored-map-workspace').boundingBox();
  expect(map!.width).toBeGreaterThan(page.viewportSize()!.width*.98);
  expect(map!.height).toBeGreaterThan(page.viewportSize()!.height*.6);
  const toolbar=page.getByRole('navigation',{name:'Investigation tools'});
  await toolbar.getByRole('button',{name:'Radar & layers'}).click();
  await expect(page.getByRole('group',{name:'Polarization channels'})).toBeVisible();
  await page.getByRole('button',{name:'Close features'}).click();
  await toolbar.getByRole('button',{name:'Investigate a change',exact:true}).click();
  await expect(page.getByRole('navigation',{name:'Finding inspector tabs'})).toBeVisible();
  await page.getByRole('button',{name:'Collapse details',exact:true}).click();
  await expect(page.locator('.finding-drawer')).toHaveClass(/is-collapsed/);
  await page.getByRole('button',{name:'Expand finding details',exact:true}).click();
  await expect(page.getByRole('navigation',{name:'Finding inspector tabs'})).toBeVisible();
  await page.getByRole('button',{name:'Close finding',exact:true}).click();
  await expect(page.locator('.restored-timeline-axis button')).toHaveCount(6);
 });

 test(region+': all dated detail tiles retain original source provenance',async({request})=>{
  for(const observation of catalogue.regions[region].optical_observations){
   expect(observation.source_gsd_m).toBe(10);
   const root='/observations/'+region+'/optical/'+observation.date;
   const response=await request.get(root+'/detail.json');expect(response.ok()).toBe(true);
   const detail=await response.json();
   expect(detail.source_url).toBe(observation.source_assets.visual);
   expect(detail.source_id).toBe(observation.id);expect(detail.bbox).toEqual(observation.bbox);
   expect(detail.source_shape).toEqual([10980,10980]);
   const [w,s,e,n]=observation.bbox,lon=(w+e)/2,lat=(s+n)/2,z=detail.detail_maxzoom;
   const x=Math.floor((lon+180)/360*2**z);
   const y=Math.floor((1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*2**z);
   const tile=await request.get(root+'/'+z+'/'+x+'/'+y+'.webp');expect(tile.ok()).toBe(true);
   expect((await tile.body()).subarray(0,4).toString()).toBe('RIFF');
  }
 });

 test(region+': zoomed map requests the selected date detail pyramid',async({page})=>{
  const missing:string[]=[],servedDates=new Set<string>();
  page.on('response',r=>{if(r.url().includes('/optical/')&&r.status()>=400)missing.push(r.url());const date=r.url().match(/\/optical\/([^/]+)\/14\//)?.[1];if(date&&r.ok())servedDates.add(date);});
  await page.goto('/observatory/'+region);
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-map-loaded','true');
  await page.getByRole('button',{name:'Replay fly-in',exact:true}).waitFor();
  await page.getByRole('slider',{name:'Map zoom',exact:true}).fill('14');
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-optical-detail-loaded','true');
  for(const observation of catalogue.regions[region].optical_observations){
   await page.getByRole('button',{name:'View '+observation.date,exact:true}).click();
   await expect(page.locator('.map-pane-b')).toHaveAttribute('data-optical-detail-url',observation.detail_tiles_url);
   await expect(page.locator('.map-pane-b')).toHaveAttribute('data-optical-detail-loaded','true');
   await expect.poll(()=>servedDates.has(observation.date)).toBe(true);
  }
  expect(missing).toEqual([]);
  await page.getByRole('button',{name:'View '+catalogue.regions[region].optical_pair[1],exact:true}).click();
  await page.getByRole('slider',{name:'Map zoom',exact:true}).fill('12.5');
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-optical-detail-loaded','true');
  await page.screenshot({path:'test-results/'+region+'-source-detail.png'});
 });
}

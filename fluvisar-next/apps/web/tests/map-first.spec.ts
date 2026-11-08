import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const catalogue=JSON.parse(await readFile(new URL('../public/observations/index.json',import.meta.url),'utf8'));

for(const region of ['jamuna','sundarbans']){
 test(region+': persistent left panel preserves tools, dates and collapsible evidence',async({page})=>{
  await page.goto('/observatory/'+region);
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-map-loaded','true');
  await expect(page.locator('.obs-sidebar')).toBeVisible();
  const map=await page.locator('.restored-map-workspace').boundingBox();
  const rail=await page.locator('.obs-sidebar').boundingBox();expect(map!.x).toBeGreaterThanOrEqual(rail!.x+rail!.width-1);
  expect(map!.height).toBeGreaterThan(page.viewportSize()!.height*.6);
  const toolbar=page.getByRole('navigation',{name:'Feature categories'});
  await toolbar.getByRole('button',{name:'Radar',exact:true}).click();
  await expect(page.getByRole('group',{name:'Polarization channels'})).toBeVisible();
  await toolbar.getByRole('button',{name:'Explore',exact:true}).click();
  await page.getByRole('button',{name:'Investigate a change'}).click();
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
  test.setTimeout(90000);await page.emulateMedia({reducedMotion:'reduce'});
  const missing:string[]=[],servedDates=new Set<string>();
  page.on('response',r=>{if(r.url().includes('/optical/')&&r.status()>=400)missing.push(r.url());const date=r.url().match(/\/optical\/([^/]+)\/14\//)?.[1];if(date&&r.ok())servedDates.add(date);});
  await page.goto('/observatory/'+region);
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-map-loaded','true');
  await page.getByRole('button',{name:'Replay fly-in',exact:true}).waitFor();
  await page.getByRole('button',{name:'Dated observations',exact:true}).click();

  await page.getByRole('slider',{name:'Map zoom',exact:true}).fill('14');
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-optical-detail-loaded','true',{timeout:20000});
  for(const observation of catalogue.regions[region].optical_observations){
   await page.getByRole('button',{name:'View '+observation.date,exact:true}).click();
   await expect(page.locator('.map-pane-b')).toHaveAttribute('data-optical-detail-url',observation.detail_tiles_url);
   await expect(page.locator('.map-pane-b')).toHaveAttribute('data-optical-detail-loaded','true',{timeout:20000});
   await expect.poll(()=>servedDates.has(observation.date)).toBe(true);
  }
  expect(missing).toEqual([]);
  await page.getByRole('button',{name:'View '+catalogue.regions[region].optical_pair[1],exact:true}).click();
  await page.getByRole('slider',{name:'Map zoom',exact:true}).fill('12.5');
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-optical-detail-loaded','true',{timeout:20000});
  await page.screenshot({path:'test-results/'+region+'-source-detail.png'});
 });
}

test('requested Jamuna overview and floating chat fit desktop, laptop and phone',async({page})=>{
 test.setTimeout(90000);
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const size of [{width:1920,height:1080},{width:1366,height:768},{width:390,height:844}]){
  await page.setViewportSize(size);await page.goto('/observatory/jamuna');
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-map-loaded','true');
  await expect.poll(async()=>JSON.parse((await page.locator('.map-pane-b').getAttribute('data-camera'))!).pitch).toBeCloseTo(55);
  const camera=JSON.parse((await page.locator('.map-pane-b').getAttribute('data-camera'))!);
  expect(camera.zoom).toBeCloseTo(11.4);expect(camera.center[0]).toBeCloseTo(89.75);
  const rail=page.locator('.obs-sidebar');if(size.width>760)await expect(rail).toBeVisible();else await expect(rail).toBeHidden();
  const chat=page.getByRole('button',{name:'Open FluviSAR chat'}),box=(await chat.boundingBox())!;
  expect(box.x+box.width).toBeGreaterThan(size.width-25);expect(box.y).toBeGreaterThan(size.height-100);
  const last=(await page.locator('.restored-timeline-axis button').last().boundingBox())!;
  expect(Math.max(0,Math.min(box.x+box.width,last.x+last.width)-Math.max(box.x,last.x))*Math.max(0,Math.min(box.y+box.height,last.y+last.height)-Math.max(box.y,last.y))).toBe(0);
  await chat.click();await expect(page.getByRole('dialog',{name:'FluviSAR Assistant'})).toBeVisible();await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/restored-jamuna-'+size.width+'.png'});
 }
});

test('Sundarbans distinguishes detailed context, dated images and recorded clouds in split mode',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/observatory/sundarbans');
 await page.getByRole('button',{name:'Detailed basemap',exact:true}).click();
 await expect(page.locator('.map-pane-b')).toHaveAttribute('data-observation-id','esri-context');
 await expect(page.locator('.obs-acquisition')).toContainText('not date-matched');
 await expect(page.getByRole('button',{name:'Detailed basemap',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.restored-timeline-axis button')).toHaveCount(6);
 await expect(page.getByRole('button',{name:'Replay fly-in',exact:true})).toBeVisible();
 await expect(page.locator('.map-pane-b')).toHaveAttribute('data-context-loaded','true',{timeout:20000});
 await page.screenshot({path:'test-results/restored-sundarbans-context.png'});
 await page.getByRole('button',{name:'Dates',exact:true}).click();
 await expect(page.locator('.map-pane-a')).toHaveAttribute('data-observation-date','2026-10-12');
 await expect(page.locator('.map-pane-b')).toHaveAttribute('data-observation-date','2026-10-22');
 await page.getByRole('button',{name:/Comparison Pair:/}).click();
 await page.getByRole('combobox',{name:'Before acquisition'}).selectOption('2026-06-04');
 await page.getByRole('button',{name:'Use this pair',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('White areas are recorded clouds');
 await expect(page.locator('.restored-compare-label.left')).toContainText('22% ROI cloud/shadow');
 await page.getByRole('button',{name:'Switch to split view'}).click();
 await expect(page.locator('.map-pane-a')).toHaveAttribute('data-optical-loaded','true');
 await expect(page.locator('.map-pane-b')).toHaveAttribute('data-optical-loaded','true');
 const cameras=await page.locator('.restored-map-pane').evaluateAll(nodes=>nodes.map(n=>JSON.parse((n as HTMLElement).dataset.camera!)));
 expect(cameras[0].center).toEqual(cameras[1].center);expect(cameras[0].pitch).toBe(0);
 const panes=await page.locator('.restored-map-pane').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width));expect(panes[0]).toBeCloseTo(panes[1]);
 await page.screenshot({path:'test-results/restored-sundarbans-split-clouds.png'});
});

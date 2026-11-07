import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {contactScenario,type PlaceWatchCatalogue} from '../src/data/placeWatch';
const watch=JSON.parse(await readFile(new URL('../public/place-watch.json',import.meta.url),'utf8')) as PlaceWatchCatalogue;
const catalogue=JSON.parse(await readFile(new URL('../public/observations/index.json',import.meta.url),'utf8'));
test('place watch retains auditable source hashes and timing never claims a failure date',async()=>{
 expect(contactScenario(92.08,30,90)).toMatchObject({days:93,withinHorizon:false,predictedFailureDate:null});expect(contactScenario(92.08,60,90).days).toBe(47);expect(contactScenario(0,30,90).days).toBe(0);expect(()=>contactScenario(10,0,90)).toThrow();
 for(const id of ['jamuna','sundarbans'] as const){const r=watch.regions[id];expect(r.pair).toEqual(catalogue.regions[id].pair);expect(r.rows.length).toBeGreaterThan(0);expect(r.rows.length).toBeLessThanOrEqual(60);
  for(const [file,hash] of [['assets.geojson',r.assetSha256],['findings.geojson',r.findingSha256]])expect(createHash('sha256').update(await readFile(new URL('../public/observations/'+id+'/'+file,import.meta.url))).digest('hex')).toBe(hash);
  for(const [i,p] of r.rows.entries()){expect(p.distanceM).toBeGreaterThanOrEqual(0);expect(p.sourceUrl).toMatch(/^https:\/\/www.openstreetmap.org\//);expect(catalogue.regions[id].findings.features.some((f:any)=>f.properties.id===p.findingId&&f.properties.category==='land-to-water')).toBe(true);if(i)expect(p.distanceM).toBeGreaterThanOrEqual(r.rows[i-1].distanceM);}
 }
});
test('Radar opens tilted and every imagery switch preserves the live camera; chat docks at right',async({page})=>{
 test.setTimeout(90000);await page.emulateMedia({reducedMotion:'reduce'});
 const camera=async()=>JSON.parse((await page.locator('.map-pane-b').getAttribute('data-camera'))!);
 for(const region of ['jamuna','sundarbans']){
  await page.goto('/observatory/'+region);await expect(page.locator('.map-pane-b')).toHaveAttribute('data-map-loaded','true');await expect.poll(async()=>(await camera()).pitch).toBeCloseTo(55);
  await expect(page.locator('.restored-basemaps button').filter({hasText:'Radar'})).toHaveAttribute('aria-pressed','true');expect((await camera()).zoom).toBeCloseTo(11.4);
  await page.getByRole('slider',{name:'Map zoom',exact:true}).fill('12.2');await expect.poll(async()=>(await camera()).zoom).toBeCloseTo(12.2);
  const before=await camera();for(const text of ['Satellite','Radar','Carto','Radar']){await page.locator('.restored-basemaps button').filter({hasText:text}).click();await expect.poll(async()=>(await camera()).zoom).toBeCloseTo(before.zoom);expect(await camera()).toEqual(before);}
  await page.screenshot({path:'test-results/radar-preserved-'+region+'.png'});
 }
 for(const width of [1366,390]){await page.setViewportSize({width,height:844});const launcher=page.getByRole('button',{name:'Open FluviSAR chat',exact:true});const box=(await launcher.boundingBox())!;expect(box.x+box.width).toBeGreaterThan(width-25);await launcher.click();const chat=page.getByRole('dialog',{name:'FluviSAR Assistant'});await expect(chat).toHaveAttribute('aria-modal','false');const b=(await chat.boundingBox())!;expect(b.x+b.width).toBeGreaterThan(width-25);await page.screenshot({path:'test-results/chat-right-'+width+'.png'});await page.keyboard.press('Escape');}
});
test('real places filter, select, export and change only conditional timing assumptions',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/atlas');const panel=page.locator('.atlas-place-watch');await panel.scrollIntoViewIfNeeded();await expect(panel.getByRole('heading',{name:'Where should we check next?'})).toBeVisible();
 await expect(panel.locator('.atlas-watch-detail')).toContainText('Chilmari River port');await expect(panel.getByTestId('scenario-days')).toHaveText('93 days');await panel.getByRole('slider',{name:'Assumed advance rate'}).fill('60');await expect(panel.getByTestId('scenario-days')).toHaveText('47 days');
 await panel.getByRole('combobox',{name:'Watch place type'}).selectOption('settlement');await expect(panel.locator('.atlas-watch-list button')).toHaveCount(watch.regions.jamuna.rows.filter(r=>r.kind==='settlement').length);
 await panel.getByRole('group',{name:'Place watch region'}).getByRole('button',{name:'Sundarbans',exact:true}).click();await panel.getByRole('combobox',{name:'Watch place type'}).selectOption('all');await expect(panel.locator('.atlas-watch-list button')).toHaveCount(14);
 await panel.locator('.atlas-watch-list button').nth(2).click();const pending=page.waitForEvent('download');await panel.getByRole('button',{name:'Export watchlist & assumptions'}).click();const value=JSON.parse(await readFile((await(await pending).path())!,'utf8'));expect(value.selectedPlace.id).toBe(watch.regions.sundarbans.rows[2].id);expect(value.scenario.predictedFailureDate).toBeNull();expect(value.scenario.assumedRateMPerMonth).toBe(60);expect(value.rows).toHaveLength(14);await expect(panel.getByRole('link',{name:'Inspect matched radar finding'})).toHaveAttribute('href',new RegExp('finding='+value.selectedPlace.findingId));
});
test('place watch and timing stay readable in both themes across desktop, laptop and phone',async({page})=>{
 test.setTimeout(120000);await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [1920,1366,390])for(const theme of ['dark','light']){await page.setViewportSize({width,height:900});await page.addInitScript(t=>localStorage.setItem('fluvisar-page-theme',t),theme);await page.goto('/atlas');const panel=page.locator('.atlas-place-watch');await expect(panel.locator('.atlas-watch-detail')).toBeAttached();await panel.scrollIntoViewIfNeeded();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`test-results/place-watch-${width}-${theme}.png`});await panel.locator('.atlas-timing').scrollIntoViewIfNeeded();expect(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await page.screenshot({path:`test-results/place-timing-${width}-${theme}.png`});}
});

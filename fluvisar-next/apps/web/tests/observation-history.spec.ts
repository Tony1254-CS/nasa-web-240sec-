import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const catalogue=JSON.parse(await readFile(new URL('../public/observations/index.json',import.meta.url),'utf8'));
async function open(page:Page,region='jamuna'){
 await page.goto('/observatory/'+region);await expect(page.locator('.map-pane-b')).toHaveAttribute('data-map-loaded','true');
}
async function usePair(page:Page,before:string,after:string){
 await page.getByRole('button',{name:/Comparison Pair:/}).click();
 await page.getByRole('combobox',{name:'Before acquisition'}).selectOption(before);
 await page.getByRole('combobox',{name:'After acquisition'}).selectOption(after);
 await page.getByRole('button',{name:'Use this pair',exact:true}).click();
 await expect(page.locator('.restored-map-workspace')).toHaveAttribute('data-comparison-enabled','true');
}

test('six real optical dates and six same-orbit radar passes have distinct verified displays in each region',async({request})=>{
 for(const region of Object.values(catalogue.regions) as any[]){
  expect(region.observations.length).toBeGreaterThanOrEqual(6);expect(region.optical_observations.length).toBeGreaterThanOrEqual(6);
  expect(new Set(region.observations.map((o:any)=>o.relative_orbit)).size).toBe(1);
  for(const collection of [region.observations,region.optical_observations]){
   const hashes=[];
   for(const observation of collection){
    expect(observation.date).toBe(observation.datetime.slice(0,10));
    const response=await request.get(observation.url??observation.vv_url);expect(response.ok()).toBe(true);
    const hash=createHash('sha256').update(await response.body()).digest('hex');
    expect(hash).toBe(observation.url?observation.display_sha256:observation.display_sha256.vv);hashes.push(hash);
   }
   expect(new Set(hashes).size).toBe(collection.length);
  }
 }
});

test('optical timeline changes the actual image, and optical pair selection survives without resetting',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);
 const observations=catalogue.regions.jamuna.optical_observations;
 await expect(page.getByRole('slider',{name:'Observation timeline slider'})).toHaveAttribute('max','5');
 for(const index of [0,5]){
  await page.getByRole('slider',{name:'Observation timeline slider'}).fill(String(index));
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-observation-id',observations[index].id);
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-observation-url',observations[index].url);
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-optical-loaded','true');
 }
 await usePair(page,observations[0].date,observations[5].date);
 await expect(page.locator('.map-pane-a')).toHaveAttribute('data-observation-id',observations[0].id);
 await expect(page.locator('.map-pane-b')).toHaveAttribute('data-observation-id',observations[5].id);
 await expect(page.locator('.map-pane-a')).toHaveAttribute('data-optical-loaded','true');
 await expect(page.locator('.map-pane-b')).toHaveAttribute('data-optical-loaded','true');
 const slider=page.getByRole('slider',{name:'Map comparison slider'});await slider.focus();await page.keyboard.press('ArrowRight');await expect(slider).toHaveAttribute('aria-valuenow','51');
 await page.screenshot({path:'test-results/real-optical-compare.png'});expect(errors).toEqual([]);
});

test('radar pair changes imagery and measured candidate areas together',async({page,request})=>{
 const region=catalogue.regions.jamuna,observations=[...region.observations].sort((a,b)=>a.date.localeCompare(b.date));
 await open(page);await page.getByRole('button',{name:'📡 Radar',exact:true}).click();
 await expect(page.getByRole('slider',{name:'Observation timeline slider'})).toHaveAttribute('max','5');
 await usePair(page,observations[0].date,observations[5].date);
 await expect(page.locator('.map-pane-a')).toHaveAttribute('data-observation-id',observations[0].id);
 await expect(page.locator('.map-pane-b')).toHaveAttribute('data-observation-id',observations[5].id);
 const url=region.pair_bundles[observations[0].date+'_'+observations[5].date];const pair=await(await request.get(url)).json();
 await expect(page.locator('.obs-stats')).toContainText(pair.metrics.land_to_water_ha.toLocaleString('en-US',{maximumFractionDigits:2}));
 await page.getByRole('button',{name:'Sat vs Radar',exact:true}).click();
 await page.getByRole('button',{name:'Next satellite pass'}).click();
 await expect(page.getByRole('button',{name:'📡 Radar',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.restored-map-workspace')).toHaveAttribute('data-comparison-enabled','false');
});

test('theme toggle applies to the header, feature rail, timeline and tools in both regions',async({page})=>{
 for(const region of ['jamuna','sundarbans']){
  await open(page,region);
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-optical-loaded','true');
  if(await page.locator('.legacy-pages').getAttribute('data-theme')!=='dark')await page.getByRole('button',{name:'Toggle Light/Dark Theme'}).click();
  for(const selector of ['.obs-header','.obs-sidebar','.restored-timeline','.restored-map-tools'])await expect(page.locator(selector)).toHaveCSS('background-color','rgb(19, 33, 41)');
  await page.screenshot({path:'test-results/'+region+'-dark-history.png'});
  await page.getByRole('button',{name:'Toggle Light/Dark Theme'}).click();await expect(page.locator('.obs-header')).toHaveCSS('background-color','rgb(255, 255, 255)');
 }
});

test('mobile exposes all six dates without horizontal page overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page,'sundarbans');
 await expect(page.locator('.restored-timeline-axis button')).toHaveCount(6);
 await page.getByRole('slider',{name:'Observation timeline slider'}).fill('0');
 await expect(page.locator('.map-pane-b')).toHaveAttribute('data-observation-date',catalogue.regions.sundarbans.optical_observations[0].date);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/mobile-real-history.png'});
});

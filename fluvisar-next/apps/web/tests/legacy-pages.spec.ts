import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const catalogue=JSON.parse(await readFile(new URL('../public/observations/index.json',import.meta.url),'utf8'));
const jamuna=catalogue.regions.jamuna;
const sundarbans=catalogue.regions.sundarbans;

test('all public routes share the SAR design system and one navigation',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 for(const route of ['/','/observatory/jamuna','/atlas','/stories','/reports','/impact','/intelligence','/sar-lab']){
  await page.goto(route,{waitUntil:'domcontentloaded'});
  await expect(page.locator('.legacy-pages')).toBeVisible();
  await expect(page.getByRole('navigation',{name:'Primary',exact:true})).toHaveCount(1);
  await expect(page.locator('.data-boot')).toHaveCount(0);
  await expect(page.locator('.desk-standby h1')).toHaveCount(0);
  await page.screenshot({path:'test-results/'+(route.replaceAll('/','-')||'home')+'-desktop.png'});
 }
 expect(errors).toEqual([]);
});

test('landing adopts the reference hero and displays actual source imagery',async({page})=>{
 await page.goto('/');await expect(page.locator('.headline')).toContainText('See the invisible.');
 await expect(page.locator('.hero-radar')).toHaveCSS('background-image',new RegExp(jamuna.observations[1].vv_url));
 await expect(page.locator('.landing-evidence-strip')).toContainText(String(jamuna.observations.length+sundarbans.observations.length));
 await page.getByRole('link',{name:/Begin investigation/}).click();
 await expect(page).toHaveURL(/observatory\/jamuna/);
 await expect(page.locator('.radar-map-canvas')).toHaveAttribute('data-map-loaded','true');
 await page.screenshot({path:'test-results/observatory-loaded.png'});
});

test('real measurements and source identity agree across regions, report and export',async({page})=>{
 await page.goto('/reports');await expect(page.locator('.science-metrics')).toContainText(jamuna.metrics.land_to_water_ha.toLocaleString('en-US',{maximumFractionDigits:1}));
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export source manifest'}).click();const download=await downloadPromise;const filename=await download.path();const exported=JSON.parse(await readFile(filename!,'utf8'));
 expect(exported.run_id).toBe(jamuna.run_id);expect(exported.observations[0].id).toBe(jamuna.observations[0].id);expect(exported.observations[0].numeric_sha256).toEqual(jamuna.observations[0].numeric_sha256);expect(exported.metrics).toEqual(jamuna.metrics);
 await page.getByRole('combobox',{name:'Investigation region'}).selectOption('sundarbans');
 await expect(page.locator('.science-metrics')).toContainText(sundarbans.metrics.land_to_water_ha.toLocaleString('en-US',{maximumFractionDigits:1}));
 await expect(page.locator('.source-list')).toContainText(sundarbans.observations[0].id);
 const body=await page.locator('body').innerText();expect(body).not.toMatch(/145\.8|8,200|99\.4|VERIFIED_ZERO_FABRICATION/);
});

test('Decision Desk uses actual classified area and review status persists',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/impact');await expect(page.locator('.id-workspace-tabs')).toContainText(String(jamuna.findings.features.length));
 await expect(page.getByTestId('impact-land-water')).toContainText(jamuna.metrics.land_to_water_ha.toLocaleString('en-US',{maximumFractionDigits:1}));
 await page.locator('.id-candidate').first().click();await page.getByRole('combobox',{name:'Review status',exact:true}).selectOption('Field review queued');await page.reload();await page.locator('.id-candidate').first().click();await expect(page.getByRole('combobox',{name:'Review status',exact:true})).toHaveValue('Field review queued');
 await page.getByRole('button',{name:'Compare dates',exact:true}).click();await expect(page.getByRole('slider',{name:'Before after comparison slider'})).toBeVisible();
 await page.getByRole('combobox',{name:'Investigation region'}).selectOption('sundarbans');await expect(page.locator('.id-workspace-tabs')).toContainText(String(sundarbans.findings.features.length));expect(errors).toEqual([]);
});

test('numeric API samples the actual raster instead of a coordinate formula',async({request})=>{
 const observation=jamuna.observations[0];const sample=await request.get('http://127.0.0.1:8000/api/artifacts/'+encodeURIComponent(observation.id)+'/sample?lon=89.75&lat=25.575&channel=vv');expect(sample.ok()).toBe(true);const result=await sample.json();expect(result.masked).toBe(false);expect(typeof result.value).toBe('number');expect(result.source_observation_id).toBe(observation.id);expect(result.pixel_resolution_m).toBe(30);
 const outside=await request.get('http://127.0.0.1:8000/api/artifacts/'+encodeURIComponent(observation.id)+'/sample?lon=91&lat=25.575');expect((await outside.json()).value).toBe(null);
 const unknown=await request.get('http://127.0.0.1:8000/api/runs/fabricated-run/bundle');expect(unknown.status()).toBe(404);
});

test('mobile layouts, navigation, and theme remain consistent',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const route of ['/','/reports','/stories','/atlas','/intelligence','/sar-lab','/impact','/observatory/jamuna']){
  await page.goto(route,{waitUntil:'domcontentloaded'});await expect(page.locator('.legacy-pages')).toBeVisible();
  await page.screenshot({path:'test-results/'+(route.replaceAll('/','-')||'home')+'-mobile.png'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 }
 await page.getByRole('button',{name:'Toggle navigation'}).click();await expect(page.getByRole('link',{name:'SAR Lab',exact:true})).toBeVisible();await page.getByRole('link',{name:'SAR Lab',exact:true}).click();await expect(page).toHaveURL(/sar-lab$/);await page.getByRole('button',{name:'Toggle Light/Dark Theme'}).click();await expect(page.locator('.legacy-pages')).toHaveAttribute('data-theme','light');
});

test('ML education stays explicit while the evidence tab reads real observations',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/intelligence');await expect(page.getByRole('tab',{name:/Model playground/})).toContainText('SYNTHETIC');await expect(page.getByRole('tab',{name:/Real observations/})).toHaveAttribute('aria-selected','true');await expect(page.locator('.ml-real-summary')).toContainText(jamuna.metrics.land_to_water_ha.toLocaleString('en-US',{maximumFractionDigits:1}));
 await page.goto('/sar-lab');await expect(page.locator('.sar-lab__hero')).toBeVisible();await page.getByRole('button',{name:'SCAN CHANGE MAP',exact:true}).click();await expect(page.getByRole('button',{name:'REPLAY MAP SCAN',exact:true})).toBeVisible();
 expect(await page.locator('img').evaluateAll(images=>images.filter(image=>!(image as HTMLImageElement).complete||!(image as HTMLImageElement).naturalWidth).map(image=>(image as HTMLImageElement).src))).toEqual([]);expect(errors).toEqual([]);
});

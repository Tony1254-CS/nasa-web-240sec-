import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {buildWaterOutlook} from '../src/data/waterOutlook';
import type {RegionEvidence} from '../src/data/evidence';
const catalogue=JSON.parse(await readFile(new URL('../public/observations/index.json',import.meta.url),'utf8'));

test('elapsed-day outlook handles irregular dates, chronological holds and physical bounds',()=>{
 const base=catalogue.regions.jamuna as RegionEvidence,start=Date.parse('2026-01-01T00:00:00Z');
 const rows=[0,3,9,16,27,37].map((day,i)=>({...base.observations[i],date:new Date(start+day*86400000).toISOString().slice(0,10),water_area_ha:100+10*day}));
 const region={...base,observations:rows,metrics:{...base.metrics,common_valid_area_ha:10000}};
 const snapshot=JSON.stringify(region),result=buildWaterOutlook(region,12);
 expect(result.method).toBe('drift');expect(result.value).toBeCloseTo(590);expect(result.mae).toBeCloseTo(0);expect(result.backtestCount).toBe(3);expect(result.calibratedProbability).toBe(false);
 for(const c of result.candidates)for(const check of c.checks)expect(check.trainThrough<check.targetDate).toBe(true);
 const altered={...region,observations:rows.map((o,i)=>i===5?{...o,water_area_ha:9000}:o)};
 expect(buildWaterOutlook(altered).candidates[1].checks.at(-1)!.prediction).toBeCloseTo(result.candidates[1].checks.at(-1)!.prediction);
 const bounded=buildWaterOutlook({...region,metrics:{...region.metrics,common_valid_area_ha:500}},1000,'drift');expect(bounded.value).toBe(500);expect(bounded.upper).toBe(500);expect(bounded.lower).toBeGreaterThanOrEqual(0);
 expect(JSON.stringify(region)).toBe(snapshot);
});

test('constant measurements prefer persistence and real archives retain six inputs and three checks',()=>{
 const base=catalogue.regions.sundarbans as RegionEvidence;
 const flat=buildWaterOutlook({...base,observations:base.observations.map(o=>({...o,water_area_ha:200}))});
 expect(flat.method).toBe('persistence');expect(flat.value).toBe(200);expect(flat.lower).toBe(200);expect(flat.upper).toBe(200);
 for(const region of Object.values(catalogue.regions) as RegionEvidence[]){const r=buildWaterOutlook(region);expect(r.rows).toHaveLength(6);expect(r.backtestCount).toBe(3);expect(r.value).toBeGreaterThanOrEqual(0);expect(r.value).toBeLessThanOrEqual(region.metrics.common_valid_area_ha);expect(r.targetDate>r.originDate).toBe(true);}
 expect(()=>buildWaterOutlook({...base,observations:base.observations.slice(0,2)})).toThrow();
});

test('Atlas preserves real case data and exports an auditable regional outlook',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/atlas');
 await expect(page.getByRole('heading',{name:'Two landscapes. Real observations.'})).toBeVisible();
 await expect(page.locator('.atlas-case-card')).toHaveCount(2);
 for(const region of Object.values(catalogue.regions) as RegionEvidence[]){const card=page.locator('.atlas-case-card').filter({has:page.getByRole('heading',{name:region.name,exact:true})});await expect(card).toContainText(region.metrics.common_valid_area_ha.toLocaleString('en-US',{maximumFractionDigits:1}));await card.locator('summary').click();await expect(card).toContainText(region.bbox.map(n=>n.toFixed(3)).join(', '));await expect(card.locator('.atlas-input-sources a')).toHaveCount(6);}
 const outlook=page.locator('.atlas-outlook');await outlook.scrollIntoViewIfNeeded();
 await page.getByRole('group',{name:'Outlook region'}).getByRole('button',{name:'Sundarbans',exact:true}).click();
 await page.getByRole('combobox',{name:'Outlook horizon'}).selectOption('24');await page.getByRole('combobox',{name:'Outlook method'}).selectOption('persistence');
 const last=[...catalogue.regions.sundarbans.observations].sort((a:any,b:any)=>a.date.localeCompare(b.date)).at(-1);
 await expect(page.getByTestId('outlook-value')).toContainText(last.water_area_ha.toLocaleString('en-US',{maximumFractionDigits:1}));
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export outlook & inputs'}).click();const result=JSON.parse(await readFile((await(await pending).path())!,'utf8'));
 expect(result.regionId).toBe('sundarbans');expect(result.method).toBe('persistence');expect(result.targetDate).toBe('2026-11-27');expect(result.rows).toHaveLength(6);expect(result.calibratedProbability).toBe(false);expect(result.sources.every((s:any)=>s.url.startsWith('https://'))).toBe(true);
 await page.screenshot({path:'test-results/atlas-outlook-desktop.png'});
});

test('Atlas and corner chat fit desktop, laptop and phone in both themes without a modal backdrop',async({page})=>{
 test.setTimeout(120000);await page.emulateMedia({reducedMotion:'reduce'});
 for(const size of [{width:1920,height:1080},{width:1366,height:768},{width:390,height:844},{width:360,height:800}])for(const theme of ['dark','light']){
  await page.setViewportSize(size);await page.addInitScript(t=>localStorage.setItem('fluvisar-page-theme',t),theme);await page.goto('/atlas');
  await expect(page.locator('.legacy-pages')).toHaveAttribute('data-theme',theme);await expect(page.locator('.atlas-case-card')).toHaveCount(2);
  await expect(page.getByRole('button',{name:'Open Jamuna River observatory',exact:true})).toBeVisible();
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-context-loaded','true',{timeout:20000});
  if(size.width<760){const hero=(await page.locator('.atlas-map-stage .science-hero').boundingBox())!,sund=(await page.getByRole('button',{name:'Open Sundarbans observatory',exact:true}).boundingBox())!,jam=(await page.getByRole('button',{name:'Open Jamuna River observatory',exact:true}).boundingBox())!;expect(jam.y).toBeGreaterThanOrEqual(hero.y+hero.height);expect(sund.y+sund.height).toBeLessThan(610);}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/atlas-${size.width}-${theme}.png`});
  await page.getByRole('button',{name:'Open FluviSAR chat',exact:true}).click();const chat=page.getByRole('dialog',{name:'FluviSAR Assistant'});await expect(chat).toHaveAttribute('aria-modal','false');expect(await page.locator('dialog.fl-assistant').count()).toBe(0);
  const box=(await chat.boundingBox())!;expect(box.x+box.width).toBeGreaterThan(size.width-25);expect(box.y+box.height).toBeLessThan(size.height-60);expect(box.x+box.width).toBeLessThanOrEqual(size.width-10);
  await page.getByRole('button',{name:'Toggle Light/Dark Theme'}).click();await expect(chat).toBeVisible();await page.getByRole('button',{name:'Toggle Light/Dark Theme'}).click();
  await page.getByRole('button',{name:'Minimize FluviSAR chat'}).click();await expect(chat).toHaveCount(0);
  await page.locator('.atlas-outlook').scrollIntoViewIfNeeded();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const colors=await page.locator('.atlas-range b').evaluate(el=>({actual:getComputedStyle(el).color,expected:getComputedStyle(el.closest('.atlas-outlook')!).color}));expect(colors.actual).toBe(colors.expected);
  await page.screenshot({path:`test-results/atlas-outlook-${size.width}-${theme}.png`});
 }
});

test('each observatory visit zooms in again, including sessions carrying the previous seen flag',async({page})=>{
 test.setTimeout(60000);await page.emulateMedia({reducedMotion:'no-preference'});
 await page.addInitScript(()=>{
  sessionStorage.setItem('fluvisar-flyin:jamuna','seen');(window as any).cameraSamples=[];
  new MutationObserver(records=>{for(const r of records)if((r.target as HTMLElement).classList?.contains('map-pane-b')){try{(window as any).cameraSamples.push(JSON.parse((r.target as HTMLElement).dataset.camera!));}catch{}}}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-camera']});
 });
 for(let i=0;i<2;i++){
  await page.goto('/observatory/jamuna');await expect.poll(()=>page.evaluate(()=>(window as any).cameraSamples.some((s:any)=>Math.abs(s.zoom-11.4)<.00001&&Math.abs(s.pitch-55)<.00001)),{timeout:20000}).toBe(true);
  const samples=await page.evaluate(()=>(window as any).cameraSamples);expect(samples.some((s:any)=>s.zoom<3)).toBe(true);expect(samples.some((s:any)=>s.zoom>4&&s.zoom<10)).toBe(true);
 }
});

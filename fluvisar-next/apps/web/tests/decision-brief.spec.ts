import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const catalogue=JSON.parse(await readFile(new URL('../public/observations/index.json',import.meta.url),'utf8'));
test('changing region completes the restored cinematic arrival on the new map instance',async({page})=>{
 test.setTimeout(60000);await page.emulateMedia({reducedMotion:'no-preference'});
 await page.addInitScript(()=>{(window as any).regionCameras=[];new MutationObserver(records=>{for(const r of records)if((r.target as HTMLElement).classList?.contains('map-pane-b'))try{(window as any).regionCameras.push(JSON.parse((r.target as HTMLElement).dataset.camera!));}catch{}}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-camera']});});
 await page.goto('/observatory/jamuna');await expect.poll(()=>page.evaluate(()=>(window as any).regionCameras.some((c:any)=>Math.abs(c.zoom-11.4)<1e-5&&Math.abs(c.pitch-55)<1e-5)),{timeout:20000}).toBe(true);
 await page.evaluate(()=>(window as any).regionCameras=[]);await page.getByRole('combobox',{name:'Study region'}).selectOption('sundarbans');
 await expect.poll(()=>page.evaluate(()=>(window as any).regionCameras.some((c:any)=>Math.abs(c.center[1]-21.83)<1e-5&&Math.abs(c.zoom-11.4)<1e-5&&Math.abs(c.pitch-55)<1e-5)),{timeout:20000}).toBe(true);
 const cameras=await page.evaluate(()=>(window as any).regionCameras);expect(cameras.some((c:any)=>c.zoom<3)).toBe(true);expect(cameras.some((c:any)=>c.zoom>4&&c.zoom<10)).toBe(true);await expect(page.locator('.restored-map-workspace')).toHaveAttribute('data-flyin-active','false');await expect(page.locator('.restored-basemaps button').filter({hasText:'Satellite'})).toHaveAttribute('aria-pressed','true');await expect(page.locator('.map-pane-b')).toHaveAttribute('data-context-loaded','true',{timeout:20000});await page.screenshot({path:'test-results/restored-satellite-arrival.png'});
});
test('shared brief renders measured values and full sources at every active entry point',async({page})=>{
 test.setTimeout(120000);await page.emulateMedia({reducedMotion:'reduce'});
 for(const region of ['jamuna','sundarbans']){
  await page.goto('/reports');await page.getByRole('combobox',{name:'Investigation region'}).selectOption(region);await page.getByRole('button',{name:'One-Page Brief (PDF + QR)'}).click();
  const report=page.getByRole('dialog',{name:'Source-linked regional decision brief'});await expect(report).toBeVisible();await expect(report.getByTestId('brief-land-water')).toContainText(catalogue.regions[region].metrics.land_to_water_ha.toLocaleString('en-US',{maximumFractionDigits:2}));await expect(report.getByRole('button',{name:'Print / Export PDF'})).toBeEnabled();await expect(report.locator('.db-source-grid')).not.toContainText('[object Object]');await expect(report).not.toContainText('1,850');await expect(report).not.toContainText('NISAR L-band');await expect(report.locator('.db-qr img')).toHaveAttribute('src',/^data:image\/png/);expect(await report.evaluate(el=>el.parentElement===document.body)).toBe(true);await page.keyboard.press('Escape');await expect(report).toHaveCount(0);
  await page.goto('/observatory/'+region);await page.getByRole('button',{name:'Govt Decision Brief (PDF + QR)'}).click();await expect(report).toBeVisible();await expect(report.getByRole('button',{name:'Print / Export PDF'})).toBeEnabled();await report.getByRole('button',{name:'Close decision brief'}).click();
  await page.getByRole('button',{name:'Investigate a change'}).click();await page.getByRole('button',{name:'Govt Brief (PDF + QR)',exact:true}).click();await expect(report.locator('.db-selected')).toBeVisible();await expect(report.getByRole('button',{name:'Print / Export PDF'})).toBeEnabled();await expect(report.locator('.db-qr a')).toHaveAttribute('href',/finding=/);await report.getByRole('button',{name:'Close decision brief'}).click();
 }
});
test('brief typography, scrolling and actions fit desktop, laptop and phone in either theme',async({page})=>{
 test.setTimeout(120000);await page.emulateMedia({reducedMotion:'reduce'});
 for(const size of [{width:1920,height:1080},{width:1366,height:768},{width:390,height:844},{width:360,height:800}])for(const theme of ['dark','light']){
  await page.setViewportSize(size);await page.addInitScript(t=>localStorage.setItem('fluvisar-page-theme',t),theme);await page.goto('/reports');await page.getByRole('button',{name:'One-Page Brief (PDF + QR)'}).click();const report=page.getByRole('dialog',{name:'Source-linked regional decision brief'});await expect(report.getByRole('button',{name:'Print / Export PDF'})).toBeEnabled();await page.evaluate(()=>document.fonts.ready);
  const box=(await report.boundingBox())!;expect(box.x).toBeGreaterThanOrEqual(7);expect(box.x+box.width).toBeLessThanOrEqual(size.width-7);expect(box.y+box.height).toBeLessThanOrEqual(size.height-7);expect(await report.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await expect(report.locator('h1')).toHaveCSS('font-size',size.width<700?'23px':'25px');await expect(report.locator('.db-paper')).toHaveCSS('color','rgb(16, 42, 67)');await page.screenshot({path:`test-results/brief-${size.width}-${theme}.png`});await report.locator('.db-scroll').evaluate(el=>el.scrollTop=el.scrollHeight);await expect(report.locator('.db-footer')).toBeVisible();await report.getByRole('button',{name:'Close decision brief'}).click();
 }
});
test('print isolates the complete paper and generates both regional PDFs',async({page})=>{
 test.setTimeout(90000);await page.emulateMedia({reducedMotion:'reduce'});
 for(const region of ['jamuna','sundarbans']){
  await page.goto('/reports');await page.getByRole('combobox',{name:'Investigation region'}).selectOption(region);await page.getByRole('button',{name:'One-Page Brief (PDF + QR)'}).click();const report=page.getByRole('dialog',{name:'Source-linked regional decision brief'});await expect(report.getByRole('button',{name:'Print / Export PDF'})).toBeEnabled();await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({media:'print'});await expect(page.locator('#root')).toBeHidden();await expect(report.locator('.db-toolbar')).toBeHidden();await expect(report.locator('.db-footer')).toBeVisible();await page.pdf({path:`test-results/brief-${region}.pdf`,format:'A4',printBackground:true,preferCSSPageSize:true});await page.emulateMedia({media:'screen'});await report.getByRole('button',{name:'Close decision brief'}).click();
 }
});

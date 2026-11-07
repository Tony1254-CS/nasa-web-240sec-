import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const catalogue=JSON.parse(await readFile(new URL('../public/observations/index.json',import.meta.url),'utf8'));
async function open(page:Page,region='sundarbans'){
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/observatory/'+region);
 await expect(page.locator('.map-pane-b')).toHaveAttribute('data-map-loaded','true');
 await expect(page.locator('.map-pane-a')).toHaveAttribute('data-map-loaded','true');
}
async function cameras(page:Page){return page.locator('.restored-map-pane').evaluateAll(nodes=>nodes.map(n=>JSON.parse((n as HTMLElement).dataset.camera!)));}

test('Sundarbans mouse grip keeps dragging after capture loss and reaches both ends without panning',async({page})=>{
 await open(page);await page.getByRole('button',{name:'Dates',exact:true}).click();
 const slider=page.getByRole('slider',{name:'Map comparison slider'}),map=(await page.locator('.restored-map-workspace').boundingBox())!;
 const before=await cameras(page),grip=(await slider.locator('.swipe-knob').boundingBox())!;
 await page.mouse.move(grip.x+grip.width/2,grip.y+grip.height/2);await page.mouse.down();
 // Reproduce losing native capture while the pointer leaves the narrow grip.
 expect(await slider.evaluate(el=>{for(let id=1;id<10;id++)if(el.hasPointerCapture(id)){el.releasePointerCapture(id);return true;}return false;})).toBe(true);
 await page.mouse.move(map.x+map.width*.85,grip.y+20,{steps:2});await expect(slider).toHaveAttribute('aria-valuenow','85');
 await page.mouse.move(map.x+map.width*.15,grip.y+20,{steps:2});await expect(slider).toHaveAttribute('aria-valuenow','15');
 await page.mouse.move(5,grip.y+20);await expect(slider).toHaveAttribute('aria-valuenow','0');await page.mouse.up();
 const after=await cameras(page);expect(after[0].center).toEqual(before[0].center);expect(after[0].center).toEqual(after[1].center);
 await slider.focus();await page.keyboard.press('End');await expect(slider).toHaveAttribute('aria-valuenow','100');
 await page.keyboard.press('Shift+ArrowLeft');await expect(slider).toHaveAttribute('aria-valuenow','95');
 await page.keyboard.press('Home');await expect(slider).toHaveAttribute('aria-valuenow','0');
});

test('Sundarbans phone touch grip tracks a full swipe without scrolling or moving the map',async({page,context})=>{
 await page.setViewportSize({width:390,height:844});await open(page);
 await page.getByRole('button',{name:'Dates',exact:true}).click();
 const slider=page.getByRole('slider',{name:'Map comparison slider'}),map=(await page.locator('.restored-map-workspace').boundingBox())!,grip=(await slider.locator('.swipe-knob').boundingBox())!;
 const before=await cameras(page),session=await context.newCDPSession(page);
 await session.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
 const y=grip.y+grip.height/2;
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:grip.x+grip.width/2,y,id:1}]});
 await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:map.x+map.width*.8,y,id:1}]});
 await expect(slider).toHaveAttribute('aria-valuenow','80');
 await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:map.x+map.width*.2,y,id:1}]});
 await expect(slider).toHaveAttribute('aria-valuenow','20');
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const after=await cameras(page);expect(after[0].center).toEqual(before[0].center);expect(await page.evaluate(()=>scrollY)).toBe(0);
});

test('both satellite defaults use the requested camera and show source-linked changes and water masks',async({page})=>{
 test.setTimeout(90000);await page.setViewportSize({width:1920,height:1080});
 for(const region of ['jamuna','sundarbans']){
  await open(page,region);const record=catalogue.regions[region];
  await expect.poll(async()=>Math.abs((await cameras(page))[0].zoom-11.4)).toBeLessThan(.000001);
  await expect.poll(async()=>Math.abs((await cameras(page))[0].pitch-55)).toBeLessThan(.000001);
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-change-overlay','true');
  await expect(page.locator('.obs-radar-pair')).toContainText(record.pair.join(' / '));
  await expect(page.locator('.obs-overlay-reference')).toContainText('separate dates');
  await expect.poll(()=>page.locator('.map-pane-b').evaluate((el,which)=>(which==='jamuna'?((el as HTMLElement).dataset.opticalLoaded==='true'||(el as HTMLElement).dataset.opticalDetailLoaded==='true'):(el as HTMLElement).dataset.contextLoaded==='true'),region),{timeout:20000}).toBe(true);
  await page.screenshot({path:'test-results/satellite-default-'+region+'.png'});
  await page.getByRole('navigation',{name:'Feature categories'}).getByRole('button',{name:'Radar',exact:true}).click();
  await page.getByRole('button',{name:'Water mask',exact:true}).click();
  await expect(page.getByRole('button',{name:'🛰️ Satellite',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-water-overlay','true');
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-water-date',record.pair[1]);
  await page.getByLabel('Water layer',{exact:true}).uncheck();await expect(page.locator('.map-pane-b')).toHaveAttribute('data-water-overlay','false');
  await page.getByLabel('Change outlines',{exact:true}).uncheck();await expect(page.locator('.map-pane-b')).toHaveAttribute('data-change-overlay','false');
  await page.getByRole('button',{name:'Toggle outlines and tint'}).click();await expect(page.locator('.map-pane-b')).toHaveAttribute('data-change-overlay','true');
  await page.setViewportSize({width:1366,height:768});
  const legendBox=(await page.locator('.restored-map-legend').boundingBox())!,toolsBox=(await page.locator('.restored-map-tools').boundingBox())!;expect(legendBox.x+legendBox.width).toBeLessThanOrEqual(toolsBox.x);
  await page.setViewportSize({width:1920,height:1080});
  await page.getByRole('button',{name:'Locate largest measured change'}).click();
  const largest=record.findings.features.reduce((a:any,b:any)=>a.properties.area_ha>b.properties.area_ha?a:b);
  await expect(page.locator('.finding-drawer code').first()).toHaveText(largest.properties.id);
  await expect.poll(async()=>Math.abs((await cameras(page))[0].center[0]-largest.properties.centroid[0])).toBeLessThan(.000001);
  await page.screenshot({path:'test-results/satellite-measured-change-'+region+'.png'});
  await page.getByRole('button',{name:'Close finding',exact:true}).click();
  await page.getByRole('button',{name:'Compare measured radar water'}).click();
  await expect(page.locator('.map-pane-a')).toHaveAttribute('data-observation-date',record.pair[0]);
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-observation-date',record.pair[1]);
  await expect(page.locator('.map-pane-b')).toHaveAttribute('data-water-overlay','true');
 }
});

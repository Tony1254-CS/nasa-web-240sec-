import {test,expect,type Page} from '@playwright/test';

async function ready(page:Page,region='jamuna'){
 await page.goto('/observatory/'+region);
 for(const side of ['a','b'])await expect(page.locator('.map-pane-'+side)).toHaveAttribute('data-map-loaded','true');
}
async function cameras(page:Page){return page.evaluate(()=>['a','b'].map(side=>JSON.parse(document.querySelector('.map-pane-'+side)!.getAttribute('data-camera')!)));}
async function aligned(page:Page){await expect.poll(async()=>{const [a,b]=await cameras(page);return Math.abs(a.zoom-b.zoom)+Math.abs(a.center[0]-b.center[0])+Math.abs(a.center[1]-b.center[1])+Math.abs(a.anchor[0]-b.anchor[0])+Math.abs(a.anchor[1]-b.anchor[1]);}).toBeLessThan(.000001);}
async function footprintFits(page:Page){
 await expect.poll(async()=>{
  const [,b]=await cameras(page),box=await page.locator('.map-pane-b').boundingBox();if(!box)return false;
  if(b.pitch>=40&&await page.locator('.restored-map-workspace').getAttribute('data-comparison-enabled')==='false')return b.center[0]>89.5&&b.center[0]<89.9&&((b.center[1]>25.4&&b.center[1]<25.75)||(b.center[1]>21.75&&b.center[1]<22));
  const [[w,n],[e,s]]=b.bounds;
  return w>=15&&n>=75&&e<=box.width-15&&s<=box.height-15&&(s-n)>box.height*.35;
 }).toBe(true);
}

test('both study areas open on registered satellite overviews with aligned comparison cameras',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 for(const region of ['jamuna','sundarbans']){
  await ready(page,region);
  await expect(page.locator('.restored-map-workspace')).toHaveAttribute('data-comparison-enabled','false');
  await expect(page.getByRole('button',{name:'🛰️ Satellite',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('button',{name:'Compare before & after'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Investigate a change',exact:false})).toBeVisible();
  await footprintFits(page);await aligned(page);
  await expect(page.getByRole('complementary',{name:'Observatory features'})).toBeVisible();
  const map=(await page.locator('.restored-map-workspace').boundingBox())!;
  const rail=await page.locator('.obs-sidebar').boundingBox();expect(map.x).toBeGreaterThanOrEqual(rail!.x+rail!.width-1);
  await page.getByRole('button',{name:'Zoom in',exact:true}).click();
  await page.getByRole('button',{name:'Recenter study area'}).click();await footprintFits(page);
  await page.screenshot({path:'test-results/observatory-'+region+'-redesign.png'});
 }
 expect(errors).toEqual([]);
});

test('date comparison, dragged swipe and split maintain geographic alignment',async({page})=>{
 await ready(page,'sundarbans');await page.getByRole('button',{name:'Compare before & after'}).click();
 const slider=page.getByRole('slider',{name:'Map comparison slider'});await expect(slider).toBeVisible();
 await page.getByRole('button',{name:'Sat vs Radar',exact:true}).click();
 const box=(await slider.boundingBox())!,map=(await page.locator('.restored-map-workspace').boundingBox())!;
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(map.x+map.width*.65,map.y+map.height*.5,{steps:8});await page.mouse.up();
 await expect(slider).toHaveAttribute('aria-valuenow','65');await aligned(page);
 await page.getByRole('button',{name:'Switch to split view'}).click();
 await expect(page.locator('.restored-map-workspace')).toHaveAttribute('data-comparison-layout','split');await aligned(page);await footprintFits(page);
 await page.getByRole('button',{name:'Switch to swipe view'}).click();await aligned(page);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download map image'}).click();expect((await download).suggestedFilename()).toMatch(/\.png$/);
});

test('radar, planning, InSAR, evidence, coverage and observation pairing are discoverable',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await ready(page);
 const categories=page.getByRole('navigation',{name:'Feature categories'});
 await categories.getByRole('button',{name:'Radar',exact:true}).click();
 const channels=page.getByRole('group',{name:'Polarization channels'});
 for(const name of ['VV','VH','VV/VH','RGB']){await channels.getByRole('button',{name,exact:true}).click();await expect(channels.getByRole('button',{name,exact:true})).toHaveClass('selected');}
 await categories.getByRole('button',{name:'More tools',exact:true}).click();
 await page.getByRole('button',{name:/Ground motion experiment/}).click();await expect(page.getByRole('slider',{name:'Minimum coherence'})).toBeVisible();
 await page.getByRole('button',{name:/Scenario planner/}).click();await expect(page.getByRole('slider',{name:'Hypothetical stage change'})).toBeVisible();
 await page.getByRole('button',{name:/Service continuity/}).click();await expect(page.locator('.restored-calculator')).toBeVisible();
 await page.getByRole('button',{name:'Toggle coverage curtain'}).click();await expect(page.getByText('Observation denominator mask',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Close coverage curtain'}).click();
 await page.getByRole('button',{name:/Comparison Pair:/}).click();await expect(page.getByRole('dialog',{name:'Comparison pair selector'})).toBeVisible();await page.getByRole('button',{name:'Use this pair',exact:true}).click();
 await page.getByRole('navigation',{name:'Feature categories'}).getByRole('button',{name:'Explore',exact:true}).click();await page.getByRole('complementary',{name:'Observatory features'}).getByRole('button',{name:/Investigate a change/}).click();
 const tabs=page.getByRole('navigation',{name:'Finding inspector tabs'});await expect(tabs).toBeVisible();await tabs.getByRole('button',{name:'audit',exact:true}).click();await expect(page.getByRole('slider',{name:'Audit water threshold'})).toBeVisible();
 expect(errors).toEqual([]);
});

test('mobile keeps the map visible and opens a usable feature drawer',async({page})=>{
 await page.setViewportSize({width:390,height:844});await ready(page,'sundarbans');await footprintFits(page);
 await expect(page.getByRole('button',{name:'🛰️ Satellite',exact:true})).toBeVisible();
 const replay=await page.getByRole('button',{name:'Replay fly-in',exact:true}).boundingBox(),features=await page.getByRole('button',{name:'Open observatory features'}).boundingBox();expect(Math.max(0,Math.min(replay!.x+replay!.width,features!.x+features!.width)-Math.max(replay!.x,features!.x))*Math.max(0,Math.min(replay!.y+replay!.height,features!.y+features!.height)-Math.max(replay!.y,features!.y))).toBe(0);
 await page.getByRole('button',{name:'Open observatory features'}).click();
 await page.getByRole('navigation',{name:'Feature categories'}).getByRole('button',{name:'Radar',exact:true}).click();
 await expect(page.getByRole('group',{name:'Polarization channels'})).toBeVisible();await page.getByRole('button',{name:'Close features'}).click();
 await page.getByRole('button',{name:'Dates',exact:true}).click();await expect(page.getByRole('slider',{name:'Map comparison slider'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/observatory-mobile-redesign.png'});
});

test('changing region and returning from Atlas frame the correct real footprint',async({page})=>{
 await ready(page);await page.getByRole('combobox',{name:'Study region'}).selectOption('sundarbans');
 await expect(page).toHaveURL(/observatory\/sundarbans$/);await expect(page.locator('.map-pane-b')).toHaveAttribute('data-map-loaded','true');await footprintFits(page);
 await expect.poll(async()=>{const [,b]=await cameras(page);return b.center[1];}).toBeLessThan(23);
 await page.getByRole('link',{name:'Atlas',exact:true}).click();await page.getByRole('link',{name:'Observatory',exact:true}).click();
 await expect(page).toHaveURL(/observatory\/sundarbans$/);await expect(page.locator('.map-pane-b')).toHaveAttribute('data-map-loaded','true');await footprintFits(page);
});

import {test,expect} from '@playwright/test';
test.describe.configure({mode:'parallel'});

const devices=[{name:'desktop',width:1920,height:1080},{name:'laptop',width:1366,height:768},{name:'compact-laptop',width:1280,height:720},{name:'phone',width:390,height:844},{name:'small-phone',width:360,height:800}];
const routes=['/','/atlas','/observatory/jamuna','/observatory/sundarbans','/impact','/intelligence','/sar-lab','/about','/stories','/reports'];
for(const device of devices)for(const theme of ['dark','light']){
 test(`${device.name} ${theme}: all pages fit and navigation stays reachable`,async({page})=>{
  test.setTimeout(150000);await page.setViewportSize(device);await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(value=>localStorage.setItem('fluvisar-page-theme',value),theme);
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  for(const route of routes){
   await test.step(route,async()=>{
    await page.goto(route,{waitUntil:'domcontentloaded'});const nav=page.getByRole('navigation',{name:'Primary',exact:true});await expect(nav).toBeVisible();await expect(page.locator('.data-boot')).toHaveCount(0);await expect(page.locator('.desk-standby')).toHaveCount(0);await expect(page.locator('.legacy-pages')).toHaveAttribute('data-theme',theme);await page.evaluate(()=>document.fonts.ready);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);expect(overflow,route+' page overflow').toBeLessThanOrEqual(1);
    const left=await page.locator('.navbar__left').boundingBox(),right=await page.locator('.navbar__right').boundingBox();expect(left!.x+left!.width,route+' navigation groups overlap').toBeLessThanOrEqual(right!.x+1);
    for(const control of [nav.getByRole('button',{name:'Ask FluviSAR',exact:true}),nav.getByRole('button',{name:'Toggle Light/Dark Theme'}),nav.getByRole('combobox',{name:'Investigation region'})]){await expect(control).toBeVisible();const box=await control.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width,route+' header control offscreen').toBeLessThanOrEqual(device.width+1);}
    const menu=nav.getByRole('button',{name:'Toggle navigation'});if(await menu.isVisible()){const box=await menu.boundingBox();expect(box!.x+box!.width).toBeLessThanOrEqual(device.width+1);await menu.click();await expect(nav.getByRole('link',{name:'About us',exact:true})).toBeVisible();await menu.click();}
    if(route.startsWith('/observatory/'))await expect(page.locator('.radar-map-canvas')).toHaveAttribute('data-map-loaded','true');
    if(route==='/about')await expect(page.locator('.about-team')).toContainText('AI/ML Engineer');
    if(['/stories','/reports','/atlas'].includes(route)){const hero=page.locator('.science-hero'),bounds=await hero.boundingBox();for(const text of [hero.locator('h1'),hero.locator('p').first()]){const box=await text.boundingBox();expect(box!.y+box!.height,route+' intro text clipped by its panel').toBeLessThanOrEqual(bounds!.y+bounds!.height+1);}if(route==='/reports'){for(const action of await hero.locator('button').all()){const box=await action.boundingBox();expect(box!.y+box!.height,'Report action clipped by intro panel').toBeLessThanOrEqual(bounds!.y+bounds!.height+1);}}}
    await page.screenshot({path:`test-results/responsive/${device.name}-${theme}-${route.replaceAll('/','-')||'home'}.png`});
   });
  }
  expect(errors).toEqual([]);
 });
}

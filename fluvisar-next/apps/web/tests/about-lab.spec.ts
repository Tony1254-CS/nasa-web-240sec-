import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const catalog=JSON.parse(await readFile(new URL('../public/observations/index.json',import.meta.url),'utf8'));
const crew=[['Sabbir Ahmed','Mission Commander'],['Sanjid Talukder','Data Scientist'],['Sakibul Hassan Shovon','AI/ML Engineer'],['Yasin Arafat','Hydro Analyst']];

test('About tells the project story with the original team and registered imagery',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('/about');await expect(page.getByRole('navigation',{name:'Primary',exact:true})).toHaveCount(1);await expect(page.getByRole('heading',{level:1})).toContainText('A changing landscape.');
 for(const [name,role] of crew){const card=page.locator('.about-team>article').filter({has:page.getByRole('heading',{name,exact:true})});await expect(card).toContainText(role);}
 await expect(page.locator('.about-team>article')).toHaveCount(4);await expect(page.locator('.about-team a')).toHaveAttribute('href','https://github.com/Tony1254-CS');
 const image=await page.locator('.about-hero-image img').getAttribute('src');expect(catalog.regions.jamuna.optical_observations.some((o:{url:string})=>o.url===image)).toBe(true);
 await page.locator('.about-hero-image img').evaluate((image:HTMLImageElement)=>image.decode());await page.screenshot({path:'test-results/about-dark.png'});
 await page.getByRole('navigation',{name:'Our story chapters'}).getByRole('link',{name:/The people/}).click();await expect(page).toHaveURL(/#people$/);await expect(page.getByRole('heading',{name:'Four perspectives. One shared mission.'})).toBeInViewport();await page.locator('.about-team').screenshot({path:'test-results/about-team.png'});
 await page.goto('/about-us');await expect(page).toHaveURL(/\/about$/);expect(errors).toEqual([]);
});

test('About remains readable in light theme, on mobile and through tablet navigation',async({page})=>{
 await page.goto('/about');await page.getByRole('button',{name:'Toggle Light/Dark Theme'}).click();await expect(page.locator('.about-story')).toHaveCSS('background-color','rgb(243, 246, 245)');await page.screenshot({path:'test-results/about-light.png'});
 for(const width of [390,1100]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);await page.getByRole('button',{name:'Toggle navigation'}).click();await expect(page.getByRole('link',{name:'About us',exact:true})).toBeVisible();await page.getByRole('link',{name:'About us',exact:true}).click();await expect(page.locator('.navbar__nav')).not.toHaveClass(/navbar__nav--open/);}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/about-mobile.png'});await page.getByRole('navigation',{name:'Our story chapters'}).getByRole('link',{name:/The people/}).click();await expect(page.locator('.about-team')).toBeVisible();
});

test('SAR Lab keeps its controls, navigation and interactions while using the shared presentation',async({page})=>{
 await page.goto('/sar-lab');const lab=page.locator('.sar-lab');await expect(lab).toHaveCSS('background-color','rgb(15, 23, 27)');await expect(lab.locator('input')).toHaveCount(17);await expect(lab.locator('button')).toHaveCount(19);
 const expectedButtons=['X-band','C-band','L-band','P-band','Traditional Stripmap SAR','SweepSAR + DBF (NISAR)','Open floodplain','Crops / emergent plants','Woody vegetation','Standing water · ON','Water (representative)','Wet Soil (representative)','Dry Soil (representative)','Ice (representative)','Concrete (representative)','Surface-dominant','Mixed scattering','Dihedral-dominant','SCAN CHANGE MAP'];expect((await lab.locator('button').allTextContents()).map(text=>text.trim())).toEqual(expectedButtons);
 expect(await lab.locator('input').evaluateAll(nodes=>nodes.map(n=>({type:(n as HTMLInputElement).type,min:(n as HTMLInputElement).min,max:(n as HTMLInputElement).max})))).toEqual([{type:'range',min:'0',max:'60'},{type:'range',min:'3',max:'90'},{type:'range',min:'0',max:'100'},{type:'range',min:'15',max:'65'},{type:'range',min:'10',max:'65'},{type:'range',min:'1',max:'300'},{type:'range',min:'0',max:'100'},{type:'range',min:'3',max:'15'},{type:'range',min:'1',max:'16'},{type:'range',min:'0',max:'100'},{type:'range',min:'0',max:'100'},{type:'range',min:'0',max:'100'},{type:'range',min:'0',max:'100'},{type:'range',min:'10',max:'150'},{type:'range',min:'-25',max:'-5'},{type:'range',min:'1',max:'20'},{type:'range',min:'100',max:'2000'}]);
 for(const anchor of ['mission','signals','simulations','pipeline','insar'])await expect(lab.locator('#'+anchor)).toHaveCount(1);
 await page.screenshot({path:'test-results/sar-consistent-dark.png'});await lab.getByRole('button',{name:'P-band',exact:true}).click();await expect(lab).toContainText('CANOPY INTERACTION: Very long wavelength');
 await lab.getByRole('button',{name:'Standing water · ON',exact:true}).click();await expect(lab.getByRole('button',{name:'Standing water · OFF',exact:true})).toBeVisible();
 const threshold=lab.locator('input[min="-25"]');await threshold.fill('-14.5');await expect(threshold).toHaveValue('-14.5');await lab.getByRole('button',{name:'SCAN CHANGE MAP',exact:true}).click();await expect(lab.getByRole('button',{name:'REPLAY MAP SCAN',exact:true})).toBeVisible();
});

test('SAR Lab theme and responsive styling preserve access to every input',async({page})=>{
 await page.goto('/sar-lab');await page.getByRole('button',{name:'Toggle Light/Dark Theme'}).click();await expect(page.locator('.sar-lab')).toHaveCSS('background-color','rgb(243, 246, 245)');await expect(page.locator('.sar-lab .glass-panel').first()).toHaveCSS('background-color','rgb(255, 255, 255)');await expect(page.locator('.sar-lab__nav a').first()).toHaveCSS('color','rgb(64, 91, 87)');await page.screenshot({path:'test-results/sar-consistent-light.png'});
 await page.setViewportSize({width:390,height:844});await expect(page.locator('.navbar__nav')).toHaveCSS('opacity','0');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);await page.screenshot({path:'test-results/sar-consistent-mobile.png'});
 for(const input of await page.locator('.sar-lab input').all()){await input.scrollIntoViewIfNeeded();await expect(input).toBeVisible();const box=await input.boundingBox();expect(box!.width).toBeGreaterThan(30);expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(391);}
});

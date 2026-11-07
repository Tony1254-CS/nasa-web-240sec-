import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const stages=['Detect','Investigate','Challenge','Explain','Field','Impact'];
async function open(page:Page,region:string){await page.goto('/observatory/'+region);await expect(page.getByRole('button',{name:'Live Analysis',exact:true})).toBeVisible();}
async function ready(page:Page){await expect(page.locator('.ew-processing')).toHaveCount(0,{timeout:45000});await expect(page.locator('.ew-error')).toHaveCount(0);}

for(const region of ['jamuna','sundarbans']){
 test(region+' has all six Evidence options and completes the guided review one stage at a time',async({page})=>{
  test.setTimeout(120000);const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await open(page,region);
  await page.getByRole('button',{name:'Evidence options'}).click();
  for(const label of stages)await expect(page.locator('.obs-evidence-options').getByRole('button',{name:new RegExp(label)})).toBeVisible();
  await page.getByRole('button',{name:'Live Analysis',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Live Analysis',exact:true});await expect(dialog).toBeVisible();
  for(let index=0;index<stages.length;index++){
   await ready(page);await expect(dialog.getByRole('tab',{name:new RegExp(stages[index])})).toHaveAttribute('aria-selected','true');
   if(index===0){await expect(page.getByRole('img',{name:'Histogram computed from actual VV pixels'})).toBeVisible();await expect(dialog.getByRole('tab',{name:/Impact/})).toBeDisabled();}
   if(index===2){await page.getByRole('slider',{name:'Evidence threshold test'}).fill('-18');await expect(page.locator('.ew-table tr.is-selected')).toContainText('-18 dB');}
   if(index===3)await expect(dialog).toContainText('SCREENING CANDIDATE');
   if(index===4)await expect(page.getByRole('textbox',{name:'Field observation note'})).toBeVisible();
   if(index===5){await expect(dialog).toContainText('2021 land-cover reference overlap');if(region==='sundarbans')await expect(dialog).toContainText('Mangroves');}
   await page.screenshot({path:'test-results/'+region+'-evidence-'+stages[index].toLowerCase()+'.png'});
   await dialog.getByRole('button',{name:index===5?'Complete Analysis':'Proceed to '+stages[index+1],exact:true}).click();
  }
  await expect(dialog).toContainText('Evidence review complete.');
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export evidence review',exact:true}).click();const download=await pending;const data=JSON.parse(await readFile((await download.path())!,'utf8'));
  expect(data.region_id).toBe(region);expect(Object.keys(data.stages)).toHaveLength(6);
  await page.getByRole('button',{name:'Return to map',exact:true}).click();await expect(dialog).toHaveCount(0);expect(errors).toEqual([]);
 });
}

test('Field saves a real authored record with photo and GPS locally, scoped by region and pair',async({page,context})=>{
 await context.grantPermissions(['geolocation']);await context.setGeolocation({longitude:89.7,latitude:21.875,accuracy:12});
 await open(page,'sundarbans');await page.getByRole('button',{name:'Evidence options'}).click();await page.locator('.obs-evidence-options').getByRole('button',{name:/^Field/}).click();await ready(page);
 await page.getByRole('textbox',{name:'Field observer'}).fill('Field reviewer');
 await page.getByLabel('Field observation time').fill('2026-11-06T10:30');
 await page.getByRole('textbox',{name:'Field observation note'}).fill('Photograph documents exposed sediment at the observed shoreline. Tide condition requires review.');
 await page.getByLabel('Field photograph').setInputFiles({name:'field-photo.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')});
 await page.getByRole('button',{name:'Capture GPS',exact:true}).click();await expect(page.getByText(/Device location captured/)).toBeVisible();
 await page.getByRole('button',{name:'Save field observation',exact:true}).click();await expect(page.locator('.ew-field-record')).toContainText('Field reviewer');
 await page.reload();await page.getByRole('button',{name:'Evidence options'}).click();await page.locator('.obs-evidence-options').getByRole('button',{name:/^Field/}).click();await ready(page);await expect(page.locator('.ew-field-record')).toHaveCount(1);
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export with photos'}).click();const data=JSON.parse(await readFile((await(await pending).path())!,'utf8'));
 expect(data.observations[0].region_id).toBe('sundarbans');expect(data.observations[0].photo_sha256).toHaveLength(64);expect(data.observations[0].photo_data_url).toContain('data:image/png;base64,');expect(data.observations[0].location.accuracy_m).toBe(12);expect(data.observations[0].review_state).toBe('awaiting-review');
 await page.getByRole('button',{name:'Close evidence workspace'}).click();await page.getByRole('combobox',{name:'Study region'}).selectOption('jamuna');await expect(page).toHaveURL(/observatory\/jamuna$/);await expect(page.locator('.map-pane-b')).toHaveAttribute('data-observation-url',/jamuna/);await page.getByRole('button',{name:'Evidence options'}).click();await page.locator('.obs-evidence-options').getByRole('button',{name:/^Field/}).click();await ready(page);await expect(page.locator('.ew-field-record')).toHaveCount(0);
});

test('mobile Evidence and Live Analysis remain visible and the review closes with Escape',async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page,'sundarbans');await expect(page.getByRole('button',{name:'Evidence options'})).toBeVisible();
 await page.getByRole('button',{name:'Live Analysis',exact:true}).click();await ready(page);await expect(page.getByRole('tab',{name:/Detect/})).toHaveAttribute('aria-selected','true');
 await page.screenshot({path:'test-results/evidence-mobile.png'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'Live Analysis',exact:true})).toHaveCount(0);
});

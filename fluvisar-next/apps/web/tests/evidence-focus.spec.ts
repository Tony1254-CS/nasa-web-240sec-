import {test,expect} from '@playwright/test';

for(const region of ['jamuna','sundarbans'])test(region+': all six stages are readable in laptop focus mode',async({page})=>{
 test.setTimeout(180000);
 await page.setViewportSize({width:1366,height:768});
 await page.goto('/observatory/'+region);
 await page.getByRole('button',{name:'Live Analysis',exact:true}).click();
 const report=page.locator('.evidence-workbench'),body=page.locator('.ew-body');
 await expect(report).toHaveClass(/is-focus/);
 const map=page.locator('.restored-map-workspace');
 const originalCanvas=await map.locator('canvas').first().elementHandle();
 expect((await map.boundingBox())!.width).toBeGreaterThanOrEqual(280);
 expect((await report.boundingBox())!.x).toBeCloseTo((await map.boundingBox())!.width,0);
 await expect(page.getByRole('complementary',{name:'Live map context'})).toBeVisible();
 await page.getByRole('button',{name:'Hide small map'}).click();
 expect((await report.boundingBox())!.x).toBe(0);
 await page.getByRole('button',{name:'Show small map'}).click();
 expect(await originalCanvas!.evaluate(el=>el.isConnected)).toBe(true);
 const stages=['Detect','Investigate','Challenge','Explain','Field','Impact'];
 for(let i=0;i<stages.length;i++){
  await expect(page.getByRole('tab',{name:new RegExp(stages[i]+'$')})).toHaveAttribute('aria-selected','true');
  await expect(page.locator('.ew-processing')).toHaveCount(0,{timeout:60000});
  await expect(page.locator('.ew-error')).toHaveCount(0);
  const frame=(await report.boundingBox())!,content=(await body.boundingBox())!,footer=(await page.locator('.ew-footer').boundingBox())!;
  expect(frame.y).toBe(0);expect(frame.height).toBe(768);expect(content.height).toBeGreaterThan(450);
  expect(content.y+content.height).toBeLessThanOrEqual(footer.y+1);
  expect(await body.evaluate(el=>el.scrollHeight-el.clientHeight),stages[i]+' should fit without scrolling').toBeLessThanOrEqual(1);
  if(i===0){await page.getByRole('button',{name:'Comfortable reading view'}).click();await expect(report).toHaveClass(/is-reading-view/);await page.getByRole('button',{name:'Fit step to screen'}).click();await expect(report).not.toHaveClass(/is-reading-view/);}
  if(i===3){await page.locator('.ew-extra-details>summary').click();await expect(page.locator('.ew-lineage')).toHaveCount(2);await page.keyboard.press('Escape');await expect(page.locator('.ew-extra-details')).not.toHaveAttribute('open');await expect(report).toBeVisible();}
  await body.evaluate(el=>el.scrollTop=el.scrollHeight);
  expect(await body.evaluate(el=>el.scrollTop+el.clientHeight>=el.scrollHeight-2)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'View map alongside analysis'}).click();
  await expect(report).not.toHaveClass(/is-focus/);
  await page.getByRole('button',{name:'Expand analysis'}).click();
  await expect(page.getByRole('tab',{name:new RegExp(stages[i]+'$')})).toHaveAttribute('aria-selected','true');
  await expect(page.getByRole('button',{name:i===5?'Complete Analysis':'Proceed to '+stages[i+1],exact:true})).toBeEnabled();
  if(i===4)await page.screenshot({path:'test-results/focus-'+region+'-field-laptop.png'});
  await page.getByRole('button',{name:i===5?'Complete Analysis':'Proceed to '+stages[i+1],exact:true}).click();
 }
 await expect(page.getByRole('heading',{name:'Evidence review complete.'})).toBeVisible();
 await page.getByRole('button',{name:'Return to map',exact:true}).click();
 await expect(report).toHaveCount(0);
 await expect(page.getByRole('complementary',{name:'Observatory features'})).toBeVisible();
});

test('focus mode preserves readable phone/light and laptop layouts; fullscreen is optional',async({page})=>{
 test.setTimeout(90000);await page.goto('/observatory/jamuna');
 await page.getByRole('button',{name:'Live Analysis',exact:true}).click();
 await expect(page.locator('.ew-processing')).toHaveCount(0,{timeout:60000});
 for(const size of [{width:1536,height:864},{width:390,height:844}]){
  await page.setViewportSize(size);
  await page.locator('.legacy-pages').evaluate(el=>el.setAttribute('data-theme','light'));
  await expect(page.getByRole('tablist',{name:'Evidence stages'}).getByRole('tab')).toHaveCount(6);
  await expect(page.getByRole('button',{name:'Proceed to Investigate',exact:true})).toBeInViewport();
  expect((await page.locator('.ew-body').boundingBox())!.height).toBeGreaterThan(450);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/focus-light-'+size.width+'.png'});
 }
 await page.evaluate(()=>Object.defineProperty(document.documentElement,'requestFullscreen',{configurable:true,value:()=>Promise.reject(new Error('Unavailable'))}));
 await page.getByRole('button',{name:'Presentation mode',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('Focus mode is still active');
 await expect(page.locator('.evidence-workbench')).toHaveClass(/is-focus/);
});


test('desktop recording viewport uses larger readable cards while every step still fits',async({page})=>{
 test.setTimeout(120000);await page.setViewportSize({width:1920,height:944});
 await page.goto('/observatory/jamuna');await page.getByRole('button',{name:'Live Analysis',exact:true}).click();
 const steps=['Detect','Investigate','Challenge','Explain','Field','Impact'];
 for(let i=0;i<steps.length;i++){
  await expect(page.locator('.ew-processing')).toHaveCount(0,{timeout:60000});
  expect(await page.locator('.ew-body').evaluate(el=>el.scrollHeight-el.clientHeight),steps[i]).toBeLessThanOrEqual(1);
  if(i===5){
   expect(await page.locator('.ew-impact-grid dt').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(15);
   const cards=(await page.locator('.ew-impact-grid').boundingBox())!,body=(await page.locator('.ew-body').boundingBox())!;
   expect(cards.height).toBeGreaterThan(body.height*.44);
   await page.screenshot({path:'test-results/adaptive-impact-desktop.png'});
  }else await page.getByRole('button',{name:'Proceed to '+steps[i+1],exact:true}).click();
 }
});

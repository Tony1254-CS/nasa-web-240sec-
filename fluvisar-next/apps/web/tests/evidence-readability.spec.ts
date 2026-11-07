import {test,expect} from '@playwright/test';

test('analysis uses adjacent map/report panes and readable results before optional logs',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});await page.goto('/observatory/jamuna');
 await page.getByRole('button',{name:'Live Analysis',exact:true}).click();
 await expect(page.locator('.ew-processing')).toHaveCount(0,{timeout:45000});
 const report=(await page.locator('.evidence-workbench').boundingBox())!,map=(await page.locator('.restored-map-workspace').boundingBox())!;
 expect(report.width).toBeGreaterThanOrEqual(900);expect(map.x+map.width).toBeLessThanOrEqual(report.x+1);
 expect(await page.locator('.ew-description').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(14);
 expect(await page.locator('.ew-metric strong').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(34);
 await expect(page.locator('.ew-audit-details')).not.toHaveAttribute('open');
 const results=(await page.locator('.ew-detect-report').boundingBox())!,audit=(await page.locator('.ew-audit-details').boundingBox())!;expect(results.y).toBeLessThan(audit.y);
 await page.getByRole('button',{name:'Close evidence workspace'}).click();await expect(page.getByRole('complementary',{name:'Observatory features'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

test('mobile stage names and body text remain readable without page overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/observatory/sundarbans');
 await page.getByRole('button',{name:'Live Analysis',exact:true}).click();await expect(page.locator('.ew-processing')).toHaveCount(0,{timeout:45000});
 const tabs=page.getByRole('tablist',{name:'Evidence stages'});await expect(tabs.getByRole('tab')).toHaveCount(6);
 for(const tab of await tabs.getByRole('tab').all())expect(await tab.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(13);
 expect(await page.locator('.ew-description').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(14);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

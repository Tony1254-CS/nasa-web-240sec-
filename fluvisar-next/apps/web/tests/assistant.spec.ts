import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const catalog=JSON.parse(await readFile(new URL('../public/observations/index.json',import.meta.url),'utf8'));

test('region fly-in is skippable, repeatable and ends with aligned comparison cameras',async({page})=>{
 await page.goto('/observatory/jamuna');
 await expect(page.locator('.radar-map-canvas')).toHaveAttribute('data-map-loaded','true');
 await page.getByRole('button',{name:'Skip intro',exact:true}).click();
 await expect(page.locator('.restored-map-workspace')).toHaveAttribute('data-flyin-active','false');
 const positions=await page.locator('.restored-map-pane').evaluateAll(nodes=>nodes.map(n=>JSON.parse((n as HTMLElement).dataset.camera!)));
 expect(positions[0].center).toEqual(positions[1].center);expect(positions[0].zoom).toEqual(positions[1].zoom);
 const [w,s,e,n]=catalog.regions.jamuna.bbox;expect(positions[0].center[0]).toBeGreaterThan(w);expect(positions[0].center[0]).toBeLessThan(e);expect(positions[0].center[1]).toBeGreaterThan(s);expect(positions[0].center[1]).toBeLessThan(n);
 await page.getByRole('button',{name:'Replay fly-in',exact:true}).click();
 await expect(page.locator('.restored-map-workspace')).toHaveAttribute('data-flyin-active','true');
 await expect(page.getByRole('button',{name:'Replay fly-in',exact:true})).toBeVisible();
 await page.getByRole('combobox',{name:'Study region'}).selectOption('sundarbans');
 await expect(page.getByRole('button',{name:'Skip intro',exact:true})).toBeVisible();await page.getByRole('button',{name:'Skip intro',exact:true}).click();
});

test('assistant uses real run values, sources, history, exports and map handoff',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/intelligence');await page.getByRole('button',{name:'Ask FluviSAR',exact:true}).click();
 await page.getByRole('button',{name:'What changed?',exact:true}).click();
 await expect(page.locator('.fl-message.is-assistant')).toContainText(catalog.regions.jamuna.metrics.land_to_water_ha.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}));
 await page.locator('.fl-message summary').click();await expect(page.locator('.fl-message details a')).toHaveCount(3);
 await page.getByRole('button',{name:'Where is the largest candidate?',exact:true}).click();
 await expect(page.getByRole('button',{name:'Show on map',exact:true})).toBeVisible();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export assistant conversation'}).click();const saved=JSON.parse(await readFile((await(await download).path())!,'utf8'));expect(saved.messages.filter((m:{role:string})=>m.role==='assistant')).toHaveLength(2);
 await page.getByRole('button',{name:'Show on map',exact:true}).click();await expect(page).toHaveURL(/observatory\/jamuna\?t0=.*finding=/);
 await page.getByRole('button',{name:'Ask FluviSAR',exact:true}).click();await expect(page.locator('.fl-scope')).toContainText('SELECTED FINDING');
 await page.getByLabel('Ask about this evidence').fill('এই জায়গায় কী পরিবর্তন হয়েছে?');await page.getByRole('button',{name:'Send question'}).click();await expect(page.locator('.fl-message.is-assistant').last()).toContainText('নিশ্চয়তা নয়');
 expect(errors).toEqual([]);
});

test('chat with data opens scoped discussion without resizing cards; mobile and light theme fit',async({page})=>{
 await page.goto('/intelligence');const card=page.locator('.iw-real-stats>article').first();const before=await card.boundingBox();
 await card.getByRole('button',{name:/Chat with Data:/}).click();
 await expect(page.getByRole('dialog',{name:'FluviSAR Assistant'})).toHaveCount(0);await expect(page.locator('.fl-inspection-guide')).toBeVisible();await expect(card).toHaveAttribute('data-chat-target','true');expect(await page.locator('[data-chat-target]').count()).toBeGreaterThanOrEqual(4);
 await page.screenshot({path:'test-results/data-chat-highlight.png'});await card.click();await expect(page.locator('[data-chat-target]')).toHaveCount(0);
 await expect(page.getByRole('dialog',{name:'FluviSAR Assistant'})).toBeVisible();await expect(page.locator('.fl-subject-chip')).toContainText(/Land.*water/);
 await expect(page.locator('.fl-message.is-assistant')).toContainText('land → water');
 expect(await card.boundingBox()).toEqual(before);
 await page.getByRole('button',{name:'Close assistant'}).click();await page.getByRole('combobox',{name:'Investigation region'}).selectOption('sundarbans');
 await card.getByRole('button',{name:/Chat with Data:/}).click();await expect(card).toHaveAttribute('data-chat-target','true');await page.keyboard.press('Escape');await expect(page.locator('[data-chat-target]')).toHaveCount(0);await expect(page.getByRole('dialog',{name:'FluviSAR Assistant'})).toHaveCount(0);
 await page.getByRole('button',{name:'Ask FluviSAR',exact:true}).click();await expect(page.locator('.fl-scope')).toContainText('Sundarbans');await expect(page.locator('.fl-message')).toHaveCount(0);
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{document.querySelector('.legacy-pages')?.setAttribute('data-theme','light');});
 const box=await page.getByRole('dialog',{name:'FluviSAR Assistant'}).boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(390);expect(box!.y+box!.height).toBeLessThanOrEqual(844);
 await page.screenshot({path:'test-results/assistant-mobile.png'});
 await page.getByRole('button',{name:'What changed?',exact:true}).click();await expect(page.locator('.fl-message.is-assistant')).toContainText('land → water');
});

test('report Chat with Data highlights its boxes before opening a scoped conversation',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/observatory/sundarbans');await page.getByRole('button',{name:'Evidence options'}).click();await page.getByRole('button',{name:/^Detect/}).click();
 const report=page.getByRole('dialog',{name:'Evidence workspace'});await expect(report.locator('.ew-metric').first()).toBeVisible();await report.getByRole('button',{name:'Chat with Data',exact:true}).click();
 await expect(page.getByRole('dialog',{name:'FluviSAR Assistant'})).toHaveCount(0);await expect(report.locator('[data-chat-target]').first()).toBeVisible();expect(await page.locator('[data-chat-target]').evaluateAll(nodes=>nodes.every(n=>n.closest('.evidence-workbench')))).toBe(true);
 await report.locator('[data-chat-target]').first().focus();await page.keyboard.press('Enter');await expect(page.getByRole('dialog',{name:'FluviSAR Assistant'})).toBeVisible();await expect(page.locator('.fl-scope')).toContainText('Sundarbans');await expect(page.locator('[data-chat-target]')).toHaveCount(0);
});

test('landing light mode has a light radar scrim and readable text; dark mode retains its contrast',async({page})=>{
 await page.goto('/');const background=await page.locator('.hero-radar').evaluate(el=>getComputedStyle(el).backgroundImage);const darkScrim=await page.locator('.hero-scrim').evaluate(el=>getComputedStyle(el).backgroundImage);
 await page.getByRole('button',{name:'Toggle Light/Dark Theme'}).click();await expect(page.locator('.navbar')).toHaveCSS('background-color','rgb(255, 255, 255)');await expect(page.locator('.headline-gradient')).toHaveCSS('-webkit-text-fill-color','rgb(16, 42, 67)');await expect(page.locator('.subheadline')).toHaveCSS('color','rgb(51, 65, 85)');await expect(page.locator('.hero-scrim')).toHaveCSS('background-image',/248, 250, 252/);
 expect(await page.locator('.hero-radar').evaluate(el=>getComputedStyle(el).backgroundImage)).toBe(background);await page.screenshot({path:'test-results/landing-light-fixed.png'});
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);await page.screenshot({path:'test-results/landing-light-mobile.png'});
 await page.getByRole('button',{name:'Toggle Light/Dark Theme'}).click();await expect(page.locator('.navbar')).toHaveCSS('background-color','rgb(17, 26, 32)');expect(await page.locator('.hero-scrim').evaluate(el=>getComputedStyle(el).backgroundImage)).toBe(darkScrim);
});

test('reduced motion bypasses animation and connection errors allow retry',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/observatory/sundarbans');await expect(page.getByRole('button',{name:'Replay fly-in',exact:true})).toBeVisible();await expect(page.locator('.restored-map-workspace')).toHaveAttribute('data-flyin-active','false');
 await page.getByRole('button',{name:'Ask FluviSAR',exact:true}).click();
 await page.route('**/api/assistant/ask',route=>route.fulfill({status:503,body:'{}'}));await page.getByRole('button',{name:'What changed?',exact:true}).click();await expect(page.locator('.fl-error')).toBeVisible();await expect(page.getByLabel('Ask about this evidence')).toHaveValue('What changed?');
 await page.unroute('**/api/assistant/ask');await page.getByRole('button',{name:'Send question'}).click();await expect(page.locator('.fl-message.is-assistant')).toBeVisible();
});

test('Atlas theme applies to cards and controls; assistant is centred and data actions stay local',async({page})=>{
 await page.goto('/atlas');await expect(page.locator('.atlas-cards>article')).toHaveCount(2);
 await expect(page.locator('.fl-launcher')).toHaveCount(0);await expect(page.getByRole('button',{name:/Chat with Data/})).toHaveCount(0);
 const card=page.locator('.atlas-cards>article').first();
 await expect(card).toHaveCSS('background-color','rgb(21, 30, 35)');
 await expect(page.locator('.restored-workspace-header')).toHaveCSS('background-color','rgb(21, 30, 35)');await expect(page.locator('.navbar')).toHaveCSS('background-color','rgb(17, 26, 32)');
 const hero=await page.locator('.atlas-panel .science-hero').boundingBox(),tools=await page.locator('.restored-map-options').boundingBox();expect(tools!.y+tools!.height).toBeLessThanOrEqual(hero!.y);
 await page.screenshot({path:'test-results/atlas-dark.png'});
 await page.getByRole('button',{name:'Toggle Light/Dark Theme'}).click();await expect(card).toHaveCSS('background-color','rgb(255, 255, 255)');await expect(page.locator('.restored-workspace-header')).toHaveCSS('background-color','rgb(255, 255, 255)');await expect(page.locator('.navbar')).toHaveCSS('background-color','rgb(255, 255, 255)');
 await page.screenshot({path:'test-results/atlas-light.png'});
 await page.getByRole('button',{name:'Ask FluviSAR',exact:true}).click();const dialog=page.getByRole('dialog',{name:'FluviSAR Assistant'});await expect(dialog).toHaveAttribute('aria-modal','true');
 const box=await dialog.boundingBox();expect(Math.abs(box!.x+box!.width/2-720)).toBeLessThan(2);expect(Math.abs(box!.y+box!.height/2-500)).toBeLessThan(2);
 await page.screenshot({path:'test-results/assistant-centred.png'});await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(page.getByRole('button',{name:'Ask FluviSAR',exact:true})).toBeFocused();
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Toggle Light/Dark Theme'}).click();await expect(card).toHaveCSS('background-color','rgb(21, 30, 35)');
 const menu=page.getByRole('button',{name:'Toggle navigation'});await expect(menu).toBeVisible();const menuBox=await menu.boundingBox();expect(menuBox!.x+menuBox!.width).toBeLessThanOrEqual(390);await menu.click();await expect(page.locator('.navbar__nav')).toHaveClass(/navbar__nav--open/);await menu.click();
 await expect(page.locator('.navbar')).toHaveCSS('background-color','rgb(17, 26, 32)');const mobileHero=await page.locator('.atlas-panel .science-hero').boundingBox(),heading=await page.getByRole('heading',{level:1}).boundingBox();expect(heading!.y+heading!.height).toBeLessThan(mobileHero!.y+mobileHero!.height);
 expect(await page.locator('.atlas-panel').evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);await page.screenshot({path:'test-results/atlas-mobile.png'});
});

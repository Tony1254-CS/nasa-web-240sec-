import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const catalog=JSON.parse(await readFile(new URL('../public/observations/index.json',import.meta.url),'utf8'));
const tabNames=['Real observations','Model playground','Robustness & review','Model evaluation'];

test('real observations are the default; both regions retain six acquisitions and accurate metadata',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/intelligence');
 await expect(page.getByRole('tab',{name:/Real observations/})).toHaveAttribute('aria-selected','true');
 for(const region of ['jamuna','sundarbans']){
  await page.getByRole('combobox',{name:'Investigation region'}).selectOption(region);const data=catalog.regions[region];
  await expect(page.getByTestId('intelligence-land-water')).toContainText(data.metrics.land_to_water_ha.toLocaleString('en-US',{maximumFractionDigits:1}));
  await expect(page.locator('.iw-real-stats')).toContainText(data.observations[0].orbit_direction);
  await expect(page.locator('.iw-real-visual .id-date-track>button')).toHaveCount(6);
  await expect(page.locator('.impact-map')).toHaveAttribute('data-map-ready','true');
  await page.getByRole('slider',{name:'Intelligence radar comparison slider'}).fill('24');
  await expect(page.locator('.impact-map-curtain')).toHaveCSS('clip-path','inset(0px 76% 0px 0px)');
  await page.getByRole('combobox',{name:'Observation polarization'}).selectOption('vh');
  await page.getByRole('tab',{name:'Signals',exact:true}).click();
  await expect(page.locator('.iw-inspector-content')).toContainText(data.observations[1].mean_vh_db.toFixed(2));
  await expect(page.locator('.iw-inspector-content>.id-table-wrap tbody tr')).toHaveCount(6);
  expect(await page.locator('#iw-panel-real').innerText()).not.toContain('HH quicklooks');
 }
 expect(errors).toEqual([]);
});

test('non-default pair evidence, source IDs, export and handoff stay in agreement',async({page})=>{
 await page.goto('/intelligence');const data=catalog.regions.jamuna;
 const before=[...data.observations].sort((a,b)=>a.date.localeCompare(b.date))[0].date;
 const pair=JSON.parse(await readFile(new URL('../public'+data.pair_bundles[before+'_'+data.pair[1]],import.meta.url),'utf8'));
 await page.getByRole('combobox',{name:'Intelligence comparison before date'}).selectOption(before);
 await expect(page.getByTestId('intelligence-land-water')).toContainText(pair.metrics.land_to_water_ha.toLocaleString('en-US',{maximumFractionDigits:1}));
 await page.locator('.iw-candidate-list>button').first().click();const finding=await page.locator('.id-selected-card>code').innerText();
 const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Export selected evidence',exact:true}).click();const result=JSON.parse(await readFile((await(await downloaded).path())!,'utf8'));
 expect(result.run_id).toBe(pair.run_id);expect(result.pair).toEqual(pair.pair);expect(result.observations.map((o:{date:string})=>o.date)).toEqual(pair.pair);expect(result.finding.properties.id).toBe(finding);expect(result.metrics).toEqual(pair.metrics);
 await page.getByRole('link',{name:/Review in Decision Desk/}).click();await expect(page.locator('.id-selected-card')).toContainText(finding);await expect(page.getByRole('combobox',{name:'Comparison before date'})).toHaveValue(before);
 await page.goto('/intelligence');await page.getByRole('combobox',{name:'Intelligence comparison before date'}).selectOption(before);await expect(page.getByTestId('intelligence-land-water')).toContainText(pair.metrics.land_to_water_ha.toLocaleString('en-US',{maximumFractionDigits:1}));await page.locator('.iw-candidate-list>button').first().click();
 await page.getByRole('link',{name:/Open in Observatory/}).click();await expect(page).toHaveURL(/observatory\/jamuna\?t0=/);await expect(page.locator('.radar-map-canvas')).toHaveAttribute('data-map-loaded','true');
 await page.getByRole('button',{name:'📡 Radar',exact:true}).click();
 await expect(page.getByRole('button',{name:/Comparison Pair:/})).toContainText(before);
 await expect(page.locator('.obs-stats')).toContainText(pair.metrics.land_to_water_ha.toLocaleString('en-US',{maximumFractionDigits:2}));
});

test('RF and MLP outputs share the selected scenario and saved experiments restore diagnostic settings',async({page})=>{
 await page.goto('/intelligence?view=playground');
 await page.getByRole('button',{name:'Flood pulse',exact:true}).click();
 await expect(page.getByRole('slider',{name:'Event HH backscatter',exact:true})).toHaveValue('-17.4');
 await page.getByRole('slider',{name:'Stage-difference index',exact:true}).fill('.35');
 await page.getByRole('tab',{name:/Robustness & review/}).click();
 await page.getByRole('slider',{name:'Effective looks for Gamma speckle simulation',exact:true}).fill('6');
 await page.getByRole('slider',{name:'Simulated event duration',exact:true}).fill('5');
 await page.getByRole('tab',{name:/Model playground/}).click();
 await page.getByRole('textbox',{name:'Experiment name'}).fill('Shared scenario 6 looks');await page.getByRole('button',{name:'Save locally',exact:true}).click();
 await page.getByRole('button',{name:'Compare with original',exact:true}).click();
 await expect(page.locator('.iw-original-result')).toHaveCount(2);
 const download=page.waitForEvent('download');await page.locator('#iw-panel-playground').getByRole('button',{name:'Export experiment',exact:true}).click();const exported=JSON.parse(await readFile((await(await download).path())!,'utf8'));
 expect(exported.data_origin).toBe('generated teaching scenarios');expect(exported.experiment.features).toEqual([-9.8,-17.4,.35,.14]);expect(exported.experiment.diagnostics.speckleLooks).toBe(6);expect(exported.experiment.diagnostics.duration).toBe(5);expect(exported.outputs.map((o:{name:string})=>o.name)).toEqual(['Random Forest','Temporal MLP']);expect(exported.seeds.samples).toBe(2609);
 for(const output of exported.outputs){expect(Object.values(output.scores).reduce((sum:number,n:number)=>sum+n,0)).toBeCloseTo(1,8);}
 await page.locator('#iw-panel-playground').getByRole('button',{name:'Reset',exact:true}).click();
 await page.getByRole('combobox',{name:'Saved experiments'}).selectOption({label:'Shared scenario 6 looks'});await expect(page.getByRole('slider',{name:'Stage-difference index',exact:true})).toHaveValue('0.35');
 await page.getByRole('tab',{name:/Robustness & review/}).click();await expect(page.getByRole('slider',{name:'Effective looks for Gamma speckle simulation'})).toHaveValue('6');await expect(page.getByRole('slider',{name:'Simulated event duration'})).toHaveValue('5');
 await page.reload();await page.getByRole('tab',{name:/Model playground/}).click();await page.getByRole('combobox',{name:'Saved experiments'}).selectOption({label:'Shared scenario 6 looks'});await expect(page.getByRole('slider',{name:'Event HH backscatter',exact:true})).toHaveValue('-17.4');
});

test('every original scientific diagnostic remains interactive and the walkthrough advances in order',async({page})=>{
 await page.goto('/intelligence');await page.getByRole('button',{name:'Guided walkthrough',exact:true}).click();
 const guide=page.getByRole('complementary',{name:'Intelligence guided walkthrough'});
 for(let step=1;step<=5;step++){await expect(guide).toContainText(`Step ${step} of 5`);await guide.getByRole('button',{name:step===5?'Finish':'Next',exact:true}).click();}
 await expect(guide).toHaveCount(0);
 for(const name of ['Class stability under speckle noise','Temporal onset detection','Is this input inside the model’s scenario domain?','Spatial filtering & reference patches','Coverage–error trade-off'])await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
 await page.getByRole('tab',{name:/Model evaluation/}).click();await expect(page.getByRole('heading',{name:'Temporal MLP training',exact:true})).toBeVisible();
 await page.getByRole('slider',{name:'Training epoch to inspect'}).fill('50');await expect(page.locator('.ml-epoch-inspector')).toContainText('50');
 await page.getByRole('button',{name:'Stable land classified as Stable land: 24 of 27',exact:true}).click();await expect(page.locator('.ml-cell-inspector').first()).toContainText('24 of 27');
 await page.getByRole('button',{name:/Pre-event HH backscatter.*pp/}).click();await expect(page.locator('.ml-importance-row[aria-pressed=true]')).toHaveCount(1);
 await page.getByRole('tab',{name:'Random Forest',exact:true}).click();await expect(page.getByRole('heading',{name:'Random Forest training',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'What produced these outputs?',exact:true})).toBeVisible();
});

test('diagnostic panels share container edges and equal columns at desktop widths',async({page})=>{
 await page.goto('/intelligence?view=evaluation');await expect(page.locator('.ml-training-panel')).toBeVisible();
 for(const width of [1920,1440]){await page.setViewportSize({width,height:1080});const rows=await page.locator('.iw-evaluation-summary,.ml-training-panel,.ml-scenario-diagnostics,.iw-model-card').evaluateAll(nodes=>nodes.map(node=>({x:node.getBoundingClientRect().x,width:node.getBoundingClientRect().width})));for(const row of rows){expect(Math.abs(row.x-rows[0].x)).toBeLessThan(1);expect(Math.abs(row.width-rows[0].width)).toBeLessThan(1);}const cards=await page.locator('.ml-scenario-diagnostics>.ml-panel').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().width));expect(Math.abs(cards[0]-cards[1])).toBeLessThan(1);}
 await page.locator('.ml-scenario-diagnostics').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/intelligence-consistent-evaluation.png'});
});

test('all four workspaces stay readable in light theme on mobile without overflow',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:390,height:844});await page.goto('/intelligence');await page.getByRole('button',{name:'Toggle Light/Dark Theme'}).click();await expect(page.locator('.legacy-pages')).toHaveAttribute('data-theme','light');
 for(const name of tabNames){await page.getByRole('tab',{name:new RegExp(name.replace('&','&'))}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);await page.screenshot({path:'test-results/intelligence-mobile-'+name.split(' ')[0]+'.png'});}
 expect(errors).toEqual([]);
});

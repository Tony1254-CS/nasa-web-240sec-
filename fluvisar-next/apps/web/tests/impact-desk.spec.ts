import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const catalog=JSON.parse(await readFile(new URL('../public/observations/index.json',import.meta.url),'utf8'));

test('both regional desks keep observations, aligned comparison and source-linked exports',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/impact');
 for(const region of ['jamuna','sundarbans']){
  await page.getByRole('combobox',{name:'Investigation region'}).selectOption(region);
  const source=catalog.regions[region];
  await expect(page.getByTestId('impact-land-water')).toContainText(source.metrics.land_to_water_ha.toLocaleString('en-US',{maximumFractionDigits:1}));
  await expect(page.locator('.id-date-track>button')).toHaveCount(6);
  await expect(page.locator('.id-runbar')).toContainText(source.observations[0].orbit_direction);
  await expect(page.locator('.impact-map')).toHaveAttribute('data-map-ready','true');
  await page.getByRole('button',{name:'Compare dates',exact:true}).click();
  const slider=page.getByRole('slider',{name:'Before after comparison slider'});await slider.fill('28');
  await expect(page.locator('.impact-map-curtain')).toHaveCSS('clip-path','inset(0px 72% 0px 0px)');
  const sizes=await page.locator('.impact-map-canvas').evaluateAll(nodes=>nodes.map(node=>[node.clientWidth,node.clientHeight]));expect(sizes[0]).toEqual(sizes[1]);
  await page.locator('.id-candidate').first().click();
  await expect(page.getByRole('combobox',{name:'Review status',exact:true})).toBeVisible();
  await page.getByRole('combobox',{name:'Review status',exact:true}).selectOption('Field review queued');
  const candidate=await page.locator('.id-selected-card>code').innerText();
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export case',exact:true}).click();
  const downloaded=await downloadPromise;const packet=JSON.parse(await readFile((await downloaded.path())!,'utf8'));
  expect(packet.case.run_id).toBe(source.run_id);expect(packet.case.pair).toEqual(source.pair);expect(packet.case.candidate.properties.id).toBe(candidate);
  expect(packet.case.metrics).toEqual(source.metrics);expect(packet.case.source_granules.map((o:{date:string})=>o.date)).toEqual(source.pair);
  await page.getByRole('button',{name:'Decision brief',exact:true}).click();await expect(page.getByRole('dialog')).toContainText(source.run_id);await expect(page.getByRole('dialog')).toContainText(candidate);await page.keyboard.press('Escape');
  await page.screenshot({path:`test-results/impact-${region}-selected.png`});
 }
 expect(errors).toEqual([]);
});

test('changing the analysis pair updates metrics, context, provenance and brief together',async({page})=>{
 await page.goto('/impact');const source=catalog.regions.jamuna;
 const before=[...source.observations].sort((a,b)=>a.date.localeCompare(b.date))[0].date;
 const key=before+'_'+source.pair[1];const pair=JSON.parse(await readFile(new URL('../public'+source.pair_bundles[key],import.meta.url),'utf8'));
 await page.getByRole('combobox',{name:'Comparison before date'}).selectOption(before);
 await expect(page.getByTestId('impact-land-water')).toContainText(pair.metrics.land_to_water_ha.toLocaleString('en-US',{maximumFractionDigits:1}));
 await expect(page.locator('.id-shell')).toHaveAttribute('aria-busy','false');
 await page.getByRole('tab',{name:'Evidence & context',exact:true}).click();
 await expect(page.locator('.id-inspector-body')).toContainText('Rainfall around the comparison',{timeout:60000});
 await expect(page.locator('.id-inspector-body')).toContainText('GCOV records');
 await page.getByRole('button',{name:'Decision brief',exact:true}).click();await expect(page.getByRole('dialog')).toContainText(pair.run_id);
 const downloadPromise=page.waitForEvent('download');await page.keyboard.press('Escape');await page.getByRole('button',{name:'Export case',exact:true}).click();const packet=JSON.parse(await readFile((await(await downloadPromise).path())!,'utf8'));expect(packet.case.pair).toEqual(pair.pair);expect(packet.case.metrics).toEqual(pair.metrics);expect(packet.case.source_granules).toHaveLength(2);
});

test('real exposure is discoverable, priorities have explicit reasons and scenarios stay hypothetical',async({page})=>{
 await page.goto('/impact');
 await page.getByRole('tab',{name:'Assets & land use',exact:true}).click();
 await expect(page.locator('.id-exposure')).toContainText('Computed overlap',{timeout:60000});
 await expect(page.locator('.id-exposure-grid')).toContainText('393.8');
 await page.getByRole('tab',{name:/Review changes/}).click();await page.getByRole('combobox',{name:'Review queue ordering'}).selectOption('exposure');
 await page.locator('.id-candidate').first().click();await expect(page.locator('.id-selected-card')).toBeVisible();
 await page.getByRole('tab',{name:'What-if scenario'}).click();await expect(page.locator('.id-inspector-body')).toContainText('not a measured retreat or forecast');
 await page.getByRole('slider',{name:'Along-bank length',exact:true}).fill('1000');await page.getByRole('slider',{name:'Hypothetical retreat depth',exact:true}).fill('200');await expect(page.locator('.id-scenario-area')).toContainText('20');
 await page.route('https://overpass-api.de/api/interpreter',route=>route.fulfill({json:{elements:[]}}));
 await page.getByRole('button',{name:'Load corridor assets',exact:true}).click();
 await expect(page.getByRole('button',{name:'Refresh live OSM',exact:true})).toBeVisible();
 await page.getByRole('slider',{name:'Corridor orientation',exact:true}).fill('90');
 await expect(page.getByRole('button',{name:'Load corridor assets',exact:true})).toBeVisible();
 await expect(page.locator('.id-inspector-body .id-rain-summary')).toHaveCount(0);
});

test('deep links reopen a selected non-default pair in the correct region',async({page})=>{
 const source=catalog.regions.sundarbans,key=Object.keys(source.pair_bundles)[0];const pair=JSON.parse(await readFile(new URL('../public'+source.pair_bundles[key],import.meta.url),'utf8'));const id=pair.findings.features[0].properties.id;
 await page.goto('/impact?'+new URLSearchParams({region:'sundarbans',before:pair.pair[0],after:pair.pair[1],finding:id}));
 await expect(page.locator('.id-selected-card')).toContainText(id,{timeout:20000});await expect(page.getByTestId('impact-land-water')).toContainText(pair.metrics.land_to_water_ha.toLocaleString('en-US',{maximumFractionDigits:1}));
 await expect(page.getByRole('combobox',{name:'Investigation region'})).toHaveValue('sundarbans');
});

test('mobile and light theme preserve readable controls without horizontal overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/impact');
 await expect(page.locator('.id-header h1')).toBeVisible();
 await page.getByRole('button',{name:'Toggle Light/Dark Theme'}).click();
 await expect(page.locator('.legacy-pages')).toHaveAttribute('data-theme','light');
 const header=await page.locator('.id-header').boundingBox();expect(header!.y).toBeGreaterThan(56);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.locator('.id-candidate').first().click();await page.getByRole('tab',{name:'Field actions',exact:true}).click();await expect(page.getByRole('textbox',{name:'Field observer'})).toBeVisible();
 await page.screenshot({path:'test-results/impact-mobile-light.png',fullPage:true});
});

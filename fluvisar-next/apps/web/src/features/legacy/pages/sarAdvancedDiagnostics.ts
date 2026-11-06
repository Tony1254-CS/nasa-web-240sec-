import { DEMO_CLASSES, type DemoClass, type SarFeatures, type SarSample } from './sarForestDemo';
import { drawUnitMeanGamma as drawGamma } from './sarSpeckleDemo';

export type NoveltyResult = { nearest: DemoClass; distances: Record<DemoClass, number>; score: number; cutoff: number; isNovel: boolean };

function quantile(values:number[],q:number) {
  const ordered=[...values].sort((a,b)=>a-b);
  return ordered[Math.max(0,Math.min(ordered.length-1,Math.ceil(q*ordered.length)-1))]??0;
}

// Diagonal class-conditional Mahalanobis distance; covariance off-diagonals are omitted deliberately.
export function assessFeatureNovelty(train:SarSample[],reference:SarSample[],features:SarFeatures,q=.95):NoveltyResult {
  const stats=DEMO_CLASSES.map((label)=>{
    const group=train.filter((sample)=>sample.y===label),means=[0,1,2,3].map((j)=>group.reduce((sum,sample)=>sum+sample.x[j],0)/Math.max(1,group.length));
    const variances=[0,1,2,3].map((j)=>Math.max(.04,group.reduce((sum,sample)=>sum+(sample.x[j]-means[j])**2,0)/Math.max(1,group.length-1)));
    return {label,means,variances};
  });
  const distancesFor=(x:SarFeatures)=>Object.fromEntries(stats.map(({label,means,variances})=>[label,Math.sqrt(x.reduce((sum,value,j)=>sum+(value-means[j])**2/variances[j],0))])) as Record<DemoClass,number>;
  const referenceDistances=reference.map((sample)=>Math.min(...Object.values(distancesFor(sample.x))));
  const cutoff=quantile(referenceDistances,q),distances=distancesFor(features);
  const nearest=DEMO_CLASSES.reduce((best,label)=>distances[label]<distances[best]?label:best,DEMO_CLASSES[0]);
  const score=distances[nearest];
  return {nearest,distances,score,cutoff,isNovel:score>cutoff};
}

function seededRandom(seed:number) { let value=seed>>>0;return ()=>{value+=0x6D2B79F5;let next=value;next=Math.imul(next^(next>>>15),next|1);next^=next+Math.imul(next^(next>>>7),next|61);return ((next^(next>>>14))>>>0)/4294967296;}; }
export function simulateSarTimeSeries(features:SarFeatures,looks:number,onset:number,duration:number,seed:number) {
  const random=seededRandom(seed),pre=10**(features[0]/10),event=10**(features[1]/10),persistence=Math.max(0,Math.min(1,features[3]));
  const followup=pre*(1-persistence)+event*persistence,total=24;
  const series=Array.from({length:total},(_,i)=>{
    const epoch=i+1,mean=epoch<onset?pre:epoch<onset+duration?event:followup;
    return 10*Math.log10(mean*drawGamma(looks,random));
  });
  const baselineValues=series.slice(0,6),baseline=baselineValues.reduce((a,b)=>a+b,0)/baselineValues.length;
  const sigma=Math.max(.2,Math.sqrt(baselineValues.reduce((sum,x)=>sum+(x-baseline)**2,0)/(baselineValues.length-1)));
  const allowance=.5*sigma,threshold=5*sigma;let positive=0,negative=0,alarm:number|null=null;
  const cusum=series.map((value,index)=>{if(index<6)return 0;positive=Math.max(0,positive+value-baseline-allowance);negative=Math.min(0,negative+value-baseline+allowance);if(alarm===null&&(positive>threshold||negative< -threshold))alarm=index+1;return Math.max(positive,Math.abs(negative));});
  return {series,cusum,baseline,sigma,threshold,alarm,onset,duration,looks};
}


import { DEMO_CLASSES, type DemoClass, type DemoClassifier, type SarFeatures } from './sarForestDemo';

export type SpeckleStressResult = {
  classCounts: Record<DemoClass, number>;
  modalClass: DemoClass;
  modalShare: number;
  observedDeltaMeanDb: number;
  observedDeltaSdDb: number;
  deltaHistogram: number[];
  trialCount: number;
  looks: number;
};

function rngFrom(seed: number) {
  let state=seed>>>0;
  return ()=>{
    state+=0x6D2B79F5;
    let value=state;
    value=Math.imul(value^(value>>>15),value|1);
    value^=value+Math.imul(value^(value>>>7),value|61);
    return ((value^(value>>>14))>>>0)/4294967296;
  };
}

function normal(random:()=>number) {
  const u=Math.max(random(),1e-12),v=random();
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
}

// Unit-mean Gamma(L, 1/L) intensity speckle; valid for homogeneous targets.
export function drawUnitMeanGamma(looks:number,random:()=>number) {
  if(looks===1)return -Math.log(Math.max(random(),1e-12));
  const d=looks-1/3,c=1/Math.sqrt(9*d);
  for(;;){
    const x=normal(random),base=1+c*x;
    if(base<=0)continue;
    const v=base*base*base,u=random();
    if(u<1-.0331*x**4||Math.log(Math.max(u,1e-12))<.5*x*x+d*(1-v+Math.log(v)))return d*v/looks;
  }
}

export function simulateSpeckleStress(model:DemoClassifier,features:SarFeatures,looks:number,seed:number,trials=160):SpeckleStressResult {
  const random=rngFrom(seed),classCounts=Object.fromEntries(DEMO_CLASSES.map((label)=>[label,0])) as Record<DemoClass,number>;
  const deltas:number[]=[];
  const t0Power=10**(features[0]/10),t1Power=10**(features[1]/10);
  for(let index=0;index<trials;index+=1){
    const observedT0=10*Math.log10(t0Power*drawUnitMeanGamma(looks,random));
    const observedT1=10*Math.log10(t1Power*drawUnitMeanGamma(looks,random));
    deltas.push(observedT1-observedT0);
    const noisy:SarFeatures=[observedT0,observedT1,features[2],features[3]];
    const scores=model.predict(noisy);
    const label=DEMO_CLASSES.reduce((winner,current)=>scores[current]>scores[winner]?current:winner,DEMO_CLASSES[0]);
    classCounts[label]+=1;
  }
  const modalClass=DEMO_CLASSES.reduce((winner,current)=>classCounts[current]>classCounts[winner]?current:winner,DEMO_CLASSES[0]);
  const observedDeltaMeanDb=deltas.reduce((sum,value)=>sum+value,0)/trials;
  const observedDeltaSdDb=Math.sqrt(deltas.reduce((sum,value)=>sum+(value-observedDeltaMeanDb)**2,0)/Math.max(1,trials-1));
  const deltaHistogram=Array.from({length:20},()=>0);
  for(const value of deltas){const bin=Math.max(0,Math.min(deltaHistogram.length-1,Math.floor((value+30)/3)));deltaHistogram[bin]+=1;}
  return {classCounts,modalClass,modalShare:classCounts[modalClass]/trials,observedDeltaMeanDb,observedDeltaSdDb,deltaHistogram,trialCount:trials,looks};
}

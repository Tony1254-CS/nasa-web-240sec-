export interface ScenarioExposure {buildings:number;roadM:number;croplandHa:number}
export interface ValuationAssumptions {buildingBdt:number|null;roadBdtM:number|null;flowBdtHaDay:number|null;days:number;affectedShare:number}
/** Explicit conditional accounting. Exposure is not observed damage. */
export function valueExposure(exposure:ScenarioExposure,assumptions:ValuationAssumptions){
 const rates=[assumptions.buildingBdt,assumptions.roadBdtM,assumptions.flowBdtHaDay];
 if(rates.some(r=>r===null||!Number.isFinite(r)||r<0)||!Object.values(exposure).every(n=>Number.isFinite(n)&&n>=0)||!Number.isInteger(assumptions.days)||assumptions.days<1||assumptions.days>365||!Number.isFinite(assumptions.affectedShare)||assumptions.affectedShare<0||assumptions.affectedShare>1)return null;
 const share=assumptions.affectedShare,building=exposure.buildings*assumptions.buildingBdt!*share,road=exposure.roadM*assumptions.roadBdtM!*share,direct=building+road;
 const dailyFlow=exposure.croplandHa*assumptions.flowBdtHaDay!*share,flow=dailyFlow*assumptions.days;
 if(![building,road,direct,dailyFlow,flow,direct+flow].every(Number.isFinite))return null;
 const curve=[...new Set([0,Math.round(assumptions.days/4),Math.round(assumptions.days/2),Math.round(assumptions.days*3/4),assumptions.days])].sort((a,b)=>a-b).map(day=>({day,direct,flow:dailyFlow*day,total:direct+dailyFlow*day}));
 return {currency:'BDT',building,road,direct,dailyFlow,flow,total:direct+flow,curve,assumptions:{...assumptions},exposure:{...exposure},interpretation:'User-assumed valuation of mapped exposure; not measured damage, an official DaLA, or a hazard probability.'};
}

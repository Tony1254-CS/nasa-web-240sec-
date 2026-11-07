import { createSyntheticSamples, splitSyntheticSamples, trainSyntheticForest, type SarFeatures } from '../pages/sarForestDemo';
import { trainTemporalMlp } from '../pages/temporalMlpDemo';
import type { ScenePerturbation } from '../pages/Intelligence';

export const CLASS_COLORS={'Stable land':'#56c8d8','Open water':'#7588ff','Seasonal inundation':'#e7b45d','Persistent transition candidate':'#ef745c'};
export const MODEL_SEEDS={samples:2609,split:2031,forest:941,mlp:4021,per_class:180,trees:31};
export interface Experiment {features:SarFeatures;scene:ScenePerturbation;cutoff:number;matrixCutoff:number;mode:'neural'|'forest';diagnostics?:Record<string,number>}
export interface SavedExperiment {id:string;name:string;saved_at:string;experiment:Experiment}
export const ORIGINAL:Experiment={features:[-10,-17,.08,.9],scene:{eventDb:0,stageShift:0,persistenceShift:0},cutoff:.55,matrixCutoff:.55,mode:'neural'};
export const EXPERIMENT_KEY='fluvisar-intelligence-experiments-v1';
let cachedModels:ReturnType<typeof trainModels>|undefined;
function trainModels(){
 const samples=createSyntheticSamples(MODEL_SEEDS.samples,MODEL_SEEDS.per_class);
 const split=splitSyntheticSamples(samples,MODEL_SEEDS.split);
 const forest=trainSyntheticForest(split.train,MODEL_SEEDS.forest,MODEL_SEEDS.trees);
 const temporal=trainTemporalMlp(split.train,split.validation,MODEL_SEEDS.mlp);
 return {samples,...split,forest,neural:temporal.model,history:temporal.history,bestEpoch:temporal.bestEpoch};
}
export function intelligenceModels(){return cachedModels??(cachedModels=trainModels());}
export function savedExperiments():SavedExperiment[]{
 try{const data=JSON.parse(localStorage.getItem(EXPERIMENT_KEY)??'[]');return Array.isArray(data)?data.filter(row=>row.id&&typeof row.name==='string'&&isExperiment(row.experiment)).slice(0,8):[];}catch{return [];}
}
export function isExperiment(value:unknown):value is Experiment{
 const x=value as Experiment|undefined;
 return Boolean(x&&Array.isArray(x.features)&&x.features.length===4&&x.features.every(Number.isFinite)&&x.features[0]>=-28&&x.features[0]<=-2&&x.features[1]>=-28&&x.features[1]<=-2&&x.features.slice(2).every(n=>n>=0&&n<=1)&&x.scene&&Number.isFinite(x.scene.eventDb)&&Math.abs(x.scene.eventDb)<=6&&Number.isFinite(x.scene.stageShift)&&Math.abs(x.scene.stageShift)<=.4&&Number.isFinite(x.scene.persistenceShift)&&Math.abs(x.scene.persistenceShift)<=.5&&x.cutoff>=.2&&x.cutoff<=.95&&x.matrixCutoff>=.2&&x.matrixCutoff<=.9&&['neural','forest'].includes(x.mode));
}

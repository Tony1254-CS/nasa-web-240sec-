import { create } from 'zustand';
export const EVIDENCE_STAGES = [
 {id:'detect',label:'Detect',hint:'Measure the change'},
 {id:'investigate',label:'Investigate',hint:'Compare the sources'},
 {id:'challenge',label:'Challenge',hint:'Test the threshold'},
 {id:'explain',label:'Explain',hint:'Read the conclusion'},
 {id:'field',label:'Field',hint:'Record an observation'},
 {id:'impact',label:'Impact',hint:'Inspect potential exposure'},
] as const;
export type EvidenceStage=typeof EVIDENCE_STAGES[number]['id'];
interface WorkflowState {
 open:boolean;stage:EvidenceStage;guided:boolean;session:number;context:string;
 launch:(stage?:EvidenceStage,guided?:boolean)=>void;
 select:(stage:EvidenceStage)=>void;
 close:()=>void;
 bindContext:(context:string)=>void;
}
export const useEvidenceWorkflow=create<WorkflowState>(set=>({
 open:false,stage:'detect',guided:false,session:0,context:'',
 launch:(stage='detect',guided=false)=>set(state=>({open:true,stage,guided,session:state.session+1})),
 select:stage=>set({stage}),close:()=>set({open:false}),
 bindContext:context=>set(state=>state.context===context?state:{context,stage:state.guided?'detect':state.stage}),
}));

export interface FieldObservation {
 id:string;region_id:string;run_id:string;finding_id:string|null;pair:[string,string];
 observer:string;observed_at:string;recorded_at:string;note:string;condition:string;
 location:{lon:number;lat:number;accuracy_m:number}|null;
 photo:Blob|null;photo_name:string|null;photo_sha256:string|null;
 review_state:'awaiting-review';
}
function database():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open('fluvisar-field-evidence',1);
  request.onupgradeneeded=()=>{request.result.createObjectStore('observations',{keyPath:'id'});};
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
 });
}
export async function saveFieldObservation(record:FieldObservation){
 const db=await database();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('observations','readwrite');tx.objectStore('observations').put(record);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}
}
export async function listFieldObservations(region:string,run:string,finding?:string|null){
 const db=await database();try{return await new Promise<FieldObservation[]>((resolve,reject)=>{const request=db.transaction('observations').objectStore('observations').getAll();request.onsuccess=()=>resolve((request.result as FieldObservation[]).filter(row=>row.region_id===region&&row.run_id===run&&(!finding||row.finding_id===finding)).sort((a,b)=>b.recorded_at.localeCompare(a.recorded_at)));request.onerror=()=>reject(request.error);});}finally{db.close();}
}
export async function hashBlob(blob:Blob){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))].map(byte=>byte.toString(16).padStart(2,'0')).join('');}
export function downloadEvidence(name:string,value:unknown){
 const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function exportFieldObservations(records:FieldObservation[]){
 const rows=await Promise.all(records.map(async record=>{
  const {photo,...metadata}=record;
  const photo_data_url=photo?await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(photo);}):null;
  return {...metadata,photo_data_url};
 }));downloadEvidence('fluvisar-field-observations.json',{version:1,exported_at:new Date().toISOString(),storage:'on-device IndexedDB',observations:rows});
}

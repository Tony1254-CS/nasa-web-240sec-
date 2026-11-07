import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const web=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const project=path.resolve(web,'../..');
const venvPython=path.join(project,'.venv-data',process.platform==='win32'?'Scripts/python.exe':'bin/python');
const python=existsSync(venvPython)?venvPython:(process.platform==='win32'?'python':'python3');
const children=[];
let apiRunning=false;
try { apiRunning=(await fetch('http://127.0.0.1:8000/api/health',{signal:AbortSignal.timeout(1200)})).ok; } catch {}
if(!apiRunning){
  try {
    const api=spawn(python,['-m','uvicorn','app.main:app','--app-dir','services/api','--host','127.0.0.1','--port','8000','--reload'],{cwd:project,stdio:'inherit',windowsHide:true});
    children.push(api);
    api.on('error',error=>{console.warn('Observation API failed to launch:',error.message);console.warn('Running frontend in standalone mode.');});
  } catch (err) {
    console.warn('Unable to start Observation API:', err.message);
  }
}
const vite=spawn(process.execPath,[path.join(web,'node_modules/vite/bin/vite.js'),...process.argv.slice(2)],{cwd:web,stdio:'inherit',windowsHide:true});
children.push(vite);
let closing=false;
const close=()=>{if(closing)return;closing=true;for(const child of children)if(child.exitCode===null)child.kill();};
process.on('SIGINT',close);process.on('SIGTERM',close);process.on('exit',close);
vite.on('exit',code=>{close();process.exitCode=code??0;});

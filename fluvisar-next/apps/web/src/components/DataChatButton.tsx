import { MessageSquare } from 'lucide-react';

/** Only attach to evidence supported by the registered assistant tools. */
export function DataChatButton({subject}:{subject:string}){
 return <button type="button" className="fl-data-chat" aria-label={'Chat with Data: '+subject} onClick={()=>window.dispatchEvent(new CustomEvent('fluvisar-chat-data',{detail:{subject}}))}><MessageSquare size={13}/><span>Chat with Data</span></button>;
}

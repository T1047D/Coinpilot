import {all,put,remove,get} from './database.js';import {uid} from './utils.js';
export async function saveJournal(entry){const old=entry.id?await get('journal',entry.id):null;const now=Date.now();return put('journal',{...entry,id:old?.id||uid(),createdAt:old?.createdAt||now,updatedAt:now,revision:(old?.revision||0)+1});}
export const deleteJournal=id=>remove('journal',id);
export const listJournal=()=>all('journal');

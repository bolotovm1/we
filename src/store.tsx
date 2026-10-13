import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { format } from 'date-fns'
import { loadLocal, saveLocal } from './lib/db'
import { supabase } from './lib/supabase'
import type { AppData } from './types'

const today=()=>format(new Date(),'yyyy-MM-dd'), now=()=>new Date().toISOString()
const initial:AppData={programStart:today(),tasks:[],plans:[],accounts:[],transactions:[],debts:[],assets:[],health:[],recurring:[],pushSettings:{morning:true,evening:true,openDay:false,timezone:'Europe/Moscow'}}
type Action={type:'replace';data:AppData}|{type:'update';data:Partial<AppData>}
const reducer=(s:AppData,a:Action):AppData=>a.type==='replace'?a.data:{...s,...a.data}
type Store={data:AppData; update:(data:Partial<AppData>)=>void; loaded:boolean; exportData:()=>void; importData:(f:File)=>Promise<void>}
const Ctx=createContext<Store|null>(null)
export function StoreProvider({children}:{children:ReactNode}){
  const [data,dispatch]=useReducer(reducer,initial),[loaded,setLoaded]=useState(false)
  const [userId,setUserId]=useState<string>(),[cloudReady,setCloudReady]=useState(false)
  useEffect(()=>{loadLocal().then(x=>{if(x)dispatch({type:'replace',data:x})}).catch(()=>{/* Preview/private mode may block IndexedDB; keep the in-memory store usable. */}).finally(()=>setLoaded(true))},[])
  useEffect(()=>{if(loaded)saveLocal(data).catch(()=>{/* Continue in memory if persistent storage is unavailable. */})},[data,loaded])
  useEffect(()=>{const client=supabase;if(!client)return;const connect=async(id?:string)=>{setUserId(id);setCloudReady(false);if(!id)return;const {data:row}=await client.from('app_snapshots').select('data').eq('user_id',id).maybeSingle();if(row?.data)dispatch({type:'replace',data:row.data as AppData});setCloudReady(true)};client.auth.getUser().then(({data:{user}})=>connect(user?.id));const {data:sub}=client.auth.onAuthStateChange((_e,s)=>connect(s?.user.id));return()=>sub.subscription.unsubscribe()},[])
  useEffect(()=>{const client=supabase;if(!client||!userId||!cloudReady||!loaded)return;const timer=setTimeout(async()=>{const {error}=await client.from('app_snapshots').upsert({user_id:userId,data,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(!error)await saveLocal(data,'synced')},800);return()=>clearTimeout(timer)},[data,userId,cloudReady,loaded])
  const value=useMemo<Store>(()=>({data,loaded,update:d=>dispatch({type:'update',data:d}),exportData(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({version:1,exportedAt:now(),data},null,2)],{type:'application/json'}));a.download=`180-os-${today()}.json`;a.click();URL.revokeObjectURL(a.href)},async importData(f){const parsed=JSON.parse(await f.text());const next=parsed.data??parsed;if(!next.tasks||!next.accounts)throw new Error('Неверный формат');dispatch({type:'replace',data:next})}}),[data,loaded])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export const useStore=()=>{const x=useContext(Ctx);if(!x)throw Error('StoreProvider missing');return x}
export const makeId=()=>crypto.randomUUID()
export const stamp=()=>new Date().toISOString()

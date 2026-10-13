import Dexie, { type EntityTable } from 'dexie'
import type { AppData } from '../types'

interface StateRecord { id:'main'; data:AppData; updatedAt:string; syncState:'local'|'synced'|'error' }
class PersonalDB extends Dexie { state!:EntityTable<StateRecord,'id'>; constructor(){ super('personal-os-180'); this.version(1).stores({state:'id,updatedAt,syncState'}) } }
export const db=new PersonalDB()
export const loadLocal=async()=> (await db.state.get('main'))?.data
export const saveLocal=async(data:AppData, syncState:StateRecord['syncState']='local')=>db.state.put({id:'main',data,updatedAt:new Date().toISOString(),syncState})

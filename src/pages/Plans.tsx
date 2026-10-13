import { useState } from 'react'
import { addDays, format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarDays, Check, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Card, Empty, Progress } from '../components/UI'
import { makeId, stamp, useStore } from '../store'
import type { Priority, Task } from '../types'
const td=()=>format(new Date(),'yyyy-MM-dd')
export default function Plans(){
 const {data,update}=useStore(),[date,setDate]=useState(td()),[title,setTitle]=useState(''),[priority,setPriority]=useState<Priority>('medium')
 const tasks=data.tasks.filter(t=>t.date===date&&!t.deletedAt),plan=data.plans.find(p=>p.date===date),done=tasks.filter(t=>t.completed).length,rate=tasks.length?done/tasks.length*100:0
 const patchPlan=(x:Record<string,unknown>)=>{const p=plan?{...plan,...x,updatedAt:stamp()}:{id:makeId(),date,mainResult:'',wins:'',misses:'',improvement:'',updatedAt:stamp(),...x};update({plans:[...data.plans.filter(i=>i.date!==date),p]})}
 const add=()=>{if(!title.trim())return;const n:Task={id:makeId(),date,title:title.trim(),priority,completed:false,createdAt:stamp(),updatedAt:stamp()};update({tasks:[...data.tasks,n]});setTitle('')}
 const change=(id:string,x:Partial<Task>)=>update({tasks:data.tasks.map(t=>t.id===id?{...t,...x,updatedAt:stamp()}:t)})
 const move=(id:string)=>change(id,{date:format(addDays(parseISO(date),1),'yyyy-MM-dd')})
 return <div className="page"><header className="page-head"><div><p>Ежедневный планировщик</p><h1>Планы</h1></div><CalendarDays/></header>
  <Card className="date-nav"><button className="icon" onClick={()=>setDate(format(addDays(parseISO(date),-1),'yyyy-MM-dd'))}><ChevronLeft/></button><label><span>{format(parseISO(date),'EEEE',{locale:ru})}</span><b>{format(parseISO(date),'d MMMM yyyy',{locale:ru})}</b><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><button className="icon" onClick={()=>setDate(format(addDays(parseISO(date),1),'yyyy-MM-dd'))}><ChevronRight/></button></Card>
  <div className="seg"><button className={date===td()?'active':''} onClick={()=>setDate(td())}>Сегодня</button><button className={date===format(addDays(new Date(),1),'yyyy-MM-dd')?'active':''} onClick={()=>setDate(format(addDays(new Date(),1),'yyyy-MM-dd'))}>Завтра</button></div>
  <Card><label className="field"><span>Главный результат дня</span><input value={plan?.mainResult||''} onChange={e=>patchPlan({mainResult:e.target.value})} placeholder="Один измеримый результат"/></label></Card>
  <div className="card-head section-title"><div><h2>Задачи</h2><small>{done} из {tasks.length} выполнено</small></div><b className="green">{Math.round(rate)}%</b></div><Progress value={rate}/>
  <Card className="tasks">{tasks.length?tasks.map(t=><div className="task" key={t.id}><button className={`check ${t.completed?'done':''}`} onClick={()=>change(t.id,{completed:!t.completed})}>{t.completed&&<Check size={15}/>}</button><div><input className={t.completed?'strike':''} value={t.title} onChange={e=>change(t.id,{title:e.target.value})}/><span className={`priority ${t.priority}`}>{t.priority==='high'?'Высокий':t.priority==='medium'?'Средний':'Низкий'}</span></div><div className="task-actions"><button title="Перенести на завтра" onClick={()=>move(t.id)}><ChevronRight/></button><button title="Удалить" onClick={()=>change(t.id,{deletedAt:stamp()})}><Trash2/></button></div></div>):<Empty>Добавьте первую задачу дня</Empty>}
   <div className="add-row"><input value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Новая задача"/><select value={priority} onChange={e=>setPriority(e.target.value as Priority)}><option value="high">Высокий</option><option value="medium">Средний</option><option value="low">Низкий</option></select><button className="primary" onClick={add}><Plus/> Добавить</button></div></Card>
  <div className="section-title"><h2>Вечерний разбор</h2></div><Card><div className="form-grid"><label className="field"><span>Что получилось?</span><textarea value={plan?.wins||''} onChange={e=>patchPlan({wins:e.target.value})}/></label><label className="field"><span>Что не получилось?</span><textarea value={plan?.misses||''} onChange={e=>patchPlan({misses:e.target.value})}/></label><label className="field full"><span>Что улучшить завтра?</span><textarea value={plan?.improvement||''} onChange={e=>patchPlan({improvement:e.target.value})}/></label></div><button className="primary wide" disabled={Boolean(plan?.closedAt)} onClick={()=>patchPlan({closedAt:stamp(),snapshot:{total:tasks.length,completed:done,rate}})}>{plan?.closedAt?'День закрыт':'Закрыть день и сохранить снимок'}</button></Card>
 </div>
}

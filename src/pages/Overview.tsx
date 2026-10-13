import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowUpRight, Check, Moon, Plus, Sparkles, Wallet } from 'lucide-react'
import { useStore } from '../store'
import { financeSummary } from '../lib/finance'
import { Card, Empty, Metric, Progress, money } from '../components/UI'
export default function Overview({go}:{go:(x:string)=>void}){
 const {data}=useStore(), date=format(new Date(),'yyyy-MM-dd'), tasks=data.tasks.filter(t=>t.date===date&&!t.deletedAt),done=tasks.filter(t=>t.completed).length,rate=tasks.length?done/tasks.length*100:0
 const plan=data.plans.find(p=>p.date===date), health=data.health.find(h=>h.date===date), summary=financeSummary(data.accounts,data.transactions,data.debts,data.assets)
 const day=Math.max(1,Math.min(180,differenceInCalendarDays(new Date(),parseISO(data.programStart))+1)), upcoming=data.recurring.filter(x=>x.kind==='expense').sort((a,b)=>a.dayOfMonth-b.dayOfMonth).slice(0,2)
 const last7=Array.from({length:7},(_,i)=>format(addDays(new Date(),i-6),'yyyy-MM-dd')).map(d=>{const ts=data.tasks.filter(t=>t.date===d&&!t.deletedAt);return ts.length?Math.round(ts.filter(t=>t.completed).length/ts.length*100):0})
 return <div className="page"><header className="page-head"><div><p>{format(new Date(),'EEEE, d MMMM',{locale:ru})}</p><h1>Добрый день</h1></div><div className="day-pill">День <b>{day}</b> / 180</div></header>
  <Card className="hero"><div className="eyebrow"><Sparkles size={15}/> Главный результат дня</div><h2>{plan?.mainResult||'Определите результат, который сделает этот день значимым'}</h2><button className="text-btn" onClick={()=>go('plans')}>{plan?.mainResult?'Открыть план':'Запланировать'} <ArrowUpRight size={16}/></button></Card>
  <div className="grid two"><Card><div className="card-head"><div><span className="muted">Выполнение сегодня</span><h2>{Math.round(rate)}%</h2></div><div className="ring" style={{'--p':`${rate*3.6}deg`} as React.CSSProperties}><span>{done}/{tasks.length}</span></div></div><Progress value={rate}/><small>{tasks.length-done} задач осталось</small></Card>
  <Card><span className="muted">Динамика 7 дней</span><div className="minibars">{last7.map((v,i)=><i key={i} style={{height:`${Math.max(5,v)}%`}} className={i===6?'active':''}/>)}</div><small>Процент выполненных задач</small></Card></div>
  <div className="section-title"><h2>Фокус дня</h2><button onClick={()=>go('plans')}>Все задачи</button></div>
  <Card className="task-preview">{tasks.length?tasks.sort((a,b)=>({high:0,medium:1,low:2}[a.priority]-{high:0,medium:1,low:2}[b.priority])).slice(0,3).map(t=><div className="preview-row" key={t.id}><span className={`check ${t.completed?'done':''}`}>{t.completed&&<Check size={14}/>}</span><div><b className={t.completed?'strike':''}>{t.title}</b><small>{t.priority==='high'?'Высокий':t.priority==='medium'?'Средний':'Низкий'} приоритет</small></div></div>):<Empty>Сегодня задач пока нет</Empty>}</Card>
  <div className="section-title"><h2>Состояние</h2></div><div className="grid three"><Card><Metric label="Деньги" value={money(summary.cash)} tone="blue"/><small>На счетах</small></Card><Card><Metric label="Чистый капитал" value={money(summary.netWorth)} tone={summary.netWorth>=0?'green':'red'}/><small>Активы − долги</small></Card><Card><Metric label="Сон" value={health?`${health.sleepHours} ч`:'—'} tone="purple"/><small>{health?`Энергия ${health.energy}/10`:'Нет записи'}</small></Card></div>
  {upcoming.length>0&&<Card><div className="card-head"><div><span className="muted">Ближайшие платежи</span><h3>{money(upcoming.reduce((s,x)=>s+x.amount,0))}</h3></div><Wallet className="blue"/></div>{upcoming.map(x=><div className="line" key={x.id}><span>{x.title}</span><b>{x.dayOfMonth} числа · {money(x.amount)}</b></div>)}</Card>}
  <div className="section-title"><h2>Быстрые действия</h2></div><div className="quick"><button onClick={()=>go('plans')}><Plus/><span>Задача</span></button><button onClick={()=>go('finance')}><Wallet/><span>Операция</span></button><button onClick={()=>go('health')}><Moon/><span>Сон</span></button><button onClick={()=>go('plans')}><ArrowUpRight/><span>Завтра</span></button></div>
 </div>
}

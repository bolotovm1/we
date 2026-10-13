import type { ReactNode } from 'react'
import { X } from 'lucide-react'
export const money=(n:number)=>new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(n)
export function Card({children,className='',onClick}:{children:ReactNode;className?:string;onClick?:()=>void}){return <section className={`card ${className}`} onClick={onClick}>{children}</section>}
export function Metric({label,value,sub,tone='green'}:{label:string;value:string;sub?:string;tone?:string}){return <div className="metric"><span>{label}</span><strong className={tone}>{value}</strong>{sub&&<small>{sub}</small>}</div>}
export function Progress({value,color='green'}:{value:number;color?:string}){return <div className="progress"><i className={color} style={{width:`${Math.max(0,Math.min(100,value))}%`}}/></div>}
export function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){return <div className="shade" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal"><header><h2>{title}</h2><button className="icon" onClick={onClose}><X/></button></header>{children}</div></div>}
export function Empty({children}:{children:ReactNode}){return <div className="empty">{children}</div>}

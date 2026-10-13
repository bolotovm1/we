import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { StoreProvider } from './store'
import './styles.css'
registerSW({immediate:true})
class ErrorBoundary extends Component<{children:ReactNode},{error?:Error}>{state:{error?:Error}={};static getDerivedStateFromError(error:Error){return{error}}componentDidCatch(error:Error,info:ErrorInfo){console.error(error,info)}render(){return this.state.error?<div style={{minHeight:'100vh',display:'grid',placeContent:'center',padding:24,background:'#08090b',color:'#fff',textAlign:'center'}}><h1>Не удалось открыть 180 OS</h1><p style={{color:'#999'}}>Обновите страницу. Данные на устройстве не удалены.</p><button onClick={()=>location.reload()} style={{padding:'12px 18px',border:0,borderRadius:10,background:'#67e8a5'}}>Обновить</button></div>:this.props.children}}
ReactDOM.createRoot(document.getElementById('root')!).render(<ErrorBoundary><StoreProvider><App/></StoreProvider></ErrorBoundary>)

import { describe, expect, it } from 'vitest'
import { accountBalances, financeSummary, simulateDebt } from './finance'
import type { Account, Debt, Transaction } from '../types'
const now='2026-01-01T00:00:00Z'
const accounts:Account[]=[{id:'a',name:'Карта',type:'bank',openingBalance:1000,currency:'RUB',createdAt:now,updatedAt:now},{id:'b',name:'Сбережения',type:'savings',openingBalance:0,currency:'RUB',createdAt:now,updatedAt:now}]
const tx=(type:Transaction['type'],amount:number,extra:Partial<Transaction>={}):Transaction=>({id:crypto.randomUUID(),date:'2026-01-01',amount,type,category:'',accountId:'a',comment:'',createdAt:now,updatedAt:now,...extra})
describe('финансовый движок',()=>{
  it('перевод не меняет общую сумму денег и не считается доходом',()=>{ const t=[tx('transfer',300,{toAccountId:'b'})]; expect(accountBalances(accounts,t)).toEqual({a:700,b:300}); expect(financeSummary(accounts,t,[],[]).income).toBe(0) })
  it('получение займа увеличивает деньги и обязательства, но не капитал',()=>{ const d:Debt={id:'d',name:'Долг',creditor:'Банк',initialAmount:500,currentBalance:500,annualRate:0,minimumPayment:50,dueDay:1,openedAt:'2026-01-01',accruedInterest:0,paidInterest:0,updatedAt:now}; expect(financeSummary(accounts,[tx('loan_received',500)], [d],[]).netWorth).toBe(1000) })
  it('основной долг не считается расходом',()=>{ const s=financeSummary(accounts,[tx('debt_principal',100)],[],[]); expect(s.expenses).toBe(0); expect(s.cash).toBe(900) })
  it('проценты считаются расходом',()=>expect(financeSummary(accounts,[tx('interest',100)],[],[]).expenses).toBe(100))
  it('чистый капитал учитывает активы и обязательства',()=>expect(financeSummary(accounts,[],[{id:'d',name:'',creditor:'',initialAmount:400,currentBalance:400,annualRate:0,minimumPayment:0,dueDay:1,openedAt:'',accruedInterest:0,paidInterest:0,updatedAt:now}],[{id:'x',name:'',value:250,updatedAt:now}]).netWorth).toBe(850))
  it('симулятор корректно гасит беспроцентный долг',()=>expect(simulateDebt({currentBalance:1200,annualRate:0,minimumPayment:100},0)).toMatchObject({months:12,interest:0,impossible:false}))
})

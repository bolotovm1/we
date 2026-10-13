import type { Account, Asset, Debt, Transaction } from '../types'

const active = (transactions: Transaction[]) => transactions.filter(t => !t.deletedAt)

export function accountBalances(accounts: Account[], transactions: Transaction[]) {
  const balances = Object.fromEntries(accounts.map(a => [a.id, a.openingBalance])) as Record<string, number>
  for (const t of active(transactions)) {
    if (!(t.accountId in balances)) continue
    if (['income','loan_received','asset_sell','adjustment'].includes(t.type)) balances[t.accountId] += t.amount
    if (['expense','debt_principal','interest','asset_buy'].includes(t.type)) balances[t.accountId] -= t.amount
    if (t.type === 'transfer') { balances[t.accountId] -= t.amount; if (t.toAccountId && t.toAccountId in balances) balances[t.toAccountId] += t.amount }
  }
  return balances
}

export function financeSummary(accounts: Account[], transactions: Transaction[], debts: Debt[], assets: Asset[], from?: string, to?: string) {
  const selected = active(transactions).filter(t => (!from || t.date >= from) && (!to || t.date <= to))
  const cash = Object.values(accountBalances(accounts, transactions)).reduce((a,b)=>a+b,0)
  const assetValue = assets.reduce((a,b)=>a+b.value,0)
  const liabilities = debts.reduce((a,b)=>a+b.currentBalance+b.accruedInterest,0)
  const income = selected.filter(t=>t.type==='income').reduce((a,b)=>a+b.amount,0)
  const expenses = selected.filter(t=>t.type==='expense'||t.type==='interest').reduce((a,b)=>a+b.amount,0)
  return { cash, assetValue, liabilities, netWorth:cash+assetValue-liabilities, income, expenses, cashFlow:income-expenses }
}

export interface PayoffResult { months:number; interest:number; paid:number; impossible:boolean }
export function simulateDebt(debt: Pick<Debt,'currentBalance'|'annualRate'|'minimumPayment'>, extra=0): PayoffResult {
  let balance=debt.currentBalance, interest=0, paid=0, months=0
  while (balance > 0.005 && months < 1200) {
    const fee=balance*(debt.annualRate/100/12); interest+=fee; balance+=fee
    const payment=Math.min(balance, debt.minimumPayment+extra)
    if (payment <= fee && balance > payment) return {months,interest,paid,impossible:true}
    balance-=payment; paid+=payment; months++
  }
  return {months,interest,paid,impossible:months>=1200}
}

export function debtStrategy(debts: Debt[], extra: number, mode:'avalanche'|'snowball') {
  const sorted=[...debts].sort(mode==='avalanche' ? (a,b)=>b.annualRate-a.annualRate : (a,b)=>a.currentBalance-b.currentBalance)
  return sorted.map((debt,i)=>({debt,result:simulateDebt(debt,i===0?extra:0)}))
}

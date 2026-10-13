export type Priority = 'high' | 'medium' | 'low'
export interface Task { id:string; userId?:string; date:string; title:string; priority:Priority; completed:boolean; createdAt:string; updatedAt:string; deletedAt?:string }
export interface DayPlan { id:string; userId?:string; date:string; mainResult:string; wins:string; misses:string; improvement:string; closedAt?:string; snapshot?:{total:number;completed:number;rate:number}; updatedAt:string }
export type AccountType = 'bank'|'cash'|'savings'|'other'
export interface Account { id:string; name:string; type:AccountType; openingBalance:number; currency:string; createdAt:string; updatedAt:string }
export type TransactionType = 'income'|'expense'|'transfer'|'loan_received'|'debt_principal'|'interest'|'adjustment'|'asset_buy'|'asset_sell'
export interface Transaction { id:string; date:string; amount:number; type:TransactionType; category:string; accountId:string; toAccountId?:string; debtId?:string; assetId?:string; comment:string; createdAt:string; updatedAt:string; deletedAt?:string }
export interface Debt { id:string; name:string; creditor:string; initialAmount:number; currentBalance:number; annualRate:number; minimumPayment:number; dueDay:number; openedAt:string; payoffTarget?:string; accruedInterest:number; paidInterest:number; updatedAt:string }
export interface Asset { id:string; name:string; value:number; updatedAt:string }
export interface HealthEntry { id:string; date:string; sleepHours:number; energy:number; mood:number; wellbeing:string; workout:boolean; activityType:string; activityMinutes:number; notes:string; updatedAt:string }
export interface RecurringEvent { id:string; title:string; amount:number; kind:'expense'|'income'; dayOfMonth:number; confirmed:boolean; accountId?:string }
export interface PushSettings { morning:boolean; evening:boolean; openDay:boolean; timezone:string }
export interface AppData { programStart:string; tasks:Task[]; plans:DayPlan[]; accounts:Account[]; transactions:Transaction[]; debts:Debt[]; assets:Asset[]; health:HealthEntry[]; recurring:RecurringEvent[]; pushSettings:PushSettings }

import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'npm:@supabase/supabase-js@2'
const cors={'Content-Type':'application/json'}
Deno.serve(async(req)=>{
  const auth=req.headers.get('Authorization');if(auth!==`Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`)return new Response('Unauthorized',{status:401})
  webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT')!,Deno.env.get('VAPID_PUBLIC_KEY')!,Deno.env.get('VAPID_PRIVATE_KEY')!)
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!),now=new Date(),moscow=new Date(now.toLocaleString('en-US',{timeZone:'Europe/Moscow'})),hour=moscow.getHours(),minute=moscow.getMinutes(),day=moscow.toISOString().slice(0,10)
  if(minute>4||![9,22].includes(hour))return new Response(JSON.stringify({sent:0,reason:'outside window'}),{headers:cors})
  const field=hour===9?'last_morning_at':'last_evening_at',enabled=hour===9?'morning_enabled':'evening_enabled'
  const {data,error}=await db.from('push_subscriptions').select('*').eq(enabled,true).or(`${field}.is.null,${field}.lt.${day}`);if(error)return new Response(error.message,{status:500})
  let sent=0;for(const row of data||[]){try{await webpush.sendNotification(row.subscription,JSON.stringify(hour===9?{title:'План на сегодня',body:'Определите главный результат и три приоритетные задачи.',tag:`morning-${day}`,url:'/#plans'}:{title:'План на завтра',body:'Несколько минут сейчас сделают завтрашний день яснее.',tag:`evening-${day}`,url:'/#plans'}));await db.from('push_subscriptions').update({[field]:day,updated_at:new Date().toISOString()}).eq('id',row.id);sent++}catch(e){if([404,410].includes(e.statusCode))await db.from('push_subscriptions').delete().eq('id',row.id);else console.error(e)}}
  return new Response(JSON.stringify({sent}),{headers:cors})
})

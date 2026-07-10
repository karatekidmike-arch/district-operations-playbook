'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase';

type Store = {
  id: string;
  name: string;
  concept: 'Dunkin' | 'Jimmy Johns';
  sales_goal: number;
  labor_goal: number;
  cogs_goal: number;
};

type Invoice = {
  id: string;
  store_id: string;
  vendor: string;
  amount: number;
  invoice_date: string;
};

const seedStores: Store[] = [
  {id:'354879',name:'National City',concept:'Dunkin',sales_goal:250000,labor_goal:24.5,cogs_goal:28},
  {id:'354966',name:'Miramar',concept:'Dunkin',sales_goal:44000,labor_goal:28,cogs_goal:28},
  {id:'358656',name:'La Jolla',concept:'Dunkin',sales_goal:28000,labor_goal:36,cogs_goal:28},
  {id:'364755',name:'Pacific Beach DD',concept:'Dunkin',sales_goal:70000,labor_goal:33,cogs_goal:28},
  {id:'364559',name:'Montezuma DD',concept:'Dunkin',sales_goal:48000,labor_goal:34,cogs_goal:28},
  {id:'4502',name:'Carlsbad JJ',concept:'Jimmy Johns',sales_goal:52000,labor_goal:28,cogs_goal:28},
  {id:'4501',name:'Escondido JJ',concept:'Jimmy Johns',sales_goal:53000,labor_goal:32,cogs_goal:28},
  {id:'4647',name:'Pacific Beach JJ',concept:'Jimmy Johns',sales_goal:56000,labor_goal:30,cogs_goal:28},
  {id:'4500',name:'Montezuma JJ',concept:'Jimmy Johns',sales_goal:26000,labor_goal:27,cogs_goal:28},
];

const budgets: Record<string, Record<string, number>> = {
  '354879': {'Supply It':21242,'NDCP':48000,'Waste':2000},
  '354966': {'Supply It':4615,'NDCP':9000,'Waste':500},
  '358656': {'Supply It':5962,'NDCP':6500,'Waste':500},
  '364755': {'Supply It':10803,'NDCP':14000,'Waste':750},
  '364559': {'Supply It':7002,'NDCP':10000,'Waste':600},
  '4502': {'Sysco':9000,'Produce':2323,'Waste':600},
  '4501': {'Sysco':9200,'Produce':2345,'Waste':600},
  '4647': {'Sysco':8800,'Produce':2026,'Waste':600},
  '4500': {'Sysco':5200,'Produce':1193,'Waste':400},
};

export default function Home() {
  const [tab,setTab]=useState<'dashboard'|'stores'|'invoice'>('dashboard');
  const [stores,setStores]=useState<Store[]>(seedStores);
  const [invoices,setInvoices]=useState<Invoice[]>([]);
  const [storeId,setStoreId]=useState(seedStores[0].id);
  const [vendor,setVendor]=useState('NDCP');
  const [amount,setAmount]=useState('');
  const [notice,setNotice]=useState('');
  const supabase = useMemo(()=>createClient(),[]);

  useEffect(()=>{
    async function load(){
      if(!supabase){
        const saved=localStorage.getItem('dop-invoices');
        if(saved) setInvoices(JSON.parse(saved));
        return;
      }
      const [{data:s},{data:i}] = await Promise.all([
        supabase.from('stores').select('*').order('name'),
        supabase.from('invoices').select('*').order('invoice_date',{ascending:false})
      ]);
      if(s?.length) setStores(s as Store[]);
      if(i) setInvoices(i as Invoice[]);
    }
    load();
  },[supabase]);

  async function saveInvoice(e:React.FormEvent){
    e.preventDefault();
    const value=Number(amount);
    if(!value || value<=0){setNotice('Enter a valid amount.');return;}
    const row={store_id:storeId,vendor,amount:value,invoice_date:new Date().toISOString().slice(0,10)};
    if(supabase){
      const {data,error}=await supabase.from('invoices').insert(row).select().single();
      if(error){setNotice(error.message);return;}
      setInvoices(prev=>[data as Invoice,...prev]);
    } else {
      const local={id:crypto.randomUUID(),...row};
      const next=[local,...invoices];
      setInvoices(next); localStorage.setItem('dop-invoices',JSON.stringify(next));
    }
    setAmount(''); setNotice('Invoice saved.');
  }

  const spentByStore = (id:string) => invoices.filter(x=>x.store_id===id).reduce((n,x)=>n+Number(x.amount),0);
  const totalSalesGoal=stores.reduce((n,s)=>n+Number(s.sales_goal),0);
  const totalSpent=invoices.reduce((n,i)=>n+Number(i.amount),0);

  return <div className="shell">
    <header className="topbar"><h1>District Operations Playbook</h1><p>Period 8 · District Manager: Michael Rivas</p></header>
    <main className="page">
      <nav className="nav">
        <button className={tab==='dashboard'?'active':''} onClick={()=>setTab('dashboard')}>Dashboard</button>
        <button className={tab==='stores'?'active':''} onClick={()=>setTab('stores')}>Stores</button>
        <button className={tab==='invoice'?'active':''} onClick={()=>setTab('invoice')}>Enter Invoice</button>
      </nav>

      {tab==='dashboard' && <>
        <section className="cards">
          <div className="card"><div className="muted">District Sales Goal</div><div className="metric">${totalSalesGoal.toLocaleString()}</div></div>
          <div className="card"><div className="muted">Invoices Entered</div><div className="metric">${totalSpent.toLocaleString()}</div></div>
          <div className="card"><div className="muted">Stores</div><div className="metric">{stores.length}</div></div>
          <div className="card"><div className="muted">Period</div><div className="metric">8</div></div>
        </section>
        <section className="grid">
          <div className="panel"><h2>Store Health</h2><table><thead><tr><th>Store</th><th>Concept</th><th>Sales Goal</th><th>Invoices</th><th>Status</th></tr></thead>
          <tbody>{stores.map(s=>{const spent=spentByStore(s.id); const cogs=s.sales_goal*s.cogs_goal/100; const ratio=spent/cogs; const status=ratio<.75?'On Track':ratio<1?'Watch':'Action';
          return <tr key={s.id}><td><strong>{s.name}</strong><div className="muted">#{s.id}</div></td><td>{s.concept}</td><td>${Number(s.sales_goal).toLocaleString()}</td><td>${spent.toLocaleString()}</td><td><span className={'badge '+(status==='On Track'?'green':status==='Watch'?'yellow':'red')}>{status}</span></td></tr>})}</tbody></table></div>
          <aside className="panel"><h2>Quick Actions</h2><p className="muted">Enter purchasing invoices once and the store totals update automatically.</p><button className="btn orange" onClick={()=>setTab('invoice')}>Enter Invoice</button><h3 style={{marginTop:24}}>Recent Invoices</h3>{invoices.slice(0,6).map(i=><p key={i.id}><strong>{i.vendor}</strong> · ${Number(i.amount).toLocaleString()}<br/><span className="muted">{stores.find(s=>s.id===i.store_id)?.name}</span></p>)}</aside>
        </section>
      </>}

      {tab==='stores' && <section className="store-grid">{stores.map(s=>{const spend=spentByStore(s.id); const vendorBudget=Object.values(budgets[s.id]||{}).reduce((a,b)=>a+b,0); const pct=vendorBudget?Math.min(100,spend/vendorBudget*100):0;
      return <article className="store-card" key={s.id}><div className="muted">{s.concept} · #{s.id}</div><h2>{s.name}</h2><p>Sales goal: <strong>${Number(s.sales_goal).toLocaleString()}</strong></p><p>Labor goal: <strong>{s.labor_goal}%</strong></p><p>Purchasing spent: <strong>${spend.toLocaleString()}</strong></p><div className="progress"><span style={{width:pct+'%'}}/></div><p className="muted">{pct.toFixed(0)}% of purchasing budget entered</p><h3>Vendor Budgets</h3>{Object.entries(budgets[s.id]||{}).map(([k,v])=><p key={k}>{k}: <strong>${v.toLocaleString()}</strong></p>)}</article>})}</section>}

      {tab==='invoice' && <section className="grid">
        <div className="panel"><h2>Enter Invoice</h2><form className="form" onSubmit={saveInvoice}>
          <div className="field"><label>Store</label><select value={storeId} onChange={e=>setStoreId(e.target.value)}>{stores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="field"><label>Vendor</label><select value={vendor} onChange={e=>setVendor(e.target.value)}><option>Supply It</option><option>NDCP</option><option>Sysco</option><option>Produce</option><option>Waste</option></select></div>
          <div className="field"><label>Invoice Amount</label><input value={amount} onChange={e=>setAmount(e.target.value)} inputMode="decimal" placeholder="0.00"/></div>
          <button className="btn orange">Save Invoice</button>{notice&&<p>{notice}</p>}
        </form></div>
        <aside className="panel"><h2>How it works</h2><p>Select the store and vendor, enter the total, and save. With Supabase configured, the invoice is stored in your database. Without Supabase, this starter runs in browser-only demo mode using local storage.</p></aside>
      </section>}
    </main>
  </div>
}

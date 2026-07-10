'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../lib/supabase';

const seedStores = [
  { id: '354879', name: 'National City', concept: 'Dunkin', sales_goal: 250000, labor_goal: 24.5, cogs_goal: 28 },
  { id: '354966', name: 'Miramar', concept: 'Dunkin', sales_goal: 44000, labor_goal: 28, cogs_goal: 28 },
  { id: '358656', name: 'La Jolla', concept: 'Dunkin', sales_goal: 28000, labor_goal: 36, cogs_goal: 28 },
  { id: '364755', name: 'Pacific Beach DD', concept: 'Dunkin', sales_goal: 70000, labor_goal: 33, cogs_goal: 28 },
  { id: '364559', name: 'Montezuma DD', concept: 'Dunkin', sales_goal: 48000, labor_goal: 34, cogs_goal: 28 },
  { id: '4502', name: 'Carlsbad JJ', concept: 'Jimmy Johns', sales_goal: 52000, labor_goal: 28, cogs_goal: 28 },
  { id: '4501', name: 'Escondido JJ', concept: 'Jimmy Johns', sales_goal: 53000, labor_goal: 32, cogs_goal: 28 },
  { id: '4647', name: 'Pacific Beach JJ', concept: 'Jimmy Johns', sales_goal: 56000, labor_goal: 30, cogs_goal: 28 },
  { id: '4500', name: 'Montezuma JJ', concept: 'Jimmy Johns', sales_goal: 26000, labor_goal: 27, cogs_goal: 28 }
];

const budgets = {
  '354879': { 'Supply It': 21242, NDCP: 48000, Waste: 2000 },
  '354966': { 'Supply It': 4615, NDCP: 9000, Waste: 500 },
  '358656': { 'Supply It': 5962, NDCP: 6500, Waste: 500 },
  '364755': { 'Supply It': 10803, NDCP: 14000, Waste: 750 },
  '364559': { 'Supply It': 7002, NDCP: 10000, Waste: 600 },
  '4502': { Sysco: 9000, Produce: 2323, Waste: 600 },
  '4501': { Sysco: 9200, Produce: 2345, Waste: 600 },
  '4647': { Sysco: 8800, Produce: 2026, Waste: 600 },
  '4500': { Sysco: 5200, Produce: 1193, Waste: 400 }
};

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function Home() {
  const [tab, setTab] = useState('dashboard');
  const [stores, setStores] = useState(seedStores);
  const [invoices, setInvoices] = useState([]);
  const [storeId, setStoreId] = useState(seedStores[0].id);
  const [vendor, setVendor] = useState('NDCP');
  const [amount, setAmount] = useState('');
  const [notice, setNotice] = useState('');
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function load() {
      if (!supabase) {
        const saved = window.localStorage.getItem('dop-invoices');
        if (saved) setInvoices(JSON.parse(saved));
        return;
      }
      const [{ data: storeData }, { data: invoiceData }] = await Promise.all([
        supabase.from('stores').select('*').order('name'),
        supabase.from('invoices').select('*').order('invoice_date', { ascending: false })
      ]);
      if (storeData?.length) setStores(storeData);
      if (invoiceData) setInvoices(invoiceData);
    }
    load();
  }, [supabase]);

  async function saveInvoice(event) {
    event.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      setNotice('Enter a valid amount.');
      return;
    }
    const row = { store_id: storeId, vendor, amount: value, invoice_date: new Date().toISOString().slice(0, 10) };
    if (supabase) {
      const { data, error } = await supabase.from('invoices').insert(row).select().single();
      if (error) {
        setNotice(error.message);
        return;
      }
      setInvoices((current) => [data, ...current]);
    } else {
      const local = { id: crypto.randomUUID(), ...row };
      const next = [local, ...invoices];
      setInvoices(next);
      window.localStorage.setItem('dop-invoices', JSON.stringify(next));
    }
    setAmount('');
    setNotice('Invoice saved.');
  }

  const spentByStore = (id) => invoices.filter((invoice) => invoice.store_id === id).reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  const totalSalesGoal = stores.reduce((sum, store) => sum + Number(store.sales_goal), 0);
  const totalSpent = invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">PERIOD 8</span>
          <h1>District Operations Playbook</h1>
          <p>District Manager: Michael Rivas</p>
        </div>
      </header>

      <main className="page">
        <nav className="nav" aria-label="Primary navigation">
          <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>Dashboard</button>
          <button className={tab === 'stores' ? 'active' : ''} onClick={() => setTab('stores')}>Stores</button>
          <button className={tab === 'invoice' ? 'active' : ''} onClick={() => setTab('invoice')}>Enter Invoice</button>
        </nav>

        {tab === 'dashboard' && (
          <>
            <section className="cards">
              <article className="card"><span className="muted">District Sales Goal</span><strong className="metric">{money(totalSalesGoal)}</strong></article>
              <article className="card"><span className="muted">Invoices Entered</span><strong className="metric">{money(totalSpent)}</strong></article>
              <article className="card"><span className="muted">Stores</span><strong className="metric">{stores.length}</strong></article>
              <article className="card"><span className="muted">Data Mode</span><strong className="metric small">{supabase ? 'Live' : 'Demo'}</strong></article>
            </section>

            <section className="grid">
              <div className="panel table-wrap">
                <div className="panel-title"><div><span className="muted">District Overview</span><h2>Store Health</h2></div></div>
                <table>
                  <thead><tr><th>Store</th><th>Concept</th><th>Sales Goal</th><th>Invoices</th><th>Status</th></tr></thead>
                  <tbody>
                    {stores.map((store) => {
                      const spent = spentByStore(store.id);
                      const cogsBudget = store.sales_goal * store.cogs_goal / 100;
                      const ratio = cogsBudget ? spent / cogsBudget : 0;
                      const status = ratio < 0.75 ? 'On Track' : ratio < 1 ? 'Watch' : 'Action';
                      return (
                        <tr key={store.id}>
                          <td><strong>{store.name}</strong><div className="muted">#{store.id}</div></td>
                          <td>{store.concept}</td>
                          <td>{money(store.sales_goal)}</td>
                          <td>{money(spent)}</td>
                          <td><span className={`badge ${status === 'On Track' ? 'green' : status === 'Watch' ? 'yellow' : 'red'}`}>{status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <aside className="panel">
                <span className="muted">Fast entry</span>
                <h2>Quick Actions</h2>
                <p className="muted">Enter each purchasing invoice once. Store totals update automatically.</p>
                <button className="btn orange" onClick={() => setTab('invoice')}>Enter Invoice</button>
                <h3>Recent Invoices</h3>
                {invoices.length === 0 && <p className="muted">No invoices entered yet.</p>}
                {invoices.slice(0, 6).map((invoice) => (
                  <div className="invoice-row" key={invoice.id}>
                    <div><strong>{invoice.vendor}</strong><span>{stores.find((store) => store.id === invoice.store_id)?.name}</span></div>
                    <strong>{money(invoice.amount)}</strong>
                  </div>
                ))}
              </aside>
            </section>
          </>
        )}

        {tab === 'stores' && (
          <section className="store-grid">
            {stores.map((store) => {
              const spend = spentByStore(store.id);
              const vendorBudget = Object.values(budgets[store.id] || {}).reduce((a, b) => a + b, 0);
              const pct = vendorBudget ? Math.min(100, spend / vendorBudget * 100) : 0;
              return (
                <article className="store-card" key={store.id}>
                  <div className="store-card-head"><div><span className="muted">{store.concept} · #{store.id}</span><h2>{store.name}</h2></div><span className="badge green">Active</span></div>
                  <div className="stat-line"><span>Sales goal</span><strong>{money(store.sales_goal)}</strong></div>
                  <div className="stat-line"><span>Labor goal</span><strong>{store.labor_goal}%</strong></div>
                  <div className="stat-line"><span>Purchasing spent</span><strong>{money(spend)}</strong></div>
                  <div className="progress"><span style={{ width: `${pct}%` }} /></div>
                  <p className="muted">{pct.toFixed(0)}% of purchasing budget entered</p>
                  <div className="budget-list">
                    {Object.entries(budgets[store.id] || {}).map(([name, value]) => (
                      <div key={name}><span>{name}</span><strong>{money(value)}</strong></div>
                    ))}
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {tab === 'invoice' && (
          <section className="grid form-grid">
            <div className="panel">
              <span className="muted">Purchasing</span>
              <h2>Enter Invoice</h2>
              <form className="form" onSubmit={saveInvoice}>
                <label className="field">Store<select value={storeId} onChange={(event) => setStoreId(event.target.value)}>{stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select></label>
                <label className="field">Vendor<select value={vendor} onChange={(event) => setVendor(event.target.value)}><option>Supply It</option><option>NDCP</option><option>Sysco</option><option>Produce</option><option>Waste</option></select></label>
                <label className="field">Invoice Amount<input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="0.00" /></label>
                <button className="btn orange" type="submit">Save Invoice</button>
                {notice && <p className="notice">{notice}</p>}
              </form>
            </div>
            <aside className="panel">
              <span className="muted">Setup status</span>
              <h2>{supabase ? 'Supabase Connected' : 'Demo Mode'}</h2>
              <p>{supabase ? 'Invoices are saved to your shared database.' : 'Invoices are saved only in this browser until Supabase environment variables are added.'}</p>
              <p className="muted">You can deploy and test the app before connecting Supabase.</p>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}

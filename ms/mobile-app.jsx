/* mobile-app.jsx — shell wiring all mobile screens together */
const { useState: useStateM, useEffect: useEffectM, useRef: useRefM } = React;
function MobileApp({ tweaks }) {
  const { TabBar, HomeScreen, BrowseScreen } = window.MobileScreens1;
  const { ConfigScreen, LiveOrderScreen } = window.MobileScreens2;
  const { WalletScreen, OrdersScreen, SettingsScreen, AuthScreen } = window.MobileScreens3;
  const pushToast = useToast();

  const [authed, setAuthed] = useStateM(true);
  const [tab, setTab] = useStateM('home');         // home|browse|orders|wallet
  const [view, setView] = useStateM(null);          // null | {type:'config',svc} | {type:'live',order} | 'settings'
  const [balance, setBalance] = useStateM(WALLET_START);
  const [orders, setOrders] = useStateM(SEED_ORDERS.map(o=>({...o})));
  const [txns, setTxns] = useStateM(SEED_TRANSACTIONS.map(t=>({...t})));

  const go = (t) => {
    if (t==='settings') { setView('settings'); return; }
    if (t==='auth') { setAuthed(false); return; }
    setView(null); setTab(t);
  };
  const openSvc = (svc) => setView({ type:'config', svc });
  const openOrder = (o) => setView({ type:'live', order:o, replay:o.status!=='received' });

  const buy = (svc, cc, price) => {
    const number = genNumber(cc);
    const id = 'ORD-' + Math.floor(7742 + Math.random()*200);
    const order = { id, svc: svc.id, cc: cc.id, number, code:null, price, status:'waiting', age:'just now' };
    setBalance(b => Math.round((b - price)*100)/100);
    setOrders(os => [order, ...os]);
    setTxns(ts => [{ id:'TXN-'+id.slice(4), t:'purchase', label:`${svc.name} · ${cc.name}`, amt:-price, ref:id, when:'Just now' }, ...ts]);
    setView({ type:'live', order, fresh:true });
  };

  const liveDone = () => {
    // mark order received in list with whatever code (handled inside live screen on real flow)
    setView(null); setTab('orders');
  };
  const topup = (amt) => {
    setBalance(b => Math.round((b+amt)*100)/100);
    setTxns(ts => [{ id:'TXN-'+Math.floor(Math.random()*9999), t:'topup', label:'Wallet top-up', amt:+amt, ref:'MCRAPI · card', when:'Just now' }, ...ts]);
  };

  if (!authed) return <AuthScreen onAuth={()=>{ setAuthed(true); setTab('home'); }}/>;

  // overlay views (full screen, above tabs)
  if (view?.type === 'config')
    return <ConfigScreen svc={view.svc} balance={balance} go={go} onBuy={buy} tweaks={tweaks}/>;
  if (view?.type === 'live')
    return <LiveOrderScreen order={view.order} go={go} onDone={liveDone} tweaks={tweaks} pushToast={pushToast}/>;

  // main tabbed surface
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {view==='settings'
          ? <SettingsScreen balance={balance} go={go} tweaks={tweaks} pushToast={pushToast}/>
          : tab==='home'   ? <HomeScreen balance={balance} go={go} openSvc={openSvc} tweaks={tweaks}/>
          : tab==='browse' ? <BrowseScreen balance={balance} go={go} openSvc={openSvc}/>
          : tab==='orders' ? <OrdersScreen balance={balance} orders={orders} go={go} openOrder={openOrder}/>
          : <WalletScreen balance={balance} txns={txns} go={go} onTopup={topup} pushToast={pushToast}/>}
      </div>
      <TabBar tab={view==='settings'?'':tab} go={(t)=>{ setView(null); setTab(t); }}/>
    </div>
  );
}
window.MobileApp = MobileApp;

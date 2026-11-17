export function createExplorationUI(sections, { select, overview, close }) {
  const key = 'little-wilds-visited-v1';
  let saved=[];
  try { const value=JSON.parse(localStorage.getItem(key)||'[]'); if(Array.isArray(value)) saved=value.filter(i=>Number.isInteger(i)&&i>=0&&i<sections.length); } catch {}
  const visited=new Set(saved);
  const dock=document.createElement('nav');
  dock.className='project-dock'; dock.setAttribute('aria-label','作品分类快捷导航');
  const buttons=sections.map((section,index)=>{
    const button=document.createElement('button');button.type='button';
    button.textContent=section.short;button.onclick=()=>select(index);dock.append(button);return button;
  });
  const progress=document.createElement('span');progress.className='visit-progress';progress.setAttribute('role','status');dock.append(progress);
  const tools=document.createElement('div');tools.className='explore-tools';
  const reset=document.createElement('button');reset.textContent='↗ 全景复位';reset.onclick=overview;
  const help=document.createElement('button');help.textContent='? 玩法';
  tools.append(reset,help);
  const dialog=document.createElement('dialog');dialog.className='explore-guide';dialog.setAttribute('aria-labelledby','guide-title');
  dialog.innerHTML='<h2 id="guide-title">慢慢逛，随心看</h2><p>拖动场景旋转，滚轮或双指缩放。</p><p>点击地面让人物走过去；点击动物或底部分类，打开右侧作品。</p><p>点击「全景复位」回到初始视角。按 Esc 关闭详情或本指南。</p><p>各个场景展示同一组作品，已浏览记录在此浏览器保留。音乐可在右上角开关。</p><button type="button">知道了，继续逛</button>';
  help.onclick=()=>dialog.showModal();dialog.querySelector('button').onclick=()=>dialog.close();
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.open)close();});
  document.querySelector('main').append(dock,tools);document.body.append(dialog);
  function update(active=-1){buttons.forEach((b,i)=>{b.classList.toggle('active',active===i);b.classList.toggle('visited',visited.has(i));b.setAttribute('aria-pressed',String(active===i));b.setAttribute('aria-label',`${sections[i].short}${visited.has(i)?'，已打开':''}`);});progress.textContent=`已打开分类 ${visited.size} / ${sections.length}`;}
  update();
  return { update, visit(index){visited.add(index);try{localStorage.setItem(key,JSON.stringify([...visited]));}catch{}update(index);} };
}

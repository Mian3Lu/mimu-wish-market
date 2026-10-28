window.MimuCarousel = {
  init({esc,ic,openModal,getContent=kind=>window.MimuContent[kind],isAdmin=()=>false}) {
    const root=document.querySelector('#welcome'),slides=window.MimuContent.slides,track=document.querySelector('#heroSlides');
    let index=0,hover=false,focus=false,paused=false,touched=false,frame=0;
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    track.innerHTML=slides.map((s,i)=>`<section class="hero-slide" role="group" aria-roledescription="幻灯片" aria-label="${i+1} / 3"><p class="hero-eyebrow">${s.eyebrow}</p><h1>${esc(s.title).replace(/\n/g,'<br>')}</h1><p class="hero-description">${esc(s.description)}</p><button class="welcome-btn" data-action="${s.action}">${esc(s.button)} ${ic('arrow-right','sm')}</button></section>`).join('');
    const panels=Array.from(track.children),status=document.querySelector('#heroStatus');
    const sync=()=>{const width=track.clientWidth||1;index=Math.max(0,Math.min(slides.length-1,Math.round(track.scrollLeft/width)));panels.forEach((p,i)=>{p.inert=i!==index;p.setAttribute('aria-hidden',String(i!==index))});status.textContent=slides[index].eyebrow;};
    const show=n=>{index=(n+slides.length)%slides.length;track.scrollTo({left:index*track.clientWidth,behavior:motion.matches?'instant':'smooth'})};
    document.querySelector('#heroPrevious').onclick=()=>show(index-1);
    document.querySelector('#heroNext').onclick=()=>show(index+1);
    document.querySelector('#heroPause').onclick=e=>{paused=!paused;e.currentTarget.innerHTML=ic(paused?'play':'pause','sm');e.currentTarget.setAttribute('aria-label',paused?'开启自动轮播':'暂停自动轮播')};
    track.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(sync)},{passive:true});
    track.addEventListener('touchstart',()=>touched=true,{passive:true});track.addEventListener('touchend',()=>touched=false,{passive:true});track.addEventListener('touchcancel',()=>touched=false,{passive:true});
    root.addEventListener('mouseenter',()=>hover=true);root.addEventListener('mouseleave',()=>hover=false);
    root.addEventListener('focusin',()=>focus=true);root.addEventListener('focusout',e=>focus=root.contains(e.relatedTarget));
    root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(index+(e.key==='ArrowRight'?1:-1))}});
    new ResizeObserver(()=>{track.scrollTo({left:index*track.clientWidth,behavior:'instant'});sync()}).observe(track);
    setInterval(()=>{if(!paused&&!hover&&!focus&&!touched&&!motion.matches&&!document.hidden&&!root.classList.contains('hide')&&!document.querySelector('#modalRoot').classList.contains('is-open'))show(index+1)},6000);
    sync();
    return async kind=>{const list=await getContent(kind);if(!list)return;openModal(kind==='guide'?'新手使用指南':'市集公约',`${kind==='covenant'&&isAdmin()?`<div class="covenant-toolbar"><button class="outline-button" data-action="editCovenant">${ic('edit','sm')} 编辑市集公约</button></div>`:''}<div class="reading-content">${list.map(([h,p])=>`<section><h3>${esc(h)}</h3><p>${esc(p)}</p></section>`).join('')}</div>`,{type:kind})};
  }
};

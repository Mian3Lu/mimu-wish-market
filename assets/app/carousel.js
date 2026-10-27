window.MimuCarousel = {
  init({esc,ic,openModal}) {
    const root=document.querySelector('#welcome'),slides=window.MimuContent.slides;
    let index=0,hover=false,focus=false,paused=false,start=null;
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const body=document.querySelector('#heroSlides'), indicators=document.querySelector('#heroIndicators');
    body.innerHTML=slides.map((s,i)=>`<div class="hero-slide" ${i?'hidden':''} role="group" aria-roledescription="幻灯片" aria-label="${i+1} / 3"><p class="hero-eyebrow">${s.eyebrow}</p><h1>${esc(s.title).replace(/\n/g,'<br>')}</h1><p class="hero-description">${esc(s.description)}</p><button class="welcome-btn" data-action="${s.action}">${esc(s.button)} ${ic('arrow-right','sm')}</button><span class="hero-number" aria-hidden="true">${s.number}</span></div>`).join('');
    const show=n=>{index=(n+slides.length)%slides.length;body.querySelectorAll('.hero-slide').forEach((s,i)=>{s.hidden=i!==index});indicators.innerHTML=slides.map((s,i)=>`<button type="button" aria-label="第 ${i+1} 张" aria-current="${i===index}" data-slide="${i}">${String(i+1).padStart(2,'0')}</button>`).join('')};
    show(0);
    document.querySelector('#heroPrevious').onclick=()=>show(index-1);
    document.querySelector('#heroNext').onclick=()=>show(index+1);
    document.querySelector('#heroPause').onclick=e=>{paused=!paused;e.currentTarget.textContent=paused?'播放':'暂停';e.currentTarget.setAttribute('aria-label',paused?'开启自动轮播':'暂停自动轮播')};
    indicators.onclick=e=>{const b=e.target.closest('[data-slide]');if(b)show(Number(b.dataset.slide))};
    root.addEventListener('mouseenter',()=>hover=true);root.addEventListener('mouseleave',()=>hover=false);
    root.addEventListener('focusin',()=>focus=true);root.addEventListener('focusout',e=>{focus=root.contains(e.relatedTarget)});
    root.addEventListener('touchstart',e=>{start={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});
    root.addEventListener('touchend',e=>{if(!start)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))show(index+(dx<0?1:-1))},{passive:true});
    root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(index+(e.key==='ArrowRight'?1:-1))}});
    setInterval(()=>{if(!paused&&!hover&&!focus&&!motion.matches&&!document.hidden&&!root.classList.contains('hide')&&!document.querySelector('#modalRoot').classList.contains('is-open'))show(index+1)},6000);
    return kind=>{const list=window.MimuContent[kind];if(!list)return;openModal(kind==='guide'?'新手使用指南':'市集公约',`<div class="reading-content">${list.map(([h,p])=>`<section><h3>${esc(h)}</h3><p>${esc(p)}</p></section>`).join('')}</div>`,{type:kind})};
  }
};

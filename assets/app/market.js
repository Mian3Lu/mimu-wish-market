(()=>{'use strict';
// Supabase 配置
const SUPABASE_URL = 'https://issrxjtupbdahjbemkyy.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_zKfL0ufjfW5Iy0A1VJaDnw_-DA-Y0nX';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
let passwordRecoveryPending=false;
supabase.auth.onAuthStateChange(event=>{
  if(event==='PASSWORD_RECOVERY'){
    passwordRecoveryPending=true;
    setTimeout(showPasswordReset,0);
  }
});

const ICONS={
search:'<circle cx="11" cy="11" r="7.5"/><path d="m16.5 16.5 5 5"/>',x:'<path d="M18 6 6 18M6 6l12 12"/>',moon:'<path d="M20.5 14.7A8.6 8.6 0 0 1 9.3 3.5a8.8 8.8 0 1 0 11.2 11.2Z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',plus:'<path d="M12 5v14M5 12h14"/>','arrow-right':'<path d="M5 12h14m-6-6 6 6-6 6"/>','arrow-left':'<path d="M19 12H5m6 6-6-6 6-6"/>','arrow-up':'<path d="M12 19V5m-6 6 6-6 6 6"/>','chevron-right':'<path d="m9 18 6-6-6-6"/>','chevron-down':'<path d="m6 9 6 6 6-6"/>',heart:'<path d="M20.8 4.7a5.3 5.3 0 0 0-7.5 0L12 6l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 21l8.8-8.8a5.3 5.3 0 0 0 0-7.5Z"/>',home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1Z"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',bookmark:'<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',sliders:'<path d="M4 7h9m4 0h3M4 17h3m4 0h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',sparkles:'<path d="m12 2 2.1 6 6 2.1-6 2.1L12 18l-2.1-5.8L4 10.1l5.9-2.1L12 2Zm7 13 1 2.5L22 18l-2 1-1 2.5-1-2.5-2-1 2-1 1-2.5Z"/>',route:'<circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M8 5h6a5 5 0 0 1 0 10H9a4 4 0 0 0 0 8"/>','pen-line':'<path d="m12 19 9-9-7-7-9 9-2 9 9-2Z"/><path d="m10 7 7 7"/>','hand-heart':'<path d="M3 15v4l6 2h7l5-7c1-2-1-3-2-2l-4 4h-5"/><path d="M3 14h4l3-3h6c2 0 2 3 0 3h-5"/><path d="M15 4c1-2 5-1 5 2 0 2-5 5-5 5s-5-3-5-5c0-3 4-4 5-2Z"/>',brush:'<path d="m14 4 6 6-8 8-6-6 8-8Z"/><path d="M5 15c-2 0-3 1-3 3 0 3-1 4-1 4s2-1 4-1c2 0 3-1 3-3"/>','check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 3-3 6 6"/>',message:'<path d="M4 4h16v13H9l-5 4V4Z"/>',send:'<path d="m21 3-8 18-3-8-8-3 19-7Z"/><path d="M10 13 21 3"/>',location:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',external:'<path d="M13 5h6v6m0-6-9 9"/><path d="M19 13v6H5V5h6"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',check:'<path d="m4 12 5 5L20 6"/>','circle-dot':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',edit:'<path d="M12 20H4v-8l10-10 8 8-10 10Z"/><path d="m12 4 8 8"/>',trash:'<path d="M4 7h16m-3 0-1 14H8L7 7m2 0V4h6v3"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',filter:'<path d="M3 4h18l-7 8v7l-4 2v-9L3 4Z"/>'};
Object.assign(ICONS,{
 shield:'<path d="M12 2 21 6v6c0 5-3.5 8-9 10C6.5 20 3 17 3 12V6l9-4Z"/><path d="M12 8v5m0 3h.01"/>',
 'shield-check':'<path d="M12 2 21 6v6c0 5-3.5 8-9 10C6.5 20 3 17 3 12V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
 trash:'<path d="M4 7h16M10 4h4m-8 3 1 14h10l1-14M10 11v6m4-6v6"/>',
 flag:'<path d="M4 21V4m0 1c3-3 5 3 9 0s6 0 7 0v11c-4-3-6 0-9 0s-5-3-7 0"/>',
 'refresh-ccw':'<path d="M3 7v6h6M21 17v-6h-6M4.8 15a8 8 0 0 0 14.3 2M19.2 9A8 8 0 0 0 4.8 7"/>',
 lock:'<rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 'log-out':'<path d="M10 17l5-5-5-5m5 5H4m10-9h6a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-6"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
 'alert-triangle':'<path d="M12 3 2.4 20h19.2L12 3Z"/><path d="M12 9v5m0 3h.01"/>'
});
const ic=(name,cls='')=>`<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]||ICONS['circle-dot']}</svg>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanUrl=s=>{try{const u=new URL(String(s).trim());return u.protocol==='https:'&&!u.username&&!u.password&&u.href.length<=2000?u.href:''}catch{return''}};
const cleanImageUrl=s=>{const url=cleanUrl(String(s||'').trim());return url.startsWith('https://')?url:''};
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));

const PREVIEW_MODE=new URLSearchParams(location.search).get('preview')==='1';
const CATS=['全部','主题美化','世界书','App','心声','角色卡','其他'];
const COVER_ART=['chat','book','app','note','other','paper'];
const baseCategories=CATS.slice(1);
const categoryLabels=()=>{const all=[...new Set([...baseCategories,...(localData.posts||[]).map(p=>p.category),...(Array.isArray(localData.pref.customCats)?localData.pref.customCats:[])])],order=Array.isArray(localData.pref.categoryOrder)?localData.pref.categoryOrder:[],picked=order.filter(c=>all.includes(c));return[...picked,...all.filter(c=>!picked.includes(c))]};
const FILTERS=['全部状态','等待接单','已接单','制作中','已完成'];
const STATUS={open:{label:'等待接单',cls:'open'},claimed:{label:'已接单',cls:'claimed'},working:{label:'制作中',cls:'working'},done:{label:'已完成',cls:'done'}};
const palettes=['mint','pink','cream','blue','plum','sage','peach','charcoal'];

let currentUser=null;
let isAdminUser=false;
let lastCloudFetch=0;
let cloudError='',cloudUpgradeReady=false,profileDraft=null,cropTask=null;
let mineTab='posts',mineCategory='全部',mineStatus='全部状态',pageLimit=24;
let spoilerSession=null;
let localData={
  posts:[],
  likes:[],
  saved:[],
  favoriteDates:{},
  ownClaimHistory:[],commentHistory:[],
  likeDates:{},
  profile:{display_name:'',bio:'',avatar_path:'',cover_path:''},
  pref:JSON.parse(localStorage.getItem('mimu_pref')||'{"nickname":"","theme":"light"}'),
  reports:[],
  modLog:[]
};


const MAX_CLAIMS=3;

// 初始化云端用户及鉴权
async function initAuth(){
  if(PREVIEW_MODE){currentUser={id:'preview-user'};localData.pref.customCats=[...new Set([...['人设','表情包','聊天列表','教程','疑问'],...(localData.pref.customCats||[])])];return}
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if(sessionError) throw sessionError;
  let session = sessionData.session;
  if(!session){
    const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
    if(anonError) throw anonError;
    session = anonData.session;
  }
  if(!session?.user) throw new Error('Supabase 未返回有效会话');
  currentUser = session.user;
  if(currentUser.is_anonymous)isAdminUser=false;
  else await checkAdmin();
}

async function checkAdmin(){
  if(!currentUser){ isAdminUser=false; return; }
  const { data, error } = await supabase.from('admin_roles').select('user_id').eq('user_id', currentUser.id).maybeSingle();
  if(error) throw error;
  isAdminUser = !!data;
}

const isAdmin=()=>isAdminUser;

async function fetchCloudData(){
  if(PREVIEW_MODE){
    const now=Date.now(),demo=[
      {id:'preview-1',category:'人设',title:'想做一套温柔的人设卡片',body:'想要奶油色和浅粉色，放角色名字、头像和一句简介。',author:'小小想象家',authorId:'preview-user',art:'chat',palette:'pink',ratio:.82,cardStyle:'text',createdAt:new Date(now-3600000).toISOString(),likes:18,claims:[],comments:[],status:'open'},
      {id:'preview-2',category:'表情包',title:'求一组猫猫表情包',body:'聊天常用的开心、无语、晚安和谢谢，最好是透明底。',author:'松饼',authorId:'preview-author-2',art:'other',palette:'cream',ratio:.9,cardStyle:'text',createdAt:new Date(now-7200000).toISOString(),likes:9,claims:[],comments:[],status:'open'},
      {id:'preview-3',category:'聊天列表',title:'深色聊天列表美化',body:'希望头像边框和未读提示有一点紫色，整体简洁。',author:'匿名旅人',authorId:'preview-author-3',art:'chat',palette:'plum',ratio:.78,createdAt:new Date(now-14400000).toISOString(),likes:24,claims:[],comments:[],status:'open'},
      {id:'preview-4',category:'教程',title:'想要一个新手入门教程',body:'整理常用设置步骤，适合第一次接触主题美化的人。',author:'云朵收藏家',authorId:'preview-author-4',art:'book',palette:'blue',ratio:.86,createdAt:new Date(now-28800000).toISOString(),likes:12,claims:[],comments:[],status:'open'},
      {id:'preview-5',category:'疑问',title:'这个功能应该怎么设置？',body:'我想调整消息气泡宽度，但找不到对应的入口。',author:'柚子汽水',authorId:'preview-author-5',art:'note',palette:'sage',ratio:.8,createdAt:new Date(now-43200000).toISOString(),likes:6,claims:[],comments:[],status:'open'},
      {id:'preview-6',category:'世界书',title:'海边小镇世界书设定',body:'需要地点、人物关系和一些可继续扩写的故事钩子。',author:'小岛来信',authorId:'preview-author-6',art:'book',palette:'mint',ratio:.84,createdAt:new Date(now-86400000).toISOString(),likes:31,claims:[],comments:[],status:'open'}
    ];
    demo[0].isSpoiler=true;
    const extras=localData.preview.demoPosts||[];
    localData.profile=localData.preview.profile||{display_name:'匿名旅人',bio:'把小小的灵感，留在这里。',avatar_path:'',cover_path:''};
    localData.pref.nickname=localData.profile.display_name;
    localData.posts=[...extras,...demo].filter(p=>!(localData.preview.hidden||[]).includes(p.id)).map(p=>({...p,...(localData.preview.posts?.[p.id]||{})}));localData.reports=[];localData.likes=localData.preview.likes||[];localData.saved=localData.preview.saved||[];lastCloudFetch=Date.now();return;
  }
  try {
    const {data:sessionData,error:sessionError}=await supabase.auth.getSession();if(sessionError)throw sessionError;
    const sessionUser=sessionData.session?.user;if(sessionUser?.id!==currentUser?.id){currentUser=sessionUser;isAdminUser=false;localData.profile={};localData.saved=[];localData.likes=[];localData.posts=[];closeModal();if(currentUser)await checkAdmin()}
    if(!currentUser?.id)throw Error('尚未建立身份，请重试连接');
    const [postsRes, claimsRes, privateClaimsRes, commentsRes, likesRes, reportsRes, favoritesRes, profileRes, historyRes] = await Promise.all([
      fetchRows('post_feed'),
      fetchRows('claim_feed'),
      fetchRows('claims', q=>q.eq('creator_id',currentUser.id)),
      fetchRows('comments', q=>q.eq('author_id',currentUser.id)),
      fetchRows('likes', q=>q.eq('user_id',currentUser.id)),
      isAdminUser?fetchRows('reports'):Promise.resolve({data:[]}),
      fetchRows('favorites', q=>q.eq('user_id',currentUser.id)),
      supabase.from('profiles').select('*').eq('user_id',currentUser.id).maybeSingle(),
      supabase.rpc('my_market_history')
    ]);
    for(const response of [postsRes,claimsRes,privateClaimsRes,commentsRes,likesRes,reportsRes,favoritesRes,profileRes,historyRes])if(response.error)throw response.error;
    localData.ownClaimHistory=historyRes.data?.claims||[];localData.commentHistory=historyRes.data?.comments||[];
    cloudUpgradeReady=true;cloudError='';
    localData.profile=profileRes.data||{display_name:'',bio:'',avatar_path:'',cover_path:''};
    localData.pref.nickname=localData.profile.display_name||'';
    await hydrateProfileMedia();
    localData.saved=(favoritesRes.data||[]).map(x=>x.post_id);
    localData.favoriteDates=Object.fromEntries((favoritesRes.data||[]).map(x=>[x.post_id,x.created_at]));
    localData.likeDates=Object.fromEntries((likesRes.data||[]).map(x=>[x.post_id,x.created_at]));

    const claimsMap = {};
    const privateClaims = new Map((privateClaimsRes.data || []).map(c=>[c.uid,c]));
    for (const c of claimsRes.data || []) {
      if(!claimsMap[c.post_id]) claimsMap[c.post_id] = [];
      const privateClaim=privateClaims.get(c.uid);
      let media = privateClaim?.media ?? c.media;
      if(media?.method==='upload'&&media?.bucket==='claim-media'&&media?.src){
        const {data,error}=await supabase.storage.from('claim-media').createSignedUrl(media.src,3600);
        media={...media,src:error?'':data?.signedUrl||''};
      }
      claimsMap[c.post_id].push({
        uid: c.uid,
        id: privateClaim?.creator_id===currentUser.id ? currentUser.id : null,
        name: privateClaim?.name ?? c.name,
        note: privateClaim?.note ?? c.note,
        date: c.created_at,
        status: c.status,
        hiddenBeforeDone: c.hidden_before_done,
        media,
        delivery: privateClaim?.delivery ?? c.delivery
      });
    }

    const commentsMap = {};
    (commentsRes.data || []).filter(co=>!co.is_deleted).forEach(co => {
      if(!commentsMap[co.post_id]) commentsMap[co.post_id] = [];
      commentsMap[co.post_id].push({
        id: co.id,
        author: co.author,
        authorId: co.author_id,
        text: co.text,
        media: co.media,
        date: co.created_at
      });
    });

    const userLikes = [];
    (likesRes.data || []).forEach(l => {
      userLikes.push(l.post_id);
    });

    localData.likes = userLikes;
    localData.reports = reportsRes.data || [];

    localData.posts = (postsRes.data || []).map(p => {
      const pClaims = claimsMap[p.id] || [];
      const pComments = commentsMap[p.id] || [];
      const localRaw={},local=localRaw.cardStyle==='solid'?{...localRaw,cardStyle:'text'}:localRaw;
      return {
        id: p.id,
        category: local.category||p.category,
        title: local.title||p.title,
        body: local.body||p.body,
        author: local.author||p.author_name,
        authorId: p.is_mine?currentUser.id:null,
        isSpoiler:!!p.is_spoiler,
        isDeleted:!!p.is_deleted,
        ratio: p.ratio || 0.82,
        coverImage: local.coverImage??p.cover_image??'',
        cardStyle: local.cardStyle||(p.art==='text'?'text':p.card_style||(p.cover_image?'image':'art')),
        art: COVER_ART.includes(local.art)?local.art:(COVER_ART.includes(p.art)?p.art:'other'),
        palette: palettes.includes(local.palette)?local.palette:(palettes.includes(p.palette)?p.palette:'pink'),
        createdAt: p.created_at,
        likes: p.likes_count || 0,
        claims: pClaims,
        comments: pComments,
        status: p.status,
        claim: pClaims[0] || null,
        delivery: pClaims.find(c => c.status === 'done' && c.delivery)?.delivery || null
      };
    });
    lastCloudFetch=Date.now();
  } catch(e) {
    cloudError=e.message||'连接失败';console.error('获取云端数据失败:',e);
  }
}

function claimsOf(p){ return p.claims || []; }
function ownedClaim(p){ return claimsOf(p).find(c => c.id === currentUser?.id); }
function claimBy(p, uid){ return claimsOf(p).find(c => c.uid === uid); }

function imgSrc(v){if(typeof v!=='string')return '';const url=cleanUrl(v);return url||(/^data:image\/(webp|png|jpeg);base64,[a-z0-9+/=]+$/i.test(v)?v:'')}
function mediaHtml(media){const src=imgSrc(media?.src);if(!src)return '';return `<figure class="attachment-image"><img src="${esc(src)}" alt="留言附带的图片" loading="lazy"><figcaption>${media?.method==='url'?'图片链接':'云端上传图片'}</figcaption></figure>`}

let state={view:'feed',cat:'全部',status:'全部状态',filtersOpen:false,query:'',modal:null,upload:null,coverUrl:'',attachments:{claim:null,comment:null},mediaModes:{claim:'upload',comment:'upload'},selectCat:'主题美化',art:'chat',palette:'pink',cardStyle:'text',lastFocus:null};

async function fetchRows(table,modify=q=>q){
  const rows=[];for(let offset=0;;offset+=500){const {data,error}=await modify(supabase.from(table).select('*')).order(table==='claims'?'uid':table==='claim_feed'?'uid':table==='profiles'?'user_id':table==='likes'||table==='favorites'?'post_id':'id').range(offset,offset+499);if(error)return{error};rows.push(...data);if(data.length<500)return{data:rows}}
}
function saveLocalPref(){
  try{localStorage.setItem('mimu_pref',JSON.stringify(localData.pref))}catch(e){}
}
function saveLocalPreview(){try{if(PREVIEW_MODE){localData.preview.likes=localData.likes;localData.preview.saved=localData.saved;localData.preview.profile=localData.profile;}localStorage.setItem('mimu_local_preview',JSON.stringify(localData.preview||{posts:{},hidden:[]}));localStorage.setItem('mimu_categories',JSON.stringify(localData.pref.customCats||[]))}catch(e){}}
function previewData(){try{const value=JSON.parse(localStorage.getItem('mimu_local_preview')||'{"posts":{},"hidden":[]}');return value&&typeof value==='object'?{posts:value.posts&&typeof value.posts==='object'?value.posts:{},hidden:Array.isArray(value.hidden)?value.hidden.filter(x=>typeof x==='string'):[],demoPosts:Array.isArray(value.demoPosts)?value.demoPosts:[],likes:Array.isArray(value.likes)?value.likes:[],saved:Array.isArray(value.saved)?value.saved:[],profile:value.profile||null}:{posts:{},hidden:[]}}catch{return{posts:{},hidden:[]}}}
localData.preview=previewData();
try{const cats=JSON.parse(localStorage.getItem('mimu_categories')||'[]');localData.pref.customCats=Array.isArray(cats)?cats.filter(c=>typeof c==='string'&&!baseCategories.includes(c)).slice(0,30):[]}catch{localData.pref.customCats=[]}

function toast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;$('#toastHost').appendChild(t);setTimeout(()=>{t.remove()},3000)}

const dateText=s=>{const dif=Math.max(0,Date.now()-new Date(s).getTime());let m=Math.floor(dif/60000);if(m<1)return'刚刚';if(m<60)return m+' 分钟前';if(m<1440)return Math.floor(m/60)+' 小时前';if(m<10080)return Math.floor(m/1440)+' 天前';return new Date(s).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'})};
const absoluteDate=s=>new Date(s).toLocaleString('zh-CN',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
const postBy=id=>localData.posts.find(x=>x.id===id);
const currentName=()=>localData.pref.nickname.trim()||'匿名旅人';
const avatarColor=name=>{const arr=['#f4dae0','#dbead8','#dadfe9','#f0e6d0','#e3d9e8'];let h=0;for(const c of String(name||''))h=(h*31+c.charCodeAt(0))>>>0;return arr[h%arr.length]};
function avatar(name,large=''){const n=String(name||'匿'),src='';return`<span class="avatar ${large}" style="--avatar:${avatarColor(n)}">${src?`<img src="${esc(src)}" alt="${esc(n)}的头像">`:esc(n.slice(0,1))}</span>`}

function poster(p){
  if(p.isSpoiler&&(p.forceList||spoilerSession!==p.id))return `<div class="spoiler-cover">${ic('eye','lg')}<strong>暴雷帖</strong><small>确认后查看正文与图片</small></div>`;
  if(p.cardStyle==='text'){
    const value=String(p.title||p.body||'分享'),text=Array.from(value).slice(0,8).join('');
    const palette=palettes.includes(p.palette)?p.palette:'pink';
    return `<div class="text-poster theme-${palette}"><span class="text-poster-category">${esc(p.category)}</span><strong title="${esc(value)}">${esc(text)}${Array.from(value).length>8?'…':''}</strong></div>`;
  }
  if(imgSrc(p.coverImage))return`<img src="${esc(imgSrc(p.coverImage))}" alt="${esc(p.title)}的封面" loading="lazy">`;
  return posterArtwork(p);
}
function posterArtwork(p){
  const pal=palettes.includes(p.palette)?p.palette:'pink',art=['chat','book','app','note','other','paper'].includes(p.art)?p.art:'other',top=`<div class="artwork theme-${pal}"><span class="art-noise"></span>`;
  if(art==='chat')return`${top}<div class="art-chat-big">Dear<br>you.</div><div class="art-sticker"></div><div class="art-chat-phone"><div class="art-chat-header"></div><div class="art-bubbles"><div class="art-bubble"></div><div class="art-bubble"></div><div class="art-bubble"></div><div class="art-bubble"></div><div class="art-bubble"></div></div></div><span class="art-chat-foot">SOFT CONVERSATIONS</span></div>`;
  if(art==='book'||art==='paper')return`${top}<div class="art-book-page"><span class="art-book-num">M I M U · A R C H I V E</span><span class="art-book-line"></span><span class="art-book-name">${art==='book'?'The<br>Untold<br>Story':'A little<br>Poetry'}</span><span class="art-book-desc">${art==='book'?'每 一个 世 界 都 值 得 被 看 见':'一 点 旧 时 光 的 美 好'}</span><span class="art-book-line"></span><span class="art-book-num">VOLUME 0${(String(p.title||'').length%8)+1}</span></div></div>`;
  if(art==='app')return`${top}<span class="art-app-title">Little<br>studio.</span><div class="art-app-screen"><div class="art-app-uihead"></div><div class="art-app-panel"></div><div class="art-app-panel small"></div><div class="art-app-row"><div class="art-app-tile"></div><div class="art-app-tile"></div></div><div class="art-app-footer"><i></i><i></i><i></i></div></div><span class="art-app-topcorner">MIMU DIGITAL GOODS</span></div>`;
  if(art==='note')return`${top}<div class="art-note-paper"><span class="art-note-quote">to be<br>gentle.</span><span class="art-note-cn">好 好 生 活<br>慢 慢 想 象</span><span class="art-note-tail">notes to myself</span></div></div>`;
  return`${top}<div class="art-other-dot"></div><div class="art-other-card">made<br>with love</div><span class="art-other-copy">A SMALL AND LOVELY IDEA</span></div>`;
}
function hydrateIcons(where=document){where.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=ic(el.getAttribute('data-icon'))})}
function changeTheme(){const t=document.documentElement.dataset.theme==='dark'?'light':'dark';setTheme(t);toast(t==='dark'?'夜间模式已开启':'已切换为日间模式')}
function setTheme(t){document.documentElement.dataset.theme=t;localData.pref.theme=t;document.querySelector('meta[name="theme-color"]').content=t==='dark'?'#121212':'#fafafa';$('#themeToggle').innerHTML=ic(t==='dark'?'sun':'moon');$('#themeToggle').setAttribute('aria-label',t==='dark'?'切换日间模式':'切换夜间模式');saveLocalPref()}

const NAV=[['feed','home','逛市集'],['progress','clock','接单进度'],['saved','bookmark','我的收藏'],['mine','user','我的']];
function renderNav(){
  const n=$('#sideNav');
  n.innerHTML=NAV.map(([view,icon,text])=>`<button class="left-link ${state.view===view?'active':''}" data-view="${view}">${ic(icon)}${text}</button>`).join('')+(isAdmin()?`<button class="left-link admin-link" data-action="adminDashboard">${ic('shield-check')}管理后台 <em>${localData.reports.filter(r=>!r.resolved).length} 待处理</em></button>`:'');
  $('#bottomNav').innerHTML=`<button class="tab-item ${state.view==='feed'?'active':''}" data-view="feed">${ic('home')}<span>首页</span></button><button class="tab-item ${state.view==='progress'?'active':''}" data-view="progress">${ic('clock')}<span>进度</span></button><button class="tab-post" data-action="create" aria-label="发布愿望"><span class="tab-post-inner">${ic('plus','lg')}</span></button><button class="tab-item ${state.view==='saved'?'active':''}" data-view="saved">${ic('bookmark')}<span>收藏</span></button><button class="tab-item ${state.view==='mine'?'active':''}" data-view="mine">${ic('user')}<span>我的</span></button>`
}

function renderCats(){const c=$('#categoryTabs');c.innerHTML=['全部',...categoryLabels()].map(cat=>`<button role="tab" aria-selected="${state.cat===cat}" class="category-pill ${state.cat===cat?'active':''}" data-category="${esc(cat)}">${esc(cat)}</button>`).join('')}
function renderStatus(){const wrapper=$('#statusFilters');wrapper.classList.toggle('hide',!state.filtersOpen);$('#toggleFilters').classList.toggle('is-on',state.filtersOpen||state.status!=='全部状态');wrapper.innerHTML=FILTERS.map(f=>`<button class="filter-chip ${state.status===f?'active':''}" data-status="${f}">${f}</button>`).join('')}

function filtered(){
  const q=state.query.trim().toLocaleLowerCase();
  const picked=localData.posts.filter(p=>{
    if(p.isDeleted&&!(state.view==='mine'&&['posts','claims','comments','saved','likes'].includes(mineTab)))return false;
    if(state.cat!=='全部'&&p.category!==state.cat)return false;
    if(state.view==='progress'&&p.status==='open')return false;
    if(state.view==='saved'&&!localData.saved.includes(p.id))return false;
    if(state.view==='mine'){if(mineCategory!=='全部'&&p.category!==mineCategory)return false;if(mineStatus!=='全部状态'&&(mineTab==='claims'?STATUS[ownedClaim(p)?.status]?.label:STATUS[p.status]?.label)!==mineStatus)return false;if(mineTab==='posts'&&p.authorId!==currentUser?.id)return false;if(mineTab==='claims'&&!ownedClaim(p))return false;if(mineTab==='saved'&&!localData.saved.includes(p.id))return false;if(mineTab==='likes'&&!localData.likes.includes(p.id))return false;if(mineTab==='comments'&&!(p.comments||[]).some(c=>c.authorId===currentUser?.id))return false;}
    if(state.status!=='全部状态'&&STATUS[p.status].label!==state.status)return false;
    if(q&&!(`${p.title} ${p.isSpoiler?'':p.body} ${p.category} ${p.author} ${claimsOf(p).filter(c=>!p.isSpoiler&&(!c.hiddenBeforeDone||c.status==='done'||c.id===currentUser?.id)).map(c=>c.name).join(' ')}`.toLocaleLowerCase().includes(q)))return false;
    return true;
  });
  const date=p=>state.view==='saved'||(state.view==='mine'&&mineTab==='saved')?localData.favoriteDates[p.id]||p.createdAt:state.view==='mine'&&mineTab==='likes'?localData.likeDates[p.id]||p.createdAt:state.view==='mine'&&mineTab==='claims'?ownedClaim(p)?.date||p.createdAt:p.createdAt;return picked.sort((a,b)=>new Date(date(b))-new Date(date(a)));
}

function renderCard(p,i){
  const likes=p.likes;
  const s=STATUS[p.status];
  const liked=localData.likes.includes(p.id);
  return`<article class="post-card" tabindex="0" role="button" aria-label="查看帖子：${esc(p.title)}" data-action="open" data-id="${esc(p.id)}" style="--delay:${Math.min(i*24,210)}ms"><div class="post-cover ${p.coverImage&&p.cardStyle!=='text'?'is-image-cover':''}" style="--ratio:${p.ratio||.82}">${poster({...p,isSpoiler:p.isSpoiler,forceList:true})}${p.cardStyle==='text'?'':`<span class="corner-label">${esc(p.category)}</span>`}${p.status==='done'?`<span class="card-complete">${ic('check','sm')} 已完成</span>`:''}</div><div class="card-body"><h3 class="card-title">${esc(p.title)}</h3>${p.isSpoiler?`<span class="spoiler-label">${ic('eye','sm')} 暴雷帖 · 确认后查看</span>`:`<p class="card-excerpt">${esc(p.body)}</p>`}<div class="post-meta"><div class="author-row">${avatar(p.author)}<span class="author-name">${esc(p.author)}</span></div><button type="button" data-action="like" data-id="${esc(p.id)}" class="card-like ${liked?'is-liked':''}" aria-label="${liked?'取消喜欢':'喜欢'}">${ic('heart')}<span>${likes}</span></button></div><div class="card-extra"><span class="status-mini ${s.cls}">${ic(p.status==='done'?'check-circle':p.status==='open'?'circle-dot':'clock','sm')}${s.label}${claimsOf(p).length?` · ${claimsOf(p).length}/${MAX_CLAIMS}人接单`:''}</span><time class="card-time" datetime="${esc(p.createdAt)}">${dateText(p.createdAt)}</time></div></div></article>`
}

function renderStats(){
  const n=localData.posts.length;
  const done=localData.posts.filter(p=>p.status==='done').length;
  const doing=localData.posts.filter(p=>p.status==='working'||p.status==='claimed').length;
  $('#statsBox').innerHTML=`<div><div class="stat-num">${n}</div><div class="stat-label">收集到的愿望</div></div><div><div class="stat-num">${done}</div><div class="stat-label">已经实现</div></div><div><div class="stat-num">${doing}</div><div class="stat-label">正在被制作</div></div><div><div class="stat-num">${localData.posts.filter(p=>p.status==='open').length}</div><div class="stat-label">等待灵感认领</div></div>`
}

// Measure natural card heights; each card stays in one grid cell instead of a CSS column fragment.
let feedLayoutFrame=0;
function layoutFeed(){
  const feed=$('#feed'),gap=parseFloat(getComputedStyle(feed).getPropertyValue('--card-gap'))||0;
  feed.querySelectorAll('.post-card').forEach(card=>{card.style.gridRowEnd=`span ${Math.ceil(card.offsetHeight+gap)}`});
}
function scheduleFeedLayout(){cancelAnimationFrame(feedLayoutFrame);feedLayoutFrame=requestAnimationFrame(layoutFeed)}
const feedCardObserver=typeof ResizeObserver==='function'?new ResizeObserver(scheduleFeedLayout):null;
function observeFeedCards(){
  feedCardObserver?.disconnect();
  $('#feed').querySelectorAll('.post-card').forEach(card=>feedCardObserver?.observe(card));
  layoutFeed();
}
window.addEventListener('resize',scheduleFeedLayout,{passive:true});
$('#feed').addEventListener('load',scheduleFeedLayout,true);

async function render(refresh=true){
  if(refresh){$('#resultCount').textContent='正在加载…';$('#feed').setAttribute('aria-busy','true')}

  if(PREVIEW_MODE)$('#previewBanner').hidden=false;
  if(refresh)await fetchCloudData();
  $('#feed').setAttribute('aria-busy','false');
  renderAdminState();
  renderNav();
  renderCats();
  renderStatus();
  renderStats();
  $('#welcome').classList.toggle('hide',state.view!=='feed'||state.cat!=='全部'||!!state.query);
  const labels={feed:state.cat==='全部'?'最新愿望':state.cat,progress:'接单进度',saved:'我的收藏',mine:'我的足迹'};
  $('#feedTitle').innerHTML=`${esc(labels[state.view]||'最新愿望')} <span>${state.view==='feed'?'new arrivals':{progress:'work in progress',saved:'your favorites',mine:'my little corner'}[state.view]}</span>`;
  const profileMode=state.view==='mine';
  if(!profileMode)$('#profileFilters')?.remove();
  $('#profilePage').classList.toggle('hide',!profileMode);
  if(profileMode)renderProfilePage();
  $('.feed-heading').classList.toggle('hide',profileMode);
  $('#statusFilters').classList.toggle('hide',profileMode||!state.filtersOpen);
  const posts=filtered();
  $('#feed').classList.toggle('activity-feed',profileMode&&mineTab!=='posts');
  $('#resultCount').textContent=`共 ${posts.length} 条愿望 · ${state.view==='saved'||(profileMode&&mineTab==='saved')?'按最近收藏排序':'按时间从新到旧'}`;
  if(cloudError&&!PREVIEW_MODE){$('#feed').innerHTML=`<div class="feed-message"><strong>暂时无法加载市集</strong><p>${esc(cloudError)}</p><p>新版需先完成数据库迁移。已有云端数据不会被本机预览覆盖。</p><button class="outline-button" data-action="retryCloud">重新连接</button></div>`;return;}
  if(profileMode&&mineTab==='comments')renderCommentHistory(posts);
  else if(profileMode&&mineTab==='claims')renderClaimHistory(posts);
  else if(profileMode&&(mineTab!=='posts'||posts.some(p=>p.isDeleted)))$('#feed').innerHTML=posts.length?posts.slice(0,pageLimit).map(p=>activityRow(p,mineTab)).join(''):emptyProfile();
  else $('#feed').innerHTML=posts.length?posts.slice(0,pageLimit).map(renderCard).join(''):`<div class="empty-board" style="column-span:all"><div class="empty-icon">${ic(state.view==='saved'?'bookmark':'sparkles','lg')}</div><h3>${state.view==='saved'?'还没有收藏的愿望':'暂时没有符合条件的愿望'}</h3><p>可以换个分类，或投递一个小愿望。</p><button data-action="create">发布愿望</button></div>`;
  $('#morePosts')?.remove();
  if(posts.length>pageLimit&&!(profileMode&&['comments','claims'].includes(mineTab)))$('#feed').insertAdjacentHTML('afterend','<button id="morePosts" class="load-more" data-action="loadMore">加载更多</button>');

  hydrateIcons();
  observeFeedCards();
}

function setView(v){$('#profileFilters')?.remove();pageLimit=24;spoilerSession=null;state.view=v;state.cat='全部';state.status='全部状态';state.filtersOpen=false;state.query='';$('#searchInput').value='';$('#clearSearch').style.display='none';render(false);window.scrollTo({top:0,behavior:'smooth'})}
function setCat(cat){pageLimit=24;$('#profileFilters')?.remove();state.cat=cat;state.view='feed';state.status='全部状态';render(false);$('#categoryTabs').querySelector('.active')?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});window.scrollTo({top:0,behavior:'smooth'})}

async function like(id){
  if(PREVIEW_MODE){const p=postBy(id);if(!p)return;const i=localData.likes.indexOf(id);if(i>=0)localData.likes.splice(i,1);else localData.likes.push(id);p.likes=Math.max(0,p.likes+(i>=0?-1:1));localData.preview.posts[id]={...p};saveLocalPreview();await render(false);if(state.modal?.type==='detail')detail(id,true);return;}

  const liked = localData.likes.includes(id);
  const p = postBy(id);
  if(!p) return;
  if(liked){
    const {error}=await supabase.from('likes').delete().eq('post_id', id).eq('user_id', currentUser.id);
    if(error)return toast('取消点赞失败：'+error.message);
  } else {
    const {error}=await supabase.from('likes').insert({ post_id: id });
    if(error)return toast('点赞失败：'+error.message);
  }
  await render();
  if(state.modal?.type==='detail'&&state.modal.id===id) detail(id,true);
}

async function favorite(id){
  const saved=localData.saved.includes(id);
  if(!PREVIEW_MODE){const result=saved?await supabase.from('favorites').delete().eq('post_id',id).eq('user_id',currentUser.id):await supabase.from('favorites').insert({post_id:id});if(result.error)return toast('收藏更新失败：'+result.error.message);}
  if(saved)localData.saved=localData.saved.filter(x=>x!==id);else{localData.saved.unshift(id);localData.favoriteDates[id]=new Date().toISOString()}
  if(PREVIEW_MODE)saveLocalPreview();
  await render(false);toast(saved?'已取消收藏':'已加入我的收藏');
  if(state.modal?.type==='detail')detail(id,true);
}

let lockedPageY=null;
function syncModalViewport(){
  const root=$('#modalRoot');if(!root.classList.contains('is-open'))return;
  const viewport=window.visualViewport;
  root.style.setProperty('--modal-viewport-height',`${viewport?.height||window.innerHeight}px`);
  root.style.setProperty('--modal-viewport-top',`${viewport?.offsetTop||0}px`);
}
window.visualViewport?.addEventListener('resize',syncModalViewport,{passive:true});
window.visualViewport?.addEventListener('scroll',syncModalViewport,{passive:true});
window.addEventListener('resize',syncModalViewport,{passive:true});
function lockModalPage(){
  if(lockedPageY!==null)return;
  lockedPageY=window.scrollY;
  document.body.style.setProperty('--locked-page-top',`${-lockedPageY}px`);
  document.body.classList.add('modal-page-locked');
}
function unlockModalPage(){
  if(lockedPageY===null)return;
  const pageY=lockedPageY;lockedPageY=null;
  document.body.classList.remove('modal-page-locked');
  document.body.style.removeProperty('--locked-page-top');
  window.scrollTo({top:pageY,behavior:'instant'});
}
function openModal(title,body,meta){state.lastFocus=document.activeElement;state.modal=meta||{type:'misc'};$('#modalTitle').textContent=title;$('#modalBody').innerHTML=body;$('#modalRoot').classList.toggle('is-detail',state.modal.type==='detail');$('#modalRoot').classList.add('is-open');lockModalPage();setBackgroundInert(true);syncModalViewport();$('.close-modal')?.focus({preventScroll:true});hydrateIcons($('#modalBody'));$('.close-modal')?.focus({preventScroll:true})}
function updateModal(title,body,meta){if(meta?.id&&state.modal?.id&&meta.id!==state.modal.id)spoilerSession=null;state.modal=meta||state.modal;$('#modalTitle').textContent=title;$('#modalBody').innerHTML=body;$('#modalRoot').classList.toggle('is-detail',state.modal.type==='detail');$('#modalBody').scrollTop=0;hydrateIcons($('#modalBody'));$('.close-modal')?.focus({preventScroll:true})}
function updateOrOpen(title,body,meta){if($('#modalRoot').classList.contains('is-open'))updateModal(title,body,meta);else openModal(title,body,meta)}
function closeModal(){spoilerSession=null;if(!$('#modalRoot').classList.contains('is-open'))return;$('#modalRoot').classList.remove('is-open','is-detail');document.activeElement?.blur?.();$('#modalBody').innerHTML='';unlockModalPage();setBackgroundInert(false);state.upload=null;state.modal=null;state.lastFocus?.focus?.({preventScroll:true})}

const timeline=p=>{const steps=['open','claimed','working','done'];const index=steps.indexOf(p.status);return`<div class="timeline">${['等待接单','已接单','制作中','已完成'].map((title,i)=>`<div class="timeline-step ${i<=index?'passed':''}">${title}</div>`).join('')}</div>`};

function attachmentComposer(kind,compact=false){
  const c=kind==='claim'?'claim':'comment';
  const mode=state.mediaModes[c]||'upload';
  return`<div class="attach-composer ${compact?'compact':''}"><div class="attach-top">${ic('image','sm')} <strong>添加图片</strong><span>可选 · 上传或粘贴 URL</span></div><div class="attach-tabs"><button type="button" data-action="mediaMode" data-kind="${c}" data-mode="upload" class="attach-tab ${mode==='upload'?'active':''}">${ic('image','sm')} 本地上传</button><button type="button" data-action="mediaMode" data-kind="${c}" data-mode="url" class="attach-tab ${mode==='url'?'active':''}">${ic('external','sm')} 图片 URL</button></div><label class="attach-file ${mode==='upload'?'':'hide'}" data-attach-panel="${c}-upload">${ic('plus','sm')} 选择聊天截图 / 参考图 <small>最大 12 MB · 自动压缩</small><input type="file" data-image-input="${c}" accept="image/*"></label><div class="attach-url ${mode==='url'?'':'hide'}" data-attach-panel="${c}-url"><input name="mediaUrl" type="url" maxlength="2000" data-image-url="${c}" placeholder="https://example.com/picture.jpg"><small>请填可直接打开图片的 HTTPS 链接</small></div><div class="attach-preview hide" data-attach-preview="${c}"><img alt="图片预览"><button type="button" data-action="removeMedia" data-kind="${c}" aria-label="移除图片">${ic('x','sm')} 移除</button></div></div>`
}

function isClaimVisible(c){return !c.hiddenBeforeDone||c.status==='done'||c.id===currentUser?.id||isAdmin()}

function claimMarkup(p,c){
  const owned=c.id===currentUser?.id, visible=isClaimVisible(c), status=STATUS[c.status]||STATUS.claimed;
  return `<section class="claim-block claim-block-v3"><div class="claim-head"><span class="claim-owner">${visible?`由 <strong>${esc(c.name)}</strong> 接单`:'一位创作者已接单'} ${owned?'<span class="mini-badge">我接的单</span>':''}</span><time class="claim-time">${dateText(c.date)}</time></div><div class="claim-state-row"><span class="mini-badge status-${status.cls}">${status.label}</span>${c.hiddenBeforeDone&&c.status!=='done'?`<span class="privacy-tag">${ic('eye','sm')} ${visible?'完成前隐藏署名':'完成后公开创作者信息'}</span>`:''}</div>${visible?`<p>${esc(c.note)}</p>${mediaHtml(c.media)}${c.delivery&&c.status==='done'?`<div class="delivery-box claim-delivery"><strong>${ic('check-circle','sm')} 文件已就位</strong><p>${esc(c.delivery.location||'')}</p>${c.delivery.url?`<a href="${esc(cleanUrl(c.delivery.url))}" target="_blank" rel="noopener noreferrer">${ic('external','sm')} 查看文件 / 文件夹</a>`:''}${c.delivery.note?`<p>${esc(c.delivery.note)}</p>`:''}</div>`:''}`:`<p class="private-note">接单说明与图片将在该创作者完成作品后公开，取消接单也不会显示昵称。</p>`}${owned?`<div class="claim-own-tools"><button type="button" class="primary-button" data-action="editClaimStatus" data-id="${esc(p.id)}" data-uid="${esc(c.uid)}">${ic('edit','sm')} 修改进度 / 文件位置</button><button type="button" class="outline-button" data-action="unclaim" data-id="${esc(p.id)}" data-uid="${esc(c.uid)}">撤回接单</button></div>`:''}${isAdmin()?`<button class="admin-remove-claim" data-action="modRemoveClaim" data-id="${esc(p.id)}" data-uid="${esc(c.uid)}">${ic('trash','sm')} 管理员移除该接单</button>`:''}</section>`;
}

async function detail(id,refresh=true){
  if(refresh&&Date.now()-lastCloudFetch>30000)await fetchCloudData();
  const p=postBy(id);if(!p)return toast('帖子已删除或暂时不可访问');
  if(p.isSpoiler&&spoilerSession!==id)return spoilerPrompt(id);
  if(!PREVIEW_MODE&&refresh){try{await loadDetail(p)}catch(e){return toast('详情加载失败：'+e.message)}}
  const s=STATUS[p.status],mine=!!ownedClaim(p),liked=localData.likes.includes(id),saved=localData.saved.includes(id);
  const n=claimsOf(p).length,free=n<MAX_CLAIMS;
  state.attachments.comment=null;state.mediaModes.comment='upload';
  const comments=(p.comments||[]).map(c=>`<div class="comment" id="comment-${esc(c.id)}">${avatar(c.author)}<div class="comment-content"><strong>${esc(c.author)}</strong><small>${dateText(c.date)}</small>${c.text?`<p>${linkedText(c.text)}</p>`:''}${mediaHtml(c.media)}</div>${isAdmin()||c.authorId===currentUser?.id?`<button class="mod-comment-remove" type="button" title="删除该留言" aria-label="删除该留言" data-action="modDeleteComment" data-id="${esc(p.id)}" data-comment="${esc(c.id)}">${ic('trash')}</button>`:''}</div>`).join('');
  const author=p.authorId===currentUser?.id?`<span class="mini-badge">我发布的</span>`:'';const ownerTools=p.authorId===currentUser?.id?`<div class="claim-own-tools"><button class="outline-button" data-action="editOwnPost" data-id="${esc(id)}">${ic('edit','sm')} 编辑帖子</button><button class="outline-button" data-action="hideOwnPost" data-id="${esc(id)}">${ic('trash','sm')} 删除帖子</button></div>`:'';

  const body=`<div class="detail-cover ${p.coverImage&&p.cardStyle!=='text'?'has-image':''}">${poster(p)}</div><div class="detail-meta">${avatar(p.author)}<b>${esc(p.author)}</b><span>·</span><span>${absoluteDate(p.createdAt)}</span>${author}</div>${ownerTools}<h3 class="detail-title">${esc(p.title)}</h3><div class="detail-badges"><span class="mini-badge">${esc(p.category)}</span><span class="mini-badge status-${s.cls}">${s.label}</span><span class="mini-badge">已接单 ${n}/${MAX_CLAIMS}</span></div><p class="detail-description">${linkedText(p.body)}</p><div class="detail-operations"><button class="plain-button ${liked?'is-active':''}" data-action="like" data-id="${esc(id)}">${ic('heart','sm')}${liked?'已喜欢':'喜欢'} · ${p.likes}</button><button class="plain-button ${saved?'is-active':''}" data-action="save" data-id="${esc(id)}">${ic('bookmark','sm')}${saved?'已收藏':'收藏'}</button><button class="plain-button" data-action="share" data-id="${esc(id)}">${ic('copy','sm')}复制帖子信息</button><button class="plain-button" data-action="report" data-id="${esc(id)}">${ic('flag','sm')}举报</button></div>${isAdmin()?`<div class="admin-tools"><div class="admin-tools-head">${ic('shield-check','sm')} 管理员专属操作</div><p>可调整帖子分区；删帖会将其移入回收站，也能单独移除违规接单。</p><div class="admin-tool-buttons"><button class="outline-button" data-action="modPostCategory" data-id="${esc(id)}">${ic('edit','sm')} 修改分区</button>${n?`<button class="outline-button" data-action="modResetClaim" data-id="${esc(id)}">${ic('refresh-ccw','sm')} 重置全部接单</button>`:''}<button class="outline-button admin-danger" data-action="modDeletePost" data-id="${esc(id)}">${ic('trash','sm')} 删除帖子</button><button class="outline-button" data-action="adminDashboard">${ic('shield','sm')} 管理后台</button></div></div>`:''}<div class="section-rule"></div><h4 class="detail-smalltitle">${ic('route','sm')} 愿望进度</h4>${timeline(p)}<div class="claims-heading"><div><strong>创作者认领</strong><small>已有 ${n}/${MAX_CLAIMS} 位创作者接单 · 支持多人同时制作</small></div>${!mine&&free?`<button class="primary-button" data-action="claim" data-id="${esc(id)}">${ic('hand-heart','sm')} 我来接单</button>`:''}</div>${n?claimsOf(p).map(c=>claimMarkup(p,c)).join(''):`<div class="creator-box"><strong>还没有创作者认领</strong><p>如果这个灵感刚好戳中你，可以留下制作计划和参考图片，成为第一位接单者。</p></div>`}${!free&&!mine?`<div class="fine-print">本条愿望的 ${MAX_CLAIMS} 个接单席位已经满了。如果有人撤回，席位会重新开放。</div>`:''}<div class="section-rule"></div><h4 class="detail-smalltitle">${ic('message','sm')} 留言交流 <span class="muted">${p.comments?.length||0}</span></h4><div class="comment-list">${comments||'<p class="muted" style="font-size:12px">还没有留言，来聊聊这个愿望吧。</p>'}</div><form class="comment-form comment-form-media" data-form="comment" data-id="${esc(id)}"><textarea name="comment" maxlength="500" aria-label="写一条留言" placeholder="说点什么…也可以只分享一张照片"></textarea>${attachmentComposer('comment',true)}<div class="comment-bottom"><small>发帖和聊天截图请注意遮盖隐私信息</small><button type="submit">${ic('send','sm')} 发布留言</button></div></form><div class="fine-print">${PREVIEW_MODE?'这是本地演示数据，互动和管理不会写入云端。':'资料与互动由当前登录身份保存；匿名会话请先绑定邮箱再换设备。'}</div>`;

  if($('#modalRoot').classList.contains('is-open')) updateModal('愿望详情',body,{type:'detail',id});
  else openModal('愿望详情',body,{type:'detail',id});
  if(state.commentTarget){document.getElementById('comment-'+state.commentTarget)?.scrollIntoView({block:'center'});state.commentTarget=null}
}

function randomizeTextCover(){state.art='other';state.palette=palettes[Math.floor(Math.random()*palettes.length)]}
function createPost(){
  spoilerSession=null;
  state.selectCat=categoryLabels().includes(state.cat)?state.cat:'主题美化';
  state.cardStyle='text';state.upload=null;state.coverUrl='';randomizeTextCover();
  const body=`<p class="form-lead">写下愿望并选择封面：上传或粘贴图片链接，也可以使用纯色背景的文字封面。</p><form id="postForm" data-form="post"><div class="form-field"><label class="form-label">发布分区</label><div class="select-grid" id="composerCats">${categoryLabels().map(c=>`<button type="button" data-action="chooseCat" data-cat="${esc(c)}" class="select-category ${c===state.selectCat?'active':''}">${esc(c)}</button>`).join('')}</div></div><div class="form-field"><label class="form-label" for="pTitle">许愿标题 <small>必填 · 最多 65 字</small></label><input name="title" id="pTitle" maxlength="65" required placeholder="比如：想要一套复古杂志风的聊天美化…"></div><div class="form-field"><label class="form-label" for="pBody">详细说说你的想法 <small>必填</small></label><textarea id="pBody" name="body" maxlength="1800" required placeholder="喜欢的风格、需要的功能、参考效果，或者任何想让创作者知道的细节…"></textarea></div><div class="form-field"><label class="form-label" for="pAuthor">你的署名 <small>可选，留空则匿名</small></label><input id="pAuthor" name="author" maxlength="22" value="" placeholder="匿名旅人"></div><label class="privacy-choice"><input type="checkbox" name="spoiler"><span><strong>标记为暴雷帖</strong><small>正文、图片和评论需确认后查看。公开标题请避免包含敏感细节。</small></span></label><div class="form-field"><label class="form-label">封面类型</label><div class="select-grid"><button type="button" class="select-category" data-action="chooseCoverMode" data-mode="image">封面图片</button><button type="button" class="select-category active" data-action="chooseCoverMode" data-mode="text">文字封面</button></div></div><div class="form-field hide" id="imageCoverFields"><label class="form-label">封面图片 <small>上传压缩图片或填写 HTTPS 图片 URL</small></label><label class="file-upload">${ic('image')} <span>选择封面图片<small>JPEG / PNG / WebP，最大 12 MB，上传前自动压缩</small></span><input type="file" id="postCoverUpload" accept="image/jpeg,image/png,image/webp"></label><input type="url" id="postCoverUrl" maxlength="2000" placeholder="https://example.com/cover.jpg" aria-label="封面图片 HTTPS URL"><small class="muted">上传图片和图片 URL 二选一</small><img class="image-preview hide" id="postImagePreview" alt="封面预览"></div><div class="form-field" id="textCoverFields"><label class="form-label">文字封面预览 <small>展示标题前 8 个字，其余以省略号显示</small></label><div class="text-cover-preview" id="textCoverPreview"></div><small class="muted">背景使用纯色，不含插画，也不提供自选颜色。</small></div><div class="form-foot"><small>匿名发布仍由你的登录身份管理。</small><button class="primary-button" type="submit">${ic('send','sm')} 发布愿望</button></div></form>`;
  openModal('投递一个愿望',body,{type:'create'});
  updateTextCoverPreview();setTimeout(()=>$('#pTitle')?.focus(),100);
}
function updateTextCoverPreview(){const el=$('#textCoverPreview');if(!el)return;el.innerHTML=poster({cardStyle:'text',title:$('#pTitle')?.value||'愿望标题示例',category:state.selectCat,art:state.art,palette:state.palette})}
function chooseCoverMode(mode){if(!['image','text'].includes(mode))return;state.cardStyle=mode;$('#imageCoverFields')?.classList.toggle('hide',mode!=='image');$('#textCoverFields')?.classList.toggle('hide',mode!=='text');$$('[data-action="chooseCoverMode"]').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));if(mode==='text'){state.upload=null;state.coverUrl='';randomizeTextCover();const f=$('#postCoverUpload');if(f)f.value='';const u=$('#postCoverUrl');if(u)u.value='';updateTextCoverPreview()}else{$('#postImagePreview')?.classList.add('hide')}}
function claimForm(id){
  const p=postBy(id);if(!p)return;
  const n=claimsOf(p).length;
  if(ownedClaim(p))return toast('你已经接过这条愿望，可以在帖子内修改自己的进度');
  if(n>=MAX_CLAIMS)return toast('当前接单席位已满');
  state.attachments.claim=null;state.mediaModes.claim='upload';
  const body=`<button class="go-back" data-action="backDetail" data-id="${esc(id)}">${ic('arrow-left','sm')} 返回帖子</button><p class="form-lead">你即将认领：<b>${esc(p.title)}</b><br>这是第 ${n+1}/${MAX_CLAIMS} 个接单席位。可以写制作计划并附上聊天截图或参考图片。</p><form data-form="claim" data-id="${esc(id)}"><div class="form-field"><label class="form-label" for="claimName">创作者昵称 *</label><input id="claimName" name="name" maxlength="24" required value="${esc(localData.pref.nickname)}" placeholder="怎么称呼你？"></div><div class="form-field"><label class="form-label" for="claimNote">接单留言 *</label><textarea name="note" maxlength="850" minlength="5" required placeholder="比如：这个美化我来做～我有一张参考图片，也会先试几个配色！"></textarea></div>${attachmentComposer('claim')}<label class="privacy-choice"><input type="checkbox" name="hidden" checked><span><strong>作品完成前，隐藏我的接单信息</strong><small>其他用户只看到有人接单，不显示昵称、留言或图片；完成后自动公开，撤回也不会留下接单信息。</small></span></label><div class="form-foot"><small>之后可随时自己修改制作状态。</small><button class="primary-button" type="submit">${ic('check','sm')} 确认接单</button></div></form>`;
  updateOrOpen('创作者接单',body,{type:'claim',id});
  setTimeout(()=>$('#claimName')?.focus(),40);
}

function editClaimStatus(id, uid){
  const p=postBy(id), c=p&&claimBy(p,uid);
  if(!c||c.id!==currentUser?.id)return toast('只有接单创作者能修改自己的状态');
  const d=c.delivery||{};
  const body=`<button class="go-back" data-action="backDetail" data-id="${esc(id)}">${ic('arrow-left','sm')} 返回帖子</button><div class="my-claim-heading">${ic('brush')} <div><b>我接的单 · ${esc(p.title)}</b><small>每位创作者独立更新自己的进度。</small></div></div><form data-form="claimStatus" data-id="${esc(id)}" data-uid="${esc(uid)}"><div class="form-field"><label class="form-label">选择当前制作状态</label><div class="status-choice">${[['claimed','已接单'],['working','正在制作'],['done','已完成']].map(([s,label])=>`<label><input type="radio" name="status" value="${s}" ${c.status===s?'checked':''}><span>${ic(s==='done'?'check-circle':s==='working'?'brush':'clock','sm')} ${label}</span></label>`).join('')}</div></div><div class="delivery-fields" id="deliveryFields"><div class="form-field"><label class="form-label" for="fileLocation">完成后文件在哪？ <small>标记「已完成」时必填</small></label><input id="fileLocation" name="location" maxlength="260" list="deliveryLocationOptions" value="${esc(d.location||'')}" placeholder="仓库群1/仓库群2/Aaa我不是饭神/Bbb我不是饭神/discord"><datalist id="deliveryLocationOptions"><option value="仓库群1"><option value="仓库群2"><option value="Aaa我不是饭神"><option value="Bbb我不是饭神"><option value="discord"></datalist></div><div class="form-field"><label class="form-label" for="fileUrl">领取 URL（可选）</label><input id="fileUrl" name="url" type="url" maxlength="1200" value="${esc(d.url||'')}" placeholder="https://..."></div><div class="form-field"><label class="form-label" for="fileNote">完成说明（可选）</label><textarea id="fileNote" name="note" maxlength="650" placeholder="更新说明、使用须知…">${esc(d.note||'')}</textarea></div></div><p class="form-lead">完成后仍然能修改文件位置或改回「正在制作」。只有你本人能编辑这份接单记录。</p><div class="form-foot"><small>已接单与制作中的作品不需要填写文件位置。</small><button class="primary-button" type="submit">${ic('check','sm')} 保存状态</button></div></form>`;
  updateOrOpen('修改我的接单进度',body,{type:'claimStatus',id,uid});
  toggleDeliveryFields();
}

function toggleDeliveryFields(){
  const done=$('input[name="status"]:checked')?.value==='done';
  const fields=$('#deliveryFields');
  if(fields) fields.classList.toggle('hide',!done);
  const location=$('#fileLocation');
  if(location) location.required=!!done;
}

function setMediaMode(kind,mode){
  if(!['claim','comment'].includes(kind)||!['upload','url'].includes(mode))return;
  state.mediaModes[kind]=mode;state.attachments[kind]=null;
  $$(`[data-kind="${kind}"][data-action="mediaMode"]`).forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  $$(`[data-attach-panel^="${kind}-"]`).forEach(el=>el.classList.toggle('hide',!el.dataset.attachPanel.endsWith('-'+mode)));
  const input=$(`[data-image-url="${kind}"]`);if(input)input.value='';
  const preview=$(`[data-attach-preview="${kind}"]`);if(preview)preview.classList.add('hide');
}

async function validatedUpload(dataUrl,kind){
  const blob=await(await fetch(dataUrl)).blob();const form=new FormData();form.append('image',blob,'image.webp');form.append('kind',kind);
  const {data,error}=await supabase.functions.invoke('validated-media',{body:form});
  if(error||data?.error)throw Error(data?.error||'图片上传失败，请重试');return data;
}
async function uploadToSupabaseStorage(dataUrl,folder='posts',bucket='wish-media'){
  const result=await validatedUpload(dataUrl,folder);return bucket==='claim-media'?result.path:result.publicUrl;
}

async function mediaFromForm(kind,fd){
  const mode=state.mediaModes[kind];
  if(mode==='url'){
    const raw=String(fd.get('mediaUrl')||'').trim();if(!raw)return null;
    const url=cleanUrl(raw);if(!url)throw Error('图片 URL 需要有效的 HTTPS 地址');
    return{src:url,method:'url'};
  }
  const upload=state.attachments[kind];
  if(!upload) return null;
  const bucket=kind==='claim'?'claim-media':'wish-media';
  const uploaded = await uploadToSupabaseStorage(upload,kind==='claim'?'claims':'comments',bucket);
  return {src:uploaded, method:'upload', bucket};
}

async function compressedPhoto(file,maxEdge=1000){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('请选择 JPEG、PNG 或 WebP 图片');
  if(file.size>12*1024*1024)throw Error('图片请小于 12 MB');
  const url=URL.createObjectURL(file);
  try{
    const img=new Image();
    await new Promise((ok,no)=>{img.onload=ok;img.onerror=no;img.src=url});
    if(img.width>16000||img.height>16000||img.width*img.height>40000000)throw Error('图片尺寸过大，请缩小后上传');
    const scale=Math.min(1,maxEdge/Math.max(img.width,img.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(img.width*scale));
    canvas.height=Math.max(1,Math.round(img.height*scale));
    canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/webp',.73);
  }finally{URL.revokeObjectURL(url)}
}

async function handleForm(form){
  const kind=form.dataset.form, fd=new FormData(form), id=form.dataset.id;

  if(kind==='adminLogin'){
    const email=String(fd.get('email')||'').trim();
    const password=String(fd.get('password')||'');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if(error){ toast(error.message==='Invalid login credentials'?'登录失败：邮箱或密码不正确，请核对 Supabase Auth 账号或重设密码。':'登录失败：' + error.message); return; }
    currentUser=data.user;
    await checkAdmin();
    if(!isAdminUser){ await render();closeModal();toast('登录成功，但该账号没有管理员权限');return;}
    localStorage.setItem('mimu_admin_email',email);
    await render(); closeModal(); adminDashboard(); toast('成功登录管理员后台！');
    return;
  }
  if(kind==='adminPasswordReset'){
    const password=String(fd.get('password')||'');
    if(password.length<8)return toast('新密码至少需要 8 个字符');
    if(password!==String(fd.get('confirmPassword')||''))return toast('两次输入的密码不一致');
    const {data,error}=await supabase.auth.updateUser({password});
    if(error)return toast('重设失败：'+error.message);
    passwordRecoveryPending=false;
    currentUser=data.user;
    await checkAdmin();
    await render(); closeModal();
    toast(isAdminUser?'密码已更新，可以使用管理员后台':'密码已更新，但此账号没有管理员权限');
    return;
  }
  if(kind==='modDeletePost'){
    if(!isAdmin())return toast('需要管理员身份');
    return modRemovePost(id,String(fd.get('reason')||'管理员处理'));
  }
  if(kind==='report'){
    const p=postBy(id);if(!p)return toast('帖子不存在');
    const reason=String(fd.get('reason')||'其他问题'), note=String(fd.get('note')||'').trim();
    const {error}=await supabase.from('reports').insert({post_id:id,reason,note});if(error)return toast('举报提交失败：'+error.message);
    closeModal(); toast('举报已提交至云端');
    return;
  }
  if(kind==='post'){
    const title=String(fd.get('title')||'').trim(), body=String(fd.get('body')||'').trim(), author=String(fd.get('author')||'').trim()||'匿名旅人';
    if(title.length<2||!body)return toast('请写下标题和愿望详情');
    if(![...baseCategories,...localData.posts.map(p=>p.category)].includes(state.selectCat))return toast('自定义分区目前仅用于本机预览；完成云端分类迁移后才能发布');
    let coverUrl='';if(state.cardStyle==='image'){if(state.upload){coverUrl=await uploadToSupabaseStorage(state.upload)}else{coverUrl=cleanImageUrl(state.coverUrl);if(!coverUrl)return toast('请上传封面图片或填写有效的 HTTPS 图片 URL')}}
    const newPost = {
      title, body,
      is_spoiler:fd.get('spoiler')==='on',
      category: state.selectCat,
      card_style: state.cardStyle,
      author_name: author,
      art: state.cardStyle==='text'?'text':(['主题美化','角色卡'].includes(state.selectCat)?'chat':state.selectCat==='世界书'?'book':state.selectCat==='App'?'app':state.selectCat==='心声'?'note':'other'),
      palette: state.palette,
      ratio: .8+Math.random()*.15,
      cover_image: coverUrl
    };
    let { data: createdPost, error } = await supabase.from('posts').insert(newPost).select('id').single();
    if(error&&/card_style/i.test(error.message||'')&&/schema cache|column/i.test(error.message||'')){
      const {card_style,...compatiblePost}=newPost;
      ({data:createdPost,error}=await supabase.from('posts').insert(compatiblePost).select('id').single());
    }
    if(error){ toast('发布失败: ' + error.message); return; }
    if(createdPost?.id){localData.preview.posts[createdPost.id]={cardStyle:state.cardStyle,art:state.art,palette:state.palette};saveLocalPreview()}

    closeModal(); state.view='feed'; state.cat=state.selectCat; state.status='全部状态'; state.query=''; $('#searchInput').value='';
    await render(); window.scrollTo({top:0,behavior:'smooth'}); toast('愿望发布成功！已同步至云端');
    return;
  }
  if(kind==='claim'){
    const p=postBy(id);if(!p||claimsOf(p).length>=MAX_CLAIMS||ownedClaim(p))return toast('这条愿望已经无法继续接单');
    const name=String(fd.get('name')||'').trim(), note=String(fd.get('note')||'').trim();
    if(!name||note.length<5)return toast('请留下昵称和至少 5 个字的接单说明');
    let media;
    try{ media=await mediaFromForm('claim',fd) }catch(e){return toast(e.message)}
    const { error } = await supabase.from('claims').insert({
      post_id: id,
      name,
      note,
      status: 'claimed',
      hidden_before_done: fd.get('hidden')==='on',
      media
    });
    if(error){ toast('接单失败: ' + error.message); return; }

    await render(); detail(id,true); toast('接单成功！已同步云端');
    return;
  }
  if(kind==='claimStatus'){
    const p=postBy(id), c=p&&claimBy(p,form.dataset.uid);
    if(!c||c.id!==currentUser?.id)return toast('只有接单创作者能修改自己的进度');
    const status=String(fd.get('status')||'');
    if(!['claimed','working','done'].includes(status))return toast('状态不正确');
    const location=String(fd.get('location')||'').trim(), rawUrl=String(fd.get('url')||'').trim(), url=rawUrl?cleanUrl(rawUrl):'';
    if(rawUrl&&!url)return toast('领取链接需要有效的 HTTPS URL');
    if(status==='done'&&!location)return toast('完成时请填写文件位置');

    let deliveryData = null;
    if(status==='done'){
      deliveryData = { location, url, note: String(fd.get('note')||'').trim(), date: new Date().toISOString() };
    }
    const { error } = await supabase.from('claims').update({
      status,
      delivery: deliveryData
    }).eq('uid', c.uid);
    if(error){ toast('更新失败: ' + error.message); return; }
    await render(); detail(id,true);
    toast(status==='done'?'已完成！文件位置已经显示在帖子里':'进度已更新');
    return;
  }
  if(kind==='comment'){
    const p=postBy(id);if(!p)return;
    const msg=String(fd.get('comment')||'').trim();
    let media;
    try{ media=await mediaFromForm('comment',fd) }catch(e){return toast(e.message)}
    if(!msg&&!media)return toast('请填写留言，或上传一张图片');
    const { error } = await supabase.from('comments').insert({
      post_id: id,
      author: currentName(),
      text: msg,
      media
    });
    if(error){ toast('留言失败: ' + error.message); return; }
    await render(); detail(id,true); toast('留言发布成功');
    return;
  }
}

function showProfile(){setView('mine')}

async function editOwnPost(id){
  const p=postBy(id);if(!p||p.authorId!==currentUser?.id)return toast('只能编辑自己发布的帖子');
  if(!PREVIEW_MODE){try{await loadDetail(p)}catch(e){return toast(e.message)}}
  const body=`<p class="form-lead">只会修改这条愿望的文字和封面，原来的留言与接单进度会保留。</p><form data-form="ownPostEdit" data-id="${esc(id)}"><div class="form-field"><label class="form-label">帖子分区</label><select name="category">${[...new Set([p.category,...categoryLabels()])].map(c=>`<option ${c===p.category?'selected':''} value="${esc(c)}">${esc(c)}</option>`).join('')}</select></div><div class="form-field"><label class="form-label">标题</label><input name="title" maxlength="65" required value="${esc(p.title)}"></div><div class="form-field"><label class="form-label">正文</label><textarea name="body" maxlength="1800" required>${esc(p.body)}</textarea></div><div class="form-field"><label class="form-label">封面类型</label><div class="select-grid">${[['image','封面图片'],['text','文字封面']].map(([v,label])=>`<label class="select-category"><input type="radio" name="cardStyle" value="${v}" ${( ((p.cardStyle==='image'||p.coverImage)?'image':'text')===v)?'checked':''}> ${label}</label>`).join('')}</div><label class="form-label" for="editCoverUrl">封面图片 HTTPS URL <small>已有上传图可以继续使用</small></label><input id="editCoverUrl" name="coverUrl" type="url" maxlength="2000" value="${esc(p.coverImage||'')}" placeholder="https://example.com/cover.jpg"></div><label class="privacy-choice"><input type="checkbox" name="spoiler" ${p.isSpoiler?'checked':''}><span><strong>标记为暴雷帖</strong><small>请确认公开标题不包含敏感细节。</small></span></label><div class="form-foot"><small>你的接单、留言和收藏不会受影响。</small><button class="primary-button" type="submit">保存修改</button></div></form>`;
  updateOrOpen('编辑我的帖子',body,{type:'ownPostEdit',id});
}
function modEditPostCategory(id){
  if(!isAdmin())return toast('需要管理员身份');
  const p=postBy(id);if(!p)return toast('找不到这条帖子');
  const categories=[...new Set([p.category,...categoryLabels()])];
  const body=`<p class="form-lead">将「${esc(p.title)}」移到其他分区。帖子内容、留言和接单进度会保留。</p><form data-form="modPostCategory" data-id="${esc(id)}"><div class="form-field"><label class="form-label" for="modPostCategorySelect">目标分区</label><select id="modPostCategorySelect" name="category" required>${categories.map(c=>`<option value="${esc(c)}" ${c===p.category?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="form-foot"><button class="primary-button" type="submit">保存分区</button></div></form>`;
  updateOrOpen('修改帖子分区',body,{type:'modPostCategory',id});
}
async function hideOwnPost(id){if(PREVIEW_MODE){const p=postBy(id);if(!p||p.authorId!==currentUser.id)return;localData.preview.hidden.push(id);saveLocalPreview();closeModal();await render();return toast('已从本机演示隐藏')}const p=postBy(id);if(!p||p.authorId!==currentUser?.id)return toast('只能删除自己发布的帖子');if(!confirm('删除这条愿望？它会从市集隐藏，后续可由管理员协助恢复。'))return;const {error}=await supabase.from('posts').update({is_deleted:true}).eq('id',id);if(error)return toast('删除失败：'+error.message);closeModal();await render();toast('愿望已删除')}
function previewDashboard(){openModal('本地预览管理',`<div class="mod-hint">${ic('eye','sm')} <strong>演示模式</strong>：这里不会验证管理员身份，也不会修改云端数据。</div><p class="mod-subheading">可以先体验分区的添加和排序；更改只保存在当前浏览器。</p><button class="primary-button" data-action="adminCategories">${ic('edit','sm')} 打开分区管理</button>`,{type:'previewDashboard'})}

function adminCategoryManager(){
  if(!isAdmin()&&!PREVIEW_MODE)return loginAdmin();
  const custom=localData.pref.customCats||[],all=categoryLabels();
  const rows=all.map((c,i)=>`<div class="mod-item"><div class="mod-item-head"><strong class="mod-item-title">${esc(c)}</strong><span class="mini-badge">${custom.includes(c)?'自定义':'预设'}</span></div><div class="mod-actions"><button data-action="moveCategory" data-index="${i}" data-dir="-1" ${i===0?'disabled':''}>上移</button><button data-action="moveCategory" data-index="${i}" data-dir="1" ${i===all.length-1?'disabled':''}>下移</button>${custom.includes(c)?`<button class="danger" data-action="removeCategory" data-cat="${esc(c)}">${ic('trash','sm')} 移除</button>`:'<span class="muted">默认分区</span>'}</div></div>`).join('');
  const body=`<p class="mod-subheading">添加并整理发布分区。预设分区保留；自定义分区目前保存在本机，待数据库迁移后再同步。</p><form data-form="addCategory"><div class="form-field"><label class="form-label">新分区名称</label><input name="category" maxlength="16" required placeholder="例如：教程、表情包"></div><div class="form-foot"><small>最多 30 个自定义分区</small><button class="primary-button">添加分区</button></div></form><div class="mod-items">${rows||'<div class="mod-empty">还没有自定义分区</div>'}</div>`;
  updateOrOpen('分区管理',body,{type:'adminDashboard',tab:'categories'});
}

function exportInfo(id){const p=postBy(id);if(!p)return;const text=`mimu. 愿望市集 · ${p.title}\n分区：${p.category}${p.isSpoiler?' · 暴雷帖（需确认查看）':''}\n${location.origin}${location.pathname}?post=${encodeURIComponent(id)}`;if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>toast('公开帖子信息已复制'),()=>fallbackCopy(text));else fallbackCopy(text)}
function fallbackCopy(str){const e=document.createElement('textarea');e.value=str;e.style.cssText='position:fixed;top:-100px;opacity:0';document.body.append(e);e.select();try{document.execCommand('copy');toast('帖子信息已复制')}catch{toast('复制失败')}e.remove()}

function renderAdminState(){
  const logged=isAdmin();
  if(PREVIEW_MODE){$('#adminEntry').setAttribute('title','本地预览管理');$('#adminEntry').setAttribute('aria-label','本地预览管理');}
  $('#adminEntry').classList.toggle('is-admin',logged);
  $('#adminEntry').setAttribute('title',PREVIEW_MODE?'本地预览管理':(logged?'管理后台 · 已登录':'管理员登录'));
  $('#adminEntry').setAttribute('aria-label',PREVIEW_MODE?'本地预览管理':(logged?'管理后台 · 已登录':'管理员登录'));
  $('#adminEntry').innerHTML=ic(logged?'shield-check':'shield');
  $('#adminNotice').classList.toggle('show',logged);
  hydrateIcons($('#adminNotice'));
}

function loginAdmin(){
  if(isAdmin())return adminDashboard();
  const savedEmail=localStorage.getItem('mimu_admin_email')||'';
  const emailField=savedEmail?`<p class="form-lead" style="text-align:center">管理员账号：${esc(savedEmail)} <button type="button" class="go-back" data-action="adminSwitchAccount" style="display:inline;padding:0">切换账号</button></p><input type="hidden" name="email" value="${esc(savedEmail)}">`:`<p class="form-lead" style="text-align:center">首次登录请输入 Supabase Auth 中的邮箱和密码。</p><div class="form-field"><label class="form-label" for="adminEmail">管理员邮箱</label><input id="adminEmail" name="email" type="email" autocomplete="username" required placeholder="admin@example.com"></div>`;
  openModal('管理员登录',`<div class="mod-lock">${ic('lock')}</div><form data-form="adminLogin">${emailField}<div class="form-field"><label class="form-label" for="adminPassword">密码</label><input id="adminPassword" name="password" type="password" autocomplete="current-password" required placeholder="输入密码"></div><div class="form-foot"><button type="button" class="go-back" data-action="adminForgotPassword" style="padding:0">忘记密码？</button><button type="submit" class="primary-button">${ic('shield-check','sm')} 登录后台</button></div></form>`,{type:'adminLogin'});
  setTimeout(()=>$(savedEmail?'#adminPassword':'#adminEmail')?.focus(),80);
}

async function sendAdminRecovery(){
  const email=String($('#adminEmail')?.value||localStorage.getItem('mimu_admin_email')||'').trim();
  if(!email)return toast('请先填写管理员邮箱');
  const {error}=await supabase.auth.resetPasswordForEmail(email);
  toast(error?'找回邮件发送失败：'+error.message:'如果该邮箱已注册，找回密码邮件已发送。请查看收件箱。');
}

function showPasswordReset(){
  if(!passwordRecoveryPending)return;
  openModal('设置新密码',`<p class="form-lead">已通过邮箱验证身份。请设置新的管理员密码。</p><form data-form="adminPasswordReset"><div class="form-field"><label class="form-label" for="newAdminPassword">新密码</label><input id="newAdminPassword" name="password" type="password" autocomplete="new-password" minlength="8" required></div><div class="form-field"><label class="form-label" for="confirmAdminPassword">再次输入新密码</label><input id="confirmAdminPassword" name="confirmPassword" type="password" autocomplete="new-password" minlength="8" required></div><div class="form-foot"><button type="submit" class="primary-button">保存新密码</button></div></form>`,{type:'adminPasswordReset'});
  setTimeout(()=>$('#newAdminPassword')?.focus(),80);
}

async function logoutAdmin(){
  await supabase.auth.signOut();
  await initAuth();
  closeModal(); render(); toast('已退出管理员后台');
}

function modItem(p,trash=false){
  return`<div class="mod-item"><div class="mod-item-head"><span class="mod-item-title">${esc(p.title)}</span><span class="mini-badge">${esc(p.category)}</span></div><div class="mod-item-sub">${esc(p.author)} · ${absoluteDate(p.createdAt)} · ${trash?'已删除':STATUS[p.status]?.label||'未知'}</div><div class="mod-actions">${trash?`<button class="danger" data-action="modPurgePost" data-id="${esc(p.id)}">${ic('trash')} 永久删除</button>`:`<button data-action="open" data-id="${esc(p.id)}">${ic('eye')} 查看</button><button data-action="modPostCategory" data-id="${esc(p.id)}">${ic('edit')} 修改分区</button><button class="danger" data-action="modDeletePost" data-id="${esc(p.id)}">${ic('trash')} 删除</button>`}</div></div>`
}

async function adminDashboard(tab='posts'){
  if(PREVIEW_MODE)return previewDashboard();
  if(!isAdmin())return loginAdmin();
  if(!['posts','reports','logs','categories','trash'].includes(tab))tab='posts';
  const pending=localData.reports.filter(r=>!r.resolved).length;
  let section='';
  if(tab==='trash'){const [comments,claims]=await Promise.all([supabase.from('comments').select('*').eq('is_deleted',true),supabase.from('claims').select('*').eq('is_deleted',true)]);if(comments.error||claims.error)return toast('读取回收站失败');const entries=[...localData.posts.filter(p=>p.isDeleted).map(p=>({kind:'posts',key:p.id,label:p.title})),...(comments.data||[]).map(c=>({kind:'comments',key:c.id,label:'已删除留言'})),...(claims.data||[]).map(c=>({kind:'claims',key:c.uid,label:'已删除接单'}))];section=entries.map(x=>`<div class="mod-item"><strong>${esc(x.label)}</strong><div class="mod-actions"><button data-action="modRestore" data-kind="${x.kind}" data-key="${esc(x.key)}">恢复</button></div></div>`).join('')||'<p class="mod-empty">回收站为空</p>';}
  if(tab==='logs'){const {data,error}=await supabase.from('moderation_logs').select('*').order('created_at',{ascending:false}).limit(100);if(error)return toast('审计读取失败');section=(data||[]).map(x=>`<div class="mod-item"><strong>${esc(x.action)}</strong><p>${esc(x.title)}</p><small>${esc(x.extra)} · ${absoluteDate(x.created_at)}</small></div>`).join('')||'<p class="mod-empty">暂无审计记录</p>';}
  if(tab==='posts') section=`<p class="mod-subheading">当前共有 ${localData.posts.length} 条公开愿望</p><input id="modSearch" class="mod-filter-input" type="search" placeholder="搜索帖子…"><div class="mod-items">${[...localData.posts.filter(p=>!p.isDeleted)].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(p=>modItem(p)).join('')||'<div class="mod-empty">暂无帖子</div>'}</div>`;
  if(tab==='categories') section=`<p class="mod-subheading">维护横向分类导航与发布分类。</p><button class="primary-button" data-action="adminCategories">${ic('edit','sm')} 管理发布分区</button><div class="mod-items">${categoryLabels().map(c=>`<div class="mod-item"><strong class="mod-item-title">${esc(c)}</strong></div>`).join('')}</div>`;
  if(tab==='reports') section=`<p class="mod-subheading">用户举报列表</p><div class="mod-items">${localData.reports.map(r=>`<div class="mod-item"><div class="mod-item-head"><strong class="mod-item-title">举报原因：${esc(r.reason)}</strong><span class="mini-badge">${r.resolved?'已处理':'待处理'}</span></div><p>${esc(r.note||'')}</p><div class="mod-actions">${!r.resolved?`<button class="success" data-action="modResolve" data-report="${esc(r.id)}">标记已处理</button>`:''}</div></div>`).join('')||'<div class="mod-empty">暂无举报</div>'}</div>`;

  const body=`<div class="mod-stat-grid"><div class="mod-stat"><strong>${localData.posts.length}</strong><span>公开帖子</span></div><div class="mod-stat"><strong>${pending}</strong><span>待处理举报</span></div></div><div class="mod-hint">${ic('shield-check','sm')} <strong>云端管理员模式已开启。</strong></div><div class="mod-tabs">${[['posts','帖子管理'],['categories','分区管理'],['trash','回收站'],['logs','审计'],['reports',`举报 ${pending?`(${pending})`:''}`]].map(([t,label])=>`<button class="mod-tab ${tab===t?'active':''}" data-action="modTab" data-tab="${t}">${label}</button>`).join('')}</div>${section}<div class="mod-bottom"><button class="mod-logout" data-action="adminLogout">${ic('log-out','sm')} 退出管理员</button></div>`;
  if($('#modalRoot').classList.contains('is-open')) updateModal('管理后台 · mimu.',body,{type:'adminDashboard',tab});
  else openModal('管理后台 · mimu.',body,{type:'adminDashboard',tab});
}

function adminDeletePrompt(id){
  if(!isAdmin())return toast('需要管理员身份');
  const p=postBy(id);if(!p)return toast('帖子不存在');
  updateOrOpen('删除违规帖子',`<div class="mod-alert">${ic('alert-triangle','sm')} 即将从云端将 <b>${esc(p.title)}</b> 软删除。</div><form data-form="modDeletePost" data-id="${esc(id)}"><div class="form-field"><label class="form-label" for="modReason">处理原因</label><select name="reason" id="modReason"><option value="垃圾广告 / 刷屏">垃圾广告 / 刷屏</option><option value="违规或骚扰内容">违规或骚扰内容</option></select></div><div class="form-foot"><button type="submit" class="primary-button">${ic('trash','sm')} 确认删除</button></div></form>`,{type:'modDeletePost',id});
}

async function modRemovePost(id, reason){
  if(!isAdmin())return toast('没有管理员权限');
  const {error}=await supabase.rpc('moderate_market_item',{item_kind:'posts',item_key:id,removed:true,reason});
  if(error)return toast('删除失败：'+error.message);
  await render(); closeModal(); toast('已移入回收站');
}

async function modDeleteComment(id, cid){
  const p=postBy(id),comment=p?.comments?.find(c=>c.id===cid);if(!isAdmin()&&comment?.authorId!==currentUser?.id)return toast('只能删除自己的留言');
  if(PREVIEW_MODE){p.comments=p.comments.filter(c=>c.id!==cid);localData.preview.posts[id]={...p};saveLocalPreview();return detail(id,false)}
  if(!confirm('确定删除这条留言吗？'))return;
  const {error}=await supabase.from('comments').update({is_deleted:true}).eq('id', cid);
  if(error)return toast('删除失败：'+error.message);
  await render(); detail(id,true); toast('留言已删除');
}

async function modRemoveClaim(id, uid){
  if(!isAdmin())return toast('需要管理员身份');
  if(!confirm('确定移除该创作者的接单吗？'))return;
  const {error}=await supabase.from('claims').update({is_deleted:true}).eq('uid', uid);
  if(error)return toast('移除失败：'+error.message);
  await render(); detail(id,true); toast('已移除该份接单');
}

async function modResetClaim(id){
  if(!isAdmin())return toast('管理员权限不足');
  if(!confirm('清空该帖所有接单？'))return;
  const {error}=await supabase.from('claims').update({is_deleted:true}).eq('post_id', id);
  if(error)return toast('重置失败：'+error.message);
  await render(); detail(id,true); toast('已清空接单');
}

async function modResolve(rid){
  if(!isAdmin())return toast('管理员权限不足');
  const {error}=await supabase.from('reports').update({ resolved: true }).eq('id', rid);
  if(error)return toast('处理失败：'+error.message);
  adminDashboard('reports'); toast('已标记处理');
}

function reportPost(id){
  const p=postBy(id);if(!p)return;
  updateOrOpen('举报不当内容',`<p class="form-lead">发送举报给云端管理员。</p><form data-form="report" data-id="${esc(id)}"><div class="form-field"><label class="form-label" for="reportReason">举报原因</label><select name="reason" id="reportReason"><option value="垃圾广告">垃圾广告</option><option value="违规内容">违规内容</option></select></div><div class="form-field"><label class="form-label">补充说明</label><textarea name="note" placeholder="补充..."></textarea></div><div class="form-foot"><button type="submit" class="primary-button">提交举报</button></div></form>`,{type:'report',id});
}

function dispatchAction(btn,event){
  const a=btn.dataset.action, id=btn.dataset.id;
  if(PREVIEW_MODE&&['report','modDeletePost','modResetClaim','modResolve','modRemoveClaim','modPostCategory'].includes(a))return toast('只读预览模式：此操作不会连接 Supabase');
  if(a==='adminEntry')return PREVIEW_MODE?previewDashboard():(isAdmin()?adminDashboard():loginAdmin());
  if(a==='adminSwitchAccount'){localStorage.removeItem('mimu_admin_email');return loginAdmin()}
  if(a==='adminForgotPassword')return sendAdminRecovery();
  if(a==='adminLogout')return logoutAdmin();
  if(a==='adminDashboard')return adminDashboard();
  if(a==='modTab')return adminDashboard(btn.dataset.tab);
  if(a==='adminCategories')return adminCategoryManager();
  if(a==='editOwnPost')return editOwnPost(id);
  if(a==='modPostCategory')return modEditPostCategory(id);
  if(a==='hideOwnPost')return hideOwnPost(id);
  if(a==='clearAvatar'){localData.pref.avatar='';saveLocalPref();showProfile();return toast('头像已移除')}
  if(a==='chooseCoverMode')return chooseCoverMode(btn.dataset.mode);
  if(a==='moveCategory'){const arr=categoryLabels(),i=Number(btn.dataset.index),j=i+Number(btn.dataset.dir);if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];localData.pref.categoryOrder=arr;saveLocalPref();saveLocalPreview();adminCategoryManager();renderCats();return}
  if(a==='removeCategory'){const category=btn.dataset.cat;if(!localData.pref.customCats.includes(category))return;localData.pref.customCats=localData.pref.customCats.filter(c=>c!==category);localData.pref.categoryOrder=(localData.pref.categoryOrder||[]).filter(c=>c!==category);saveLocalPref();saveLocalPreview();adminCategoryManager();renderCats();return}
  if(a==='modDeletePost')return adminDeletePrompt(id);
  if(a==='modDeleteComment')return modDeleteComment(id,btn.dataset.comment);
  if(a==='modResetClaim')return modResetClaim(id);
  if(a==='modResolve')return modResolve(btn.dataset.report);
  if(a==='modRemoveClaim')return modRemoveClaim(id,btn.dataset.uid);
  if(a==='report')return reportPost(id);
  if(a==='guide'||a==='covenant')return openReading(a);
  if(a==='retryCloud')return render();
  if(a==='loadMore'){pageLimit+=24;return render(false)}
  if(a==='modRestore'){const {kind,key}=btn.dataset;return moderateRestore(kind,key)}
  if(a==='profileTab'){mineTab=btn.dataset.tab;pageLimit=24;return render(false)}
  if(a==='profileEdit')return editProfile();
  if(a==='profileReset'){rememberProfileDraft();profileDraft[btn.dataset.kind+'_path']='';profileDraft[btn.dataset.kind+'Url']='';profileDraft[btn.dataset.kind+'Data']='';return renderProfileEditor()}
  if(a==='profileCrop')return applyCrop();
  if(a==='cancelCrop'){cropTask=null;return renderProfileEditor()}
  if(a==='spoilerConfirm'){spoilerSession=id;return detail(id,true)}
  if(a==='account')return accountDialog();
  if(a==='accountLogout')return logoutAccount();

  if(a==='create')return createPost();
  if(a==='close')return closeModal();
  if(a==='open'){state.commentTarget=btn.dataset.commentTarget||null;return detail(id)}
  if(a==='like')return like(id);
  if(a==='save')return favorite(id);
  if(a==='claim')return claimForm(id);
  if(a==='backDetail')return detail(id);
  if(a==='editClaimStatus')return editClaimStatus(id,btn.dataset.uid);
  if(a==='unlink'){}
  if(a==='unclaim'&&PREVIEW_MODE){const p=postBy(id);if(!p)return;p.claims=p.claims.filter(c=>c.id!==currentUser.id);p.status=p.claims.length?'claimed':'open';localData.preview.posts[id]={...p};saveLocalPreview();closeModal();return render()}
  if(a==='unclaim'){
    const p=postBy(id), c=p&&claimBy(p,btn.dataset.uid);
    if(!c||c.id!==currentUser?.id)return toast('只能撤回自己的接单');
    if(!confirm('确定撤回这份接单吗？'))return;
    supabase.from('claims').update({is_deleted:true}).eq('uid', c.uid).then(async({error})=>{
      if(error)return toast('撤回失败：'+error.message);
      await render(); detail(id,true); toast('已撤回接单');
    });
    return;
  }
  if(a==='mediaMode')return setMediaMode(btn.dataset.kind,btn.dataset.mode);
  if(a==='removeMedia'){
    const kind=btn.dataset.kind;state.attachments[kind]=null;
    $(`[data-image-input="${kind}"]`).value='';
    $(`[data-image-url="${kind}"]`).value='';
    $(`[data-attach-preview="${kind}"]`)?.classList.add('hide');
    return;
  }
  if(a==='share')return exportInfo(id);
  if(a==='chooseCat'){if(!categoryLabels().includes(btn.dataset.cat))return;state.selectCat=btn.dataset.cat;$$('#composerCats .select-category').forEach(b=>b.classList.toggle('active',b===btn));updateTextCoverPreview();return}
}

document.addEventListener('click',e=>{
  const action=e.target.closest('[data-action]');
  if(action){if(action.dataset.action==='open'&&e.target.closest('button[data-action]')&&e.target.closest('button[data-action]')!==action)return;dispatchAction(action,e);return}
  const v=e.target.closest('[data-view]');if(v){setView(v.dataset.view);return}
  const cat=e.target.closest('[data-category]');if(cat){setCat(cat.dataset.category);return}
  const st=e.target.closest('[data-status]');if(st){state.status=st.dataset.status;render(false);return}
});

function setBackgroundInert(on){document.querySelectorAll('body > :not(#modalRoot):not(#toastHost):not(script)').forEach(el=>{el.inert=on})}
document.addEventListener('keydown',e=>{if(e.key==='Tab'&&$('#modalRoot').classList.contains('is-open')){const list=Array.from($('#modalRoot').querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),a[href],[tabindex="0"]')).filter(el=>el.getClientRects().length);const first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}if(e.key==='Escape')closeModal();if((e.key==='Enter'||e.key===' ')&&e.target.matches('.post-card')){e.preventDefault();detail(e.target.dataset.id)}});

document.addEventListener('submit',async e=>{
  if(!e.target.dataset.form)return;e.preventDefault();
  if(e.target.dataset.form==='profileEdit')return saveProfile(e.target);
  if(e.target.dataset.form==='account')return submitAccount(e.target);
  if(PREVIEW_MODE&&['post','claim','claimStatus','comment','ownPostEdit'].includes(e.target.dataset.form))return previewSubmit(e.target);
  if(e.target.dataset.form==='ownPostEdit'){const id=e.target.dataset.id,p=postBy(id),fd=new FormData(e.target);if(!p||p.authorId!==currentUser?.id)return toast('只能编辑自己发布的帖子');const title=String(fd.get('title')||'').trim(),body=String(fd.get('body')||'').trim(),category=String(fd.get('category')||'');if(title.length<2||!body||!categoryLabels().includes(category))return toast('请检查标题、正文和分区');const cardStyle=fd.get('cardStyle')==='image'?'image':'text',coverValue=String(fd.get('coverUrl')||'').trim();if(cardStyle==='image'&&coverValue&&!cleanImageUrl(coverValue))return toast('封面链接必须是有效的 HTTPS URL');const art=cardStyle==='text'?'text':(COVER_ART.includes(p.art)?p.art:'other'),cover_image=cardStyle==='text'?'':(cleanImageUrl(coverValue)||p.coverImage||'');let {error}=await supabase.from('posts').update({title,body,category,card_style:cardStyle,art,cover_image,is_spoiler:fd.get('spoiler')==='on'}).eq('id',id);if(error&&/card_style/i.test(error.message||'')&&/schema cache|column/i.test(error.message||'')){({error}=await supabase.from('posts').update({title,body,category,art,cover_image,is_spoiler:fd.get('spoiler')==='on'}).eq('id',id))}if(error)return toast('修改失败：'+error.message);closeModal();await render();toast('愿望已更新');return}
  if(e.target.dataset.form==='modPostCategory'){
    if(!isAdmin())return toast('需要管理员身份');
    const id=e.target.dataset.id,p=postBy(id),category=String(new FormData(e.target).get('category')||'');
    if(!p)return toast('找不到这条帖子');
    if(!categoryLabels().includes(category)&&category!==p.category)return toast('请选择有效分区');
    if(category===p.category)return toast('帖子已经在这个分区');
    const {data,error}=await supabase.from('posts').update({category}).eq('id',id).eq('is_deleted',false).select('id,category').maybeSingle();
    if(error||!data)return toast('修改分区失败：'+(error?.message||'帖子不存在或没有权限'));
    await render();await detail(id,true);toast('帖子分区已更新');return;
  }
  if(e.target.dataset.form==='addCategory'){if(!isAdmin()&&!PREVIEW_MODE)return toast('需要管理员身份');const name=String(new FormData(e.target).get('category')||'').trim();if(name.length<1||name.length>16||categoryLabels().includes(name)||name==='全部')return toast('名称重复或长度不合适');if((localData.pref.customCats||[]).length>=30)return toast('自定义分区已达上限');localData.pref.customCats=[...(localData.pref.customCats||[]),name];saveLocalPref();saveLocalPreview();adminCategoryManager();renderCats();toast('分区已添加到本机预览');return}
  if(PREVIEW_MODE)return toast('只读预览模式：表单不会连接 Supabase');
  const button=e.target.querySelector('[type=submit]')||e.target.querySelector('button:last-child');if(button)button.disabled=true;try{await handleForm(e.target)}catch(error){toast(error.message||'操作失败，请重试')}finally{if(button)button.disabled=false}
});

document.addEventListener('input',e=>{
  if(['cropZoom','cropX','cropY'].includes(e.target.id))return updateCropPreview();
  if(['profileDisplayName','profileBio'].includes(e.target.id))return rememberProfileDraft();
  if(e.target.id==='pTitle'){updateTextCoverPreview();return}
  if(e.target.id==='postCoverUrl'){state.upload=null;const url=String(e.target.value||'').trim();state.coverUrl=cleanImageUrl(url);const img=$('#postImagePreview');if(img){if(state.coverUrl){img.src=state.coverUrl;img.classList.remove('hide')}else img.classList.add('hide')}return}
  if(e.target.dataset.imageUrl){
    const kind=e.target.dataset.imageUrl;const src=cleanUrl(e.target.value.trim());
    const preview=$(`[data-attach-preview="${kind}"]`);
    if(preview){preview.classList.toggle('hide',!src);if(src)preview.querySelector('img').src=src}
    return;
  }
  if(e.target.id==='modSearch'){
    const term=e.target.value.trim().toLowerCase();
    document.querySelectorAll('.mod-items .mod-item').forEach(el=>{el.hidden=!el.textContent.toLowerCase().includes(term)});
  }
});

document.addEventListener('change',async e=>{
  if(e.target.id==='mineCategory'){mineCategory=e.target.value;pageLimit=24;return render(false)}
  if(e.target.id==='mineStatus'){mineStatus=e.target.value;pageLimit=24;return render(false)}
  if(e.target.name==='status')return toggleDeliveryFields();
  if(e.target.dataset.imageInput){
    const kind=e.target.dataset.imageInput;const f=e.target.files?.[0];if(!f)return;
    try{
      const dataUrl=await compressedPhoto(f,850);
      state.attachments[kind]=dataUrl;
      const preview=$(`[data-attach-preview="${kind}"]`);
      if(preview){preview.querySelector('img').src=dataUrl;preview.classList.remove('hide')}
      toast('图片已压缩准备就绪');
    }catch(err){toast(err.message||'图片处理失败')}
    return;
  }
  if(['profileAvatar','profileCover'].includes(e.target.id)){return beginProfileCrop(e.target.files?.[0],e.target.id==='profileAvatar'?'avatar':'cover')}
  if(e.target.id==='unusedLegacyAvatar'){const f=e.target.files?.[0];if(!f)return;try{localData.pref.avatar=await compressedPhoto(f,360);saveLocalPref();const picker=e.target.closest('.user-avatar-picker')?.querySelector('.avatar');if(picker)picker.innerHTML=`<img src="${esc(localData.pref.avatar)}" alt="${esc(currentName())}的头像">`;toast('头像已更新到本机预览')}catch{toast('无法读取头像图片')}return}
  if(e.target.id==='postCoverUpload'){const f=e.target.files?.[0];if(!f)return;try{state.upload=await compressedPhoto(f);state.coverUrl='';$('#postCoverUrl').value='';const img=$('#postImagePreview');img.src=state.upload;img.classList.remove('hide');toast('封面已压缩')}catch{toast('请选择 JPEG、PNG 或 WebP 图片')}return}
});

$('#themeToggle').addEventListener('click',changeTheme);
$('#brand-home').addEventListener('click',e=>{e.preventDefault();setView('feed')});
$('#categoryNext').addEventListener('click',()=>$('#categoryTabs').scrollBy({left:180,behavior:'smooth'}));
$('#toggleFilters').addEventListener('click',()=>{state.filtersOpen=!state.filtersOpen;renderStatus()});
$('#searchInput').addEventListener('input',e=>{state.query=e.target.value;$('#clearSearch').style.display=state.query?'block':'none';render(false)});
$('#clearSearch').addEventListener('click',()=>{$('#searchInput').value='';state.query='';$('#clearSearch').style.display='none';render(false)});

$('#mobileSearchButton').addEventListener('click',()=>{
  const el=$('#mobileSearchWrap');if(el.firstChild){el.innerHTML='';return}
  el.innerHTML=`<label class="mobile-searchbox">${ic('search','sm')}<input id="mobileSearch" placeholder="搜索你的灵感…" autocomplete="off"><button type="button" id="mobileSearchClear" class="outline-button" style="padding:4px 10px;min-height:25px;font-size:10px">取消</button></label>`;
  $('#mobileSearch').value=state.query;
  $('#mobileSearch').addEventListener('input',e=>{state.query=e.target.value;$('#searchInput').value=state.query;render(false)});
  $('#mobileSearchClear').addEventListener('click',()=>{state.query='';$('#searchInput').value='';el.innerHTML='';render(false)});
  $('#mobileSearch').focus();
});

let touchStart=null;
$('#feed').addEventListener('touchstart',e=>{if(e.touches.length===1)touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});
$('#feed').addEventListener('touchend',e=>{
  if(!touchStart||state.view!=='feed')return;
  const x=e.changedTouches[0].clientX-touchStart.x,y=e.changedTouches[0].clientY-touchStart.y;
  touchStart=null;
  if(Math.abs(x)>95&&Math.abs(y)<70){
    const cats=['全部',...categoryLabels()],idx=cats.indexOf(state.cat),next=Math.min(cats.length-1,Math.max(0,idx+(x<0?1:-1)));
    if(next!==idx)setCat(cats[next]);
  }
},{passive:true});

// Detail consent is per visit, never persisted or shared with list rendering.
function spoilerPrompt(id){updateOrOpen('暴雷内容提示',`<div class="spoiler-prompt"><div class="empty-icon">${ic('info','lg')}</div><p><strong>这篇帖子被发布者标记为暴雷内容，可能包含nsfw或其他信息。</strong></p><div class="spoiler-actions"><button class="primary-button" data-action="spoilerConfirm" data-id="${esc(id)}">确认查看</button><button class="outline-button" data-action="close">返回</button></div></div>`,{type:'spoiler',id})}
function linkedText(value){return esc(value).replace(/https:\/\/[^\s<]+/g,match=>{const raw=match.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"');const url=cleanUrl(raw);return url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer nofollow" style="text-decoration:underline;overflow-wrap:anywhere">${match}</a>`:match})}
async function loadDetail(p){
  const [{data,error},comments,claims]=await Promise.all([supabase.rpc('read_post_detail',{post_key:p.id,accept_spoiler:spoilerSession===p.id}),supabase.rpc('read_post_comments',{post_key:p.id,accept_spoiler:spoilerSession===p.id}),supabase.rpc('read_post_claims',{post_key:p.id,accept_spoiler:spoilerSession===p.id})]);
  if(error)throw error;if(comments.error)throw comments.error;if(!data)throw Error('帖子已删除或无权限访问');
  if(claims.error)throw claims.error;p.claims=await Promise.all((claims.data||[]).map(async c=>{let media=c.media;if(media?.bucket==='claim-media'&&media.src){const {data,error}=await supabase.storage.from('claim-media').createSignedUrl(media.src,3600);media={...media,src:error?'':data.signedUrl}}return{uid:c.uid,id:c.is_mine?currentUser.id:null,name:c.name,note:c.note,status:c.status,hiddenBeforeDone:c.hidden_before_done,media,delivery:c.delivery,date:c.created_at}}));
  p.body=data.body||'';p.coverImage=data.cover_image||'';
  p.comments=(comments.data||[]).map(c=>({id:c.id,author:c.author,authorId:c.is_mine?currentUser.id:null,text:c.text,media:c.media,date:c.created_at}));
}
async function hydrateProfileMedia(){
  for(const kind of ['avatar','cover']){const path=localData.profile[kind+'_path'];localData.profile[kind+'Url']='';if(!path)continue;const {data,error}=await supabase.storage.from('profile-media').createSignedUrl(path,3600);if(error)throw error;localData.profile[kind+'Url']=data.signedUrl;}
}
function privatePortrait(profile=localData.profile){const src=imgSrc(profile.avatarData||profile.avatarUrl||'');return `<span class="profile-avatar">${src?`<img src="${esc(src)}" alt="我的头像">`:esc((profile.display_name||'匿').slice(0,1))}</span>`}
function renderProfilePage(){
  const p=localData.profile,own=localData.posts.filter(x=>x.authorId===currentUser?.id&&!x.isDeleted).length,taken=PREVIEW_MODE?localData.posts.reduce((n,x)=>n+claimsOf(x).filter(c=>c.id===currentUser?.id).length,0):localData.ownClaimHistory.length;
  const cover=imgSrc(p.coverData||p.coverUrl||'');
  $('#profilePage').innerHTML=`<div class="profile-cover">${cover?`<img src="${esc(cover)}" alt="我的主页背景">`:''}</div><div class="profile-info"><div class="profile-topline"><label class="user-avatar-picker" aria-label="点击圆形头像更换头像">${privatePortrait()}<input type="file" id="profileAvatar" accept="image/jpeg,image/png,image/webp"></label><button class="outline-button" data-action="profileEdit">编辑个人资料</button></div><h2>${esc(p.display_name||'匿名旅人')}</h2><p class="profile-id">${PREVIEW_MODE?'LOCAL / 本地演示身份':`私人身份 · ${esc(currentUser?.id||'未连接')}`}</p>${p.bio?`<p class="profile-bio">${esc(p.bio)}</p>`:''}<div class="profile-stats"><span><b>${own}</b> 发布</span><span><b>${taken}</b> 接单</span><span><b>${localData.saved.length}</b> 收藏</span></div><p class="profile-notice">${PREVIEW_MODE?'这是隔离的本机演示空间，资料与操作只保存在这个浏览器。':currentUser?.is_anonymous?'匿名身份仅保存在当前浏览器，清除数据或换设备将无法恢复。请先绑定邮箱。':'你的资料与足迹仅自己可见；匿名发布不会公开关联到这张主页。'}</p><div class="profile-tools"><button class="outline-button" data-action="account">身份与登录</button><button class="outline-button" data-action="${isAdmin()?'adminDashboard':'adminEntry'}">${ic('shield','sm')} ${isAdmin()?'管理后台':'管理员入口'}</button></div></div><p class="profile-group-label">MY CONTENT / 我的内容</p><div class="profile-tabs" role="tablist" aria-label="我的内容">${[['posts','我发布的'],['claims','我接单的']].map(([k,t])=>profileTab(k,t)).join('')}</div><p class="profile-group-label">MY ACTIVITY / 我的足迹 · 仅自己可见</p><div class="profile-tabs" role="tablist" aria-label="我的足迹">${[['saved','我的收藏'],['likes','我的点赞'],['comments','我的评论']].map(([k,t])=>profileTab(k,t)).join('')}</div>`;
  $('#profileFilters')?.remove();
  if(['posts','claims'].includes(mineTab))$('#profilePage').insertAdjacentHTML('afterend',`<div class="profile-filter" id="profileFilters"><select id="mineCategory" aria-label="按分类筛选">${['全部',...categoryLabels()].map(c=>`<option ${mineCategory===c?'selected':''}>${esc(c)}</option>`).join('')}</select><select id="mineStatus" aria-label="按接单状态筛选">${FILTERS.map(c=>`<option ${mineStatus===c?'selected':''}>${esc(c)}</option>`).join('')}</select><span class="muted" style="font-size:11px">按时间从新到旧</span></div>`);
}
function renderClaimHistory(posts){
 if(PREVIEW_MODE){$('#feed').innerHTML=posts.length?posts.slice(0,pageLimit).map(p=>activityRow(p,'claims')).join(''):emptyProfile();return;}
 const rows=localData.ownClaimHistory.filter(c=>(mineCategory==='全部'||c.category===mineCategory)&&(mineStatus==='全部状态'||STATUS[c.status].label===mineStatus));
 $('#resultCount').textContent=`共 ${rows.length} 份接单 · 包含已撤回记录`;
 $('#feed').innerHTML=rows.length?rows.slice(0,pageLimit).map(c=>`<article class="activity-row"><small>${esc(c.category)} · ${dateText(c.created_at)}</small><h3>${esc(c.title)}</h3><p>${c.is_deleted?'已撤回 / 已移除':STATUS[c.status].label}${c.is_spoiler?' · 暴雷帖，确认后查看资源信息':''}</p>${!c.is_spoiler&&c.status==='done'&&c.delivery?`<p>资源位置：${esc(c.delivery.location||'')}</p>`:''}<button class="outline-button" ${c.post_deleted?'disabled':''} data-action="open" data-id="${esc(c.post_id)}">${c.post_deleted?'原帖已删除':'查看原帖 / 更新进度'}</button></article>`).join(''):emptyProfile();
 if(rows.length>pageLimit)$('#feed').insertAdjacentHTML('beforeend','<button class="load-more" data-action="loadMore">加载更多接单</button>');
}
async function moderateRestore(kind,key){if(!isAdmin())return;const {error}=await supabase.rpc('moderate_market_item',{item_kind:kind,item_key:key,removed:false,reason:'管理员核查恢复'});if(error)return toast('恢复失败：'+error.message);await render();await adminDashboard('trash');toast('已恢复并记录审计');}

function profileTab(k,t){return `<button role="tab" aria-selected="${mineTab===k}" data-action="profileTab" data-tab="${k}">${t}</button>`}
function emptyProfile(){return '<div class="empty-board"><h3>这里还没有记录</h3><p>属于你的愿望与回应，会慢慢留在这里。</p></div>'}
function activityRow(p,tab){const c=tab==='claims'?ownedClaim(p):null;const deleted=p.isDeleted;return `<article class="activity-row"><small>${esc(p.category)} · ${dateText(c?.date||p.createdAt)}</small><h3>${esc(p.title)}</h3>${p.isSpoiler?'<span class="spoiler-label">暴雷帖 · 确认后查看详情</span>':''}<small>${deleted?'原帖已删除，暂不可访问':c?STATUS[c.status].label:`${STATUS[p.status].label} · ${claimsOf(p).length}/3 人接单`}</small>${c?.delivery&&c.status==='done'&&!p.isSpoiler?`<p>资源位置：${esc(c.delivery.location||'')} ${c.delivery.url?`<a href="${esc(cleanUrl(c.delivery.url))}" target="_blank" rel="noopener noreferrer">查看领取链接</a>`:''}</p>`:''}<div class="activity-tools">${deleted?'':`<button class="outline-button" data-action="open" data-id="${esc(p.id)}">查看原帖${c?' / 更新进度':''}</button>`}${tab==='saved'?`<button class="outline-button" data-action="save" data-id="${esc(p.id)}">取消收藏</button>`:''}${tab==='likes'?`<button class="outline-button" data-action="like" data-id="${esc(p.id)}">取消点赞</button>`:''}</div></article>`}
function renderCommentHistory(posts){
  if(!PREVIEW_MODE){const rows=localData.commentHistory;$('#resultCount').textContent=`共 ${rows.length} 条评论 · 按评论时间从新到旧`;$('#feed').innerHTML=rows.length?rows.slice(0,pageLimit).map(c=>`<article class="activity-row"><small>${dateText(c.created_at)} · ${esc(c.category)}</small><h3>${esc(c.title)}</h3><p>${c.is_deleted?'这条评论已删除':c.is_spoiler?'暴雷帖评论已隐藏，确认后查看。':esc(c.text||'图片留言')}</p><button class="outline-button" ${c.post_deleted?'disabled':''} data-action="open" data-id="${esc(c.post_id)}" data-comment-target="${esc(c.id)}">${c.post_deleted?'原帖已删除或无权限访问':'进入原帖查看评论'}</button></article>`).join(''):emptyProfile();if(rows.length>pageLimit)$('#feed').insertAdjacentHTML('beforeend','<button class="load-more" data-action="loadMore">加载更多评论</button>');return;}
  const rows=posts.flatMap(p=>(p.comments||[]).filter(c=>c.authorId===currentUser?.id).map(c=>({p,c}))).sort((a,b)=>new Date(b.c.date)-new Date(a.c.date));
  $('#resultCount').textContent=`共 ${rows.length} 条评论 · 按评论时间从新到旧`;
  $('#feed').innerHTML=rows.length?rows.slice(0,pageLimit).map(({p,c})=>`<article class="activity-row"><small>${dateText(c.date)} · ${esc(p.category)}</small><h3>${esc(p.title)}</h3>${p.isSpoiler?'<p class="spoiler-notice">暴雷帖的评论内容已隐藏，进入原帖确认后查看。</p>':`<p>${esc(c.text||'图片留言')}</p>`}<button class="outline-button" ${p.isDeleted?'disabled':''} data-action="open" data-id="${esc(p.id)}" data-comment-target="${esc(c.id)}">${p.isDeleted?'原帖已删除或无权限访问':'进入原帖查看评论'}</button></article>`).join(''):emptyProfile();
  if(rows.length>pageLimit)$('#feed').insertAdjacentHTML('beforeend','<button class="load-more" data-action="loadMore">加载更多评论</button>');
}
function editProfile(){profileDraft={...localData.profile};renderProfileEditor();}
function renderProfileEditor(){
  const p=profileDraft,cover=imgSrc(p.coverData||p.coverUrl||'');
  updateOrOpen('编辑个人资料',`<form data-form="profileEdit"><div class="profile-editor-cover">${cover?`<img src="${esc(cover)}" alt="背景图预览">`:''}</div><div class="profile-image-actions"><label class="outline-button">选择背景图<input type="file" id="profileCover" accept="image/jpeg,image/png,image/webp" class="sr-only"></label><button type="button" class="plain-button" data-action="profileReset" data-kind="cover">恢复默认背景</button></div><div class="profile-editor-avatar"><label class="user-avatar-picker" aria-label="点击圆形头像更换头像">${privatePortrait(p)}<input type="file" id="profileAvatar" accept="image/jpeg,image/png,image/webp"></label><div><strong>点击圆形头像更换</strong><p class="muted" style="font-size:11px">JPEG / PNG / WebP · 最大 12 MB</p><button type="button" class="plain-button" data-action="profileReset" data-kind="avatar">恢复默认头像</button></div></div><div class="form-field"><label class="form-label" for="profileDisplayName">昵称</label><input id="profileDisplayName" name="display_name" maxlength="24" required value="${esc(p.display_name||'匿名旅人')}"></div><div class="form-field"><label class="form-label" for="profileBio">个人简介（可选）</label><textarea id="profileBio" name="bio" maxlength="180" placeholder="留一句关于自己的话…">${esc(p.bio||'')}</textarea></div><p class="fine-print">资料只在你的私人主页中展示，不会替换历史匿名帖的署名。图片仅在保存时上传。</p><div class="form-foot"><small>${PREVIEW_MODE?'本机演示，不上传云端':'关联当前登录身份，仅本人可修改'}</small><button type="submit" class="primary-button">保存资料</button></div></form>`,{type:'profileEdit'});
}
function rememberProfileDraft(){if($('#profileDisplayName'))profileDraft.display_name=$('#profileDisplayName').value;if($('#profileBio'))profileDraft.bio=$('#profileBio').value;}
async function beginProfileCrop(file,kind){
  if(!file)return;if(state.modal?.type!=='profileEdit')profileDraft={...localData.profile};rememberProfileDraft();try{const src=await compressedPhoto(file,2000);const img=new Image();await new Promise((ok,no)=>{img.onload=ok;img.onerror=no;img.src=src});cropTask={img,src,kind};
    updateOrOpen(kind==='avatar'?'裁剪头像':'裁剪背景图',`<img id="cropPreview" class="crop-preview" src="${esc(src)}" alt="裁剪预览" style="aspect-ratio:${kind==='avatar'?'1':'3'};height:auto;max-height:280px"><div class="crop-controls"><label>缩放<input id="cropZoom" type="range" min="1" max="3" step=".05" value="1"></label><label>左右<input id="cropX" type="range" min="0" max="100" value="50"></label><label>上下<input id="cropY" type="range" min="0" max="100" value="50"></label></div><div class="form-foot"><button class="outline-button" data-action="cancelCrop">取消</button><button class="primary-button" data-action="profileCrop">使用此裁剪</button></div>`,{type:'crop'});updateCropPreview();
  }catch(e){toast(e.message||'无法读取图片')}
}
function cropCanvas(){const {img,kind}=cropTask,canvas=document.createElement('canvas');canvas.width=kind==='avatar'?400:1500;canvas.height=kind==='avatar'?400:500;const zoom=Number($('#cropZoom')?.value||1),x=Number($('#cropX')?.value||50)/100,y=Number($('#cropY')?.value||50)/100,scale=Math.max(canvas.width/img.width,canvas.height/img.height)*zoom,w=canvas.width/scale,h=canvas.height/scale;canvas.getContext('2d').drawImage(img,(img.width-w)*x,(img.height-h)*y,w,h,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/webp',.82)}
function updateCropPreview(){if(cropTask&&$('#cropPreview'))$('#cropPreview').src=cropCanvas()}
function applyCrop(){if(!cropTask)return;profileDraft[cropTask.kind+'Data']=cropCanvas();cropTask=null;renderProfileEditor()}
async function saveProfile(form){
  const fd=new FormData(form);profileDraft.display_name=String(fd.get('display_name')||'').trim();profileDraft.bio=String(fd.get('bio')||'').trim();if(!profileDraft.display_name)return toast('请填写昵称');
  const button=form.querySelector('[type=submit]');button.disabled=true;
  try{if(PREVIEW_MODE){localData.profile={...profileDraft};localData.pref.nickname=profileDraft.display_name;saveLocalPreview()}else{
    if(!cloudUpgradeReady)throw Error('云端资料迁移尚未就绪');
    for(const kind of ['avatar','cover'])if(profileDraft[kind+'Data']){const result=await validatedUpload(profileDraft[kind+'Data'],kind);profileDraft[kind+'_path']=result.path;}
    const {error}=await (localData.profile.user_id?supabase.from('profiles').update({display_name:profileDraft.display_name,bio:profileDraft.bio,avatar_path:profileDraft.avatar_path||'',cover_path:profileDraft.cover_path||''}).eq('user_id',currentUser.id):supabase.from('profiles').insert({user_id:currentUser.id,display_name:profileDraft.display_name,bio:profileDraft.bio,avatar_path:profileDraft.avatar_path||'',cover_path:profileDraft.cover_path||''}));if(error)throw error;
    localData.profile={user_id:currentUser.id,display_name:profileDraft.display_name,bio:profileDraft.bio,avatar_path:profileDraft.avatar_path||'',cover_path:profileDraft.cover_path||''};await hydrateProfileMedia();localData.pref.nickname=localData.profile.display_name;
  }closeModal();await render(false);toast('个人资料已保存');}catch(e){toast('保存失败：'+e.message)}finally{button.disabled=false}
}
function accountDialog(){
  if(PREVIEW_MODE)return openModal('身份与登录','<p class="form-lead">当前为本地演示身份，不会发送登录请求。正式版通过 Supabase Auth 保存身份；匿名账户须先绑定邮箱并完成验证，才能跨设备恢复。</p>',{type:'account'});
  const anonymous=currentUser?.is_anonymous;
  openModal('身份与登录',`<p class="form-lead">${anonymous?'先绑定邮箱保留当前匿名身份，完成邮件验证后可跨设备登录。登录已有账号会切换到该账号，当前匿名资料不会自动合并。':'你已使用可恢复账号登录。公开匿名帖依然只显示帖子自己的署名。'}</p><form data-form="account"><div class="form-field"><label class="form-label" for="userEmail">邮箱</label><input id="userEmail" name="email" type="email" autocomplete="email" required></div><div class="form-field"><label class="form-label" for="userPassword">密码（至少 8 位）</label><input id="userPassword" name="password" type="password" autocomplete="new-password" minlength="8" required></div><div class="form-field"><label class="form-label" for="accountAction">操作</label><select id="accountAction" name="mode">${anonymous?'<option value="link">绑定邮箱，保留当前身份</option>':''}<option value="login">登录已有账号</option></select></div><div class="form-foot"><small>请在私人设备上保存登录状态</small><button class="primary-button" type="submit">继续</button></div></form>${!anonymous?'<button class="plain-button" data-action="accountLogout">退出当前账号</button>':''}`,{type:'account'});
}
async function submitAccount(form){const fd=new FormData(form),email=String(fd.get('email')||'').trim(),password=String(fd.get('password')||'');const b=form.querySelector('[type=submit]');b.disabled=true;try{
  if(fd.get('mode')==='link'){const {error}=await supabase.auth.updateUser({email,password},{emailRedirectTo:location.origin+location.pathname});if(error)throw error;toast('验证邮件已发送，请先完成邮箱验证');closeModal();}
  else{if(currentUser?.is_anonymous&&!confirm('登录将切换身份。当前匿名身份若未绑定邮箱，退出后可能无法找回。继续登录？'))return;const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;currentUser=data.user;await checkAdmin();localData.profile={};localData.saved=[];localData.likes=[];localData.posts=[];closeModal();await render();}
}catch(e){toast('操作失败：'+e.message)}finally{b.disabled=false}}
async function logoutAccount(){if(!confirm('退出后需要邮箱密码重新登录，是否继续？'))return;const {error}=await supabase.auth.signOut();if(error)return toast(error.message);currentUser=null;isAdminUser=false;localData.posts=[];localData.saved=[];localData.likes=[];localData.profile={};closeModal();try{await initAuth();await render()}catch(e){toast(e.message)}}
// Preview is an isolated sandbox: no Auth, database or Storage calls.
async function previewSubmit(form){
  const fd=new FormData(form),kind=form.dataset.form,id=form.dataset.id;let p=postBy(id);const now=new Date().toISOString();
  if(kind==='post'){
    const title=String(fd.get('title')||'').trim(),body=String(fd.get('body')||'').trim();if(title.length<2||!body)return toast('请填写标题和正文');const post={id:'demo-'+crypto.randomUUID(),category:state.selectCat,title,body,author:String(fd.get('author')||'').trim()||'匿名旅人',authorId:currentUser.id,createdAt:now,claims:[],comments:[],likes:0,status:'open',isSpoiler:fd.get('spoiler')==='on',cardStyle:state.cardStyle,palette:state.palette,coverImage:state.cardStyle==='image'?(state.upload||state.coverUrl):'',ratio:.85};localData.preview.demoPosts=[post,...(localData.preview.demoPosts||[])];
  }else if(p&&kind==='ownPostEdit'){if(p.authorId!==currentUser.id)return;Object.assign(p,{title:String(fd.get('title')||'').trim(),body:String(fd.get('body')||'').trim(),category:String(fd.get('category')||p.category),cardStyle:fd.get('cardStyle'),isSpoiler:fd.get('spoiler')==='on',coverImage:cleanImageUrl(fd.get('coverUrl'))});
  }else if(p&&kind==='claim'){if(ownedClaim(p)||claimsOf(p).length>=3)return toast('无法继续接单');p.claims.push({uid:crypto.randomUUID(),id:currentUser.id,name:String(fd.get('name')||''),note:String(fd.get('note')||''),date:now,status:'claimed',hiddenBeforeDone:fd.get('hidden')==='on',media:state.attachments.claim?{src:state.attachments.claim}:null});p.status='claimed';
  }else if(p&&kind==='claimStatus'){const c=ownedClaim(p);if(!c)return;c.status=fd.get('status');if(c.status==='done'&&!String(fd.get('location')||'').trim())return toast('请填写资源位置');const raw=String(fd.get('url')||'');if(raw&&!cleanUrl(raw))return toast('请输入有效 HTTPS URL');c.delivery=c.status==='done'?{location:fd.get('location'),url:cleanUrl(raw),note:fd.get('note')}:null;p.status=p.claims.some(c=>c.status==='done')?'done':p.claims.some(c=>c.status==='working')?'working':'claimed';
  }else if(p&&kind==='comment'){const text=String(fd.get('comment')||'').trim(),src=state.attachments.comment||cleanImageUrl(fd.get('mediaUrl'));if(!text&&!src)return toast('请填写留言或选择图片');p.comments.push({id:crypto.randomUUID(),author:currentName(),authorId:currentUser.id,text,date:now,media:src?{src}:null});}
  if(p)localData.preview.posts[p.id]={...p};saveLocalPreview();closeModal();await render();toast('已保存到本机演示');
}

const openReading=window.MimuCarousel.init({esc,ic,openModal});

// 启动初始化
(async()=>{
  const oldTheme=localData.pref.theme==='dark'?'dark':'light';
  setTheme(oldTheme);
  try{
    if(PREVIEW_MODE){currentUser={id:'preview-user'};localData.pref.customCats=[...new Set([...['人设','表情包','聊天列表','教程','疑问'],...(localData.pref.customCats||[])])]}else await initAuth();
  }catch(error){
    console.error('Supabase 初始化失败:',error);
    toast(`云端登录失败：${error.message||'请检查 Supabase Auth 和网络配置'}`);
  }
  await render();
  const linkedPost=new URLSearchParams(location.search).get('post');if(linkedPost)detail(linkedPost);
  if(passwordRecoveryPending)showPasswordReset();
})();

})();

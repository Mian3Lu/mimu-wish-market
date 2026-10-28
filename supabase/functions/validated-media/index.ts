import {createClient} from 'npm:@supabase/supabase-js@2.58.0';
import {inspectImage} from './image-format.js';
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
Deno.serve(async request=>{
  if(request.method==='OPTIONS')return new Response('ok',{headers});
  if(request.method!=='POST')return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers});
  try{
    const auth=request.headers.get('Authorization')||'';
    if(!auth.startsWith('Bearer '))return new Response(JSON.stringify({error:'请先登录'}),{status:401,headers});
    const url=Deno.env.get('SUPABASE_URL')!;
    const userClient=createClient(url,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}},auth:{persistSession:false}});
    const {data:{user},error:authError}=await userClient.auth.getUser();
    if(authError||!user)return new Response(JSON.stringify({error:'登录已过期，请重新连接'}),{status:401,headers});
    if(Number(request.headers.get('Content-Length')||0)>2200000)throw Error('图片须小于 2 MB');
    const form=await request.formData(),file=form.get('image'),kind=String(form.get('kind')||'');
    if(!(file instanceof File)||!['image/webp','image/jpeg','image/png'].includes(file.type)||file.size>2097152)throw Error('请选择 JPEG、PNG 或 WebP 图片，最大 2 MB');
    const mapping={avatar:'profile-media',cover:'profile-media',posts:'wish-media',comments:'wish-media',claims:'claim-media'};
    const bucket=mapping[kind as keyof typeof mapping];if(!bucket)throw Error('图片用途不正确');
    const bytes=new Uint8Array(await file.arrayBuffer());const dimensions=inspectImage(bytes,file.type);
    if(kind==='avatar'&&(dimensions.width!==dimensions.height||dimensions.width>400))throw Error('头像须裁剪为 400 像素以内的正方形');
    if(kind==='cover'&&(dimensions.width>1500||dimensions.height>500))throw Error('背景图须裁剪为 1500 × 500 以内');
    const {error:quotaError}=await userClient.rpc('reserve_media_upload');if(quotaError)throw quotaError;
    // This credential exists only inside the Edge runtime. Client code never receives it.
    const service=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
    const path=`${user.id}/${kind}/${crypto.randomUUID()}.${dimensions.extension}`;
    const {error}=await service.storage.from(bucket).upload(path,bytes,{contentType:dimensions.type,upsert:false});if(error)throw error;
    const publicUrl=bucket==='wish-media'?service.storage.from(bucket).getPublicUrl(path).data.publicUrl:null;
    return new Response(JSON.stringify({path,bucket,publicUrl}),{status:200,headers});
  }catch(e){console.warn('validated-media: upload rejected',e instanceof Error?e.message:'Unknown error');return new Response(JSON.stringify({error:e instanceof Error?e.message:'图片上传失败'}),{status:400,headers});}
});

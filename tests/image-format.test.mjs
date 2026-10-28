import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {inspectImage} from '../supabase/functions/validated-media/image-format.js';
for(const [extension,type] of [['webp','image/webp'],['jpg','image/jpeg'],['png','image/png']]){
 const bytes=new Uint8Array(await readFile(new URL(`./fixtures/valid.${extension}`,import.meta.url)));
 test(`validates genuine ${type} and rejects MIME spoofing/truncation`,()=>{
  assert.deepEqual(inspectImage(bytes,type),{width:32,height:24,type,extension});
  assert.throws(()=>inspectImage(bytes,'image/svg+xml'));
  assert.throws(()=>inspectImage(bytes.subarray(0,24),type));
 });
}
const source=await readFile(new URL('../assets/app/market.js',import.meta.url),'utf8');
const encode=vm.runInNewContext('('+source.match(/function encodeCanvasImage\([^\n]+/)[0]+')');
test('Safari canvas PNG fallback is re-encoded as JPEG with honest MIME',()=>{
 const calls=[];assert.equal(encode({toDataURL(type){calls.push(type);return type==='image/webp'?'data:image/png;base64,AA==':'data:image/jpeg;base64,AA=='}}),'data:image/jpeg;base64,AA==');assert.deepEqual(calls,['image/webp','image/jpeg']);
});
test('native WebP canvas keeps the original encoding',()=>assert.equal(encode({toDataURL(){return 'data:image/webp;base64,AA=='}}),'data:image/webp;base64,AA=='));

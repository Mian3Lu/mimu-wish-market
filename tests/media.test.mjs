import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {inspectWebP} from '../supabase/functions/validated-media/webp.js';
const valid=new Uint8Array(await readFile(new URL('./fixtures/valid.webp',import.meta.url)));
test('accepts actual WebP and reads dimensions',()=>assert.deepEqual(inspectWebP(valid),{width:32,height:24}));
test('rejects a disguised SVG',()=>assert.throws(()=>inspectWebP(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'))));
test('rejects truncation, trailing data and excessive size',()=>{
 assert.throws(()=>inspectWebP(valid.subarray(0,valid.length-2)));
 const extra=new Uint8Array(valid.length+2);extra.set(valid);assert.throws(()=>inspectWebP(extra));
 assert.throws(()=>inspectWebP(new Uint8Array(2097153)));
});
test('rejects oversized dimensions',()=>{const large=valid.slice();const view=new DataView(large.buffer);view.setUint16(26,3000,true);assert.throws(()=>inspectWebP(large))});

// Set MIMU_PGLITE_MODULE to the installed PGlite entry point. No network/production writes.
import {readFile,readdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const modulePath=process.env.MIMU_PGLITE_MODULE;
if(!modulePath)throw Error('Set MIMU_PGLITE_MODULE to an installed @electric-sql/pglite entry point');
const {PGlite}=await import(pathToFileURL(modulePath));
const db=new PGlite();
await db.exec(await readFile('tests/schema-fixture.sql','utf8'));
for(const f of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort()){
 try{await db.exec(await readFile(path.join('supabase/migrations',f),'utf8'));console.log('PASS migration',f)}catch(e){console.error('FAIL migration',f,e.message);process.exit(1)}
}
try{await db.exec(await readFile('tests/upgrade-permissions.sql','utf8'))}catch(e){console.error('FAIL assertion:',e.message,'context:',e.where||e.detail||'');process.exit(1)}
console.log('PASS profile, spoiler, cross-user, likes/favorites, claim limit, restore and audit assertions');
await db.close();

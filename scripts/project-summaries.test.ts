// Run against a fresh disposable local PostgreSQL cluster on port 55439:
// DATABASE_URL=postgres://USER@127.0.0.1:55439/postgres npx tsx scripts/project-summaries.test.ts
// Optional KEEP_FIXTURE_SERVER=1 exposes the built client for manual browser checks.
// No .env is loaded. The local URL guard prevents access to remote databases.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import express from 'express';
import compression from 'compression';
import { pool } from '../server/db';
import { ProjectRepository } from '../server/repositories/projectRepository';
import { storage } from '../server/storage';
import { registerHomeRoutes } from '../server/routes/home';
import { registerProjectRoutes } from '../server/routes/projects';

assert.match(process.env.DATABASE_URL!, /^postgres:\/\/[^@]+@127\.0\.0\.1:55439\/postgres$/);
await pool.query(`CREATE TABLE projects (
id varchar PRIMARY KEY, title text NOT NULL, title_en text, location text NOT NULL,
category text[] NOT NULL, description text NOT NULL, image_url text NOT NULL,
year integer NOT NULL, completion_month text, units integer, site_area text,
gross_floor_area text, scale text, featured boolean, partner_logos jsonb, pdf_url text,
related_articles jsonb, is_live boolean, rent_status text);
CREATE TABLE subprojects (id varchar, parent_project_id varchar, name text, location text,
completion_year integer, completion_month text, units integer, site_area text,
gross_floor_area text, scale text, image_url text, display_order integer);
CREATE TABLE project_units (id varchar, project_id varchar, unit_number text, type text,
description text, area text, deposit text, monthly_rent text, maintenance_fee text,
status text, photos text[], floor_plan_url text, display_order integer, created_at timestamp);`);
const huge = randomBytes(16_500_000).toString('base64');
for(let i=0;i<12;i++) {
 const data = i === 0 ? huge : huge.slice(0, 2_450_000);
 const html = `<p>프로젝트 ${i} 소개</p><img src="data:image/png;base64,${data}"><p>${'함께 사는 집 '.repeat(100)}</p>`;
 await pool.query(`INSERT INTO projects VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'06',20,'320㎡','1200㎡','5층',$9,'[]','/sample.pdf','[]',$10,'available')`,
 [`p${i}`,`주택${i}`,`House ${i}`,'서울',['youth'],html,'/fixture.svg',2026-i,i%2===0,i%2===0]);
}
await pool.query(`INSERT INTO projects VALUES ('empty','빈 설명',null,'서울','{family}','','/fixture.svg',2000,null,null,null,null,null,false,null,null,null,false,null)`);
await pool.query(`INSERT INTO projects VALUES ('plain','텍스트',null,'서울','{family}', $1,'/fixture.svg',1999,null,null,null,null,null,false,null,null,null,false,null)`, ['가'.repeat(400)]);
const repo = new ProjectRepository();
const full = await repo.getProjects();
const summary = await repo.getProjectSummaries();
assert.equal(summary.total,14);
assert.deepEqual(summary.projects.map(p=>p.id),full.projects.map(p=>p.id));
const keys=['id','title','titleEn','location','category','description','imageUrl','year','units','featured'].sort();
for(const p of summary.projects) {
 assert.deepEqual(Object.keys(p).sort(), keys);
 assert.ok([...p.description].length<=300);
 assert.ok(!p.description.includes('data:image') && !p.description.includes('<'));
 const original=full.projects.find(x=>x.id===p.id)!;
 for(const key of keys.filter(k=>k!=='description')) assert.deepEqual(p[key as keyof typeof p],original[key as keyof typeof original]);
}
assert.equal(summary.projects.find(p=>p.id==='empty')!.description,'');
assert.equal(summary.projects.find(p=>p.id==='plain')!.description,'가'.repeat(300));
assert.equal(summary.projects[0].description.slice(0,11),'프로젝트 0 소개 함');
for(const args of [[2,3,undefined,undefined],[1,50,['주택0','주택2'],undefined],[1,50,undefined,true],[1,50,undefined,false],[1,50,['주택1'],true],[1,50,[],undefined],[20,5,undefined,undefined]] as const) {
 const [oldResult,newResult]=await Promise.all([repo.getProjects(...args as [number,number,string[]?,boolean?]),repo.getProjectSummaries(...args as [number,number,string[]?,boolean?])]);
 assert.equal(newResult.total,oldResult.total);
 assert.deepEqual(newResult.projects.map(p=>p.id),oldResult.projects.map(p=>p.id));
}
assert.equal((await repo.getProject('p0'))!.description,full.projects[0].description);
assert.equal((await repo.getProjectsByCategory('youth'))[0].description,full.projects[0].description);
// Home's unrelated sections are isolated fixtures; project routes use the real repository/DB.
storage.getReporterArticles=async()=>({articles:[],total:0});
storage.getSiteSetting=async()=>undefined;
const app=express();
app.use(compression());
app.use((req,_res,next)=>{req.isAuthenticated=()=>req.headers['x-fixture-admin']==='yes';req.user={role:'admin'} as any;next();});
registerHomeRoutes(app);registerProjectRoutes(app);
app.get('/api/page-images',(_req,res)=>res.json([]));
app.get('/api/site-settings/:key',(_req,res)=>res.json(null));
app.get('/api/auth/user',(_req,res)=>res.status(401).json({message:'Unauthorized'}));
app.get('/api/projects/:projectId/units',(_req,res)=>res.json([]));
app.use(express.static('dist/public'));
app.get('/fixture.svg',(_req,res)=>res.type('svg').send('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#e0c9a6"/></svg>'));
app.get('*',(_req,res)=>res.sendFile(process.cwd()+'/dist/public/index.html'));
const server=app.listen(55440,'127.0.0.1');
const base='http://127.0.0.1:55440';
const homeRes=await fetch(base+'/api/home');const home=await homeRes.json();
assert.equal(homeRes.headers.get('cache-control'),'public, max-age=60, s-maxage=60');
assert.deepEqual(Object.keys(home).sort(),['projects','reporters','stats']);
assert.equal(home.projects.length,10);
assert.deepEqual(home.projects,summary.projects.slice(0,10));
for(const query of ['', '?page=2&limit=3','?titles='+encodeURIComponent('주택0,주택2'),'?isLive=true','?isLive=false']) {
 const res=await fetch(base+'/api/projects'+query);assert.equal(res.status,200);
 assert.equal(res.headers.get('cache-control'),'public, max-age=60, s-maxage=60');
 const body=await res.json();assert.ok(Array.isArray(body));assert.ok(body.every(p=>p.description.length<=300));
 const params=new URLSearchParams(query);
 const expected=await repo.getProjectSummaries(Number(params.get('page')) || 1,Number(params.get('limit')) || 50,params.get('titles')?.split(','),params.get('isLive')==='true'?true:params.get('isLive')==='false'?false:undefined);
 assert.deepEqual(body,expected.projects);
}
const detail=await (await fetch(base+'/api/projects/p0')).json();assert.equal(detail.description,full.projects[0].description);
assert.equal((await fetch(base+'/api/projects/missing')).status,404);
assert.equal((await fetch(base+'/api/admin/projects')).status,401);
const admin=await (await fetch(base+'/api/admin/projects',{headers:{'x-fixture-admin':'yes'}})).json();
assert.deepEqual(admin,full.projects);
assert.deepEqual(detail,full.projects[0]);
const bytes=(v:unknown)=>({json:Buffer.byteLength(JSON.stringify(v)),gzip:gzipSync(JSON.stringify(v)).length});
console.log(JSON.stringify({result:'PASS',fixture:'synthetic random base64; 14 projects; largest image data 22,000,000 characters',homeBefore:bytes({projects:full.projects.slice(0,10),reporters:[],stats:null}),homeAfter:bytes(home),listBefore:bytes(full.projects),listAfter:bytes(summary.projects)},null,2));
if(process.env.KEEP_FIXTURE_SERVER==='1') console.log('Fixture server ready at '+base);
else {server.close();await pool.end();}

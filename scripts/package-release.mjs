import {mkdir,cp,writeFile,readFile,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

const root=process.cwd();
const out=path.join(root,'releases');
const downloads=path.join(root,'downloads');
const source=path.join(out,'creative-island-portfolio-template');
const skill=path.join(out,'creative-island-portfolio');
await rm(source,{recursive:true,force:true});
await rm(skill,{recursive:true,force:true});
await mkdir(source,{recursive:true});
await mkdir(downloads,{recursive:true});

for(const name of ['src','tests','index.html','package.json','package-lock.json','vite.config.js','LICENSE']){
  await cp(path.join(root,name),path.join(source,name),{recursive:true});
}
await cp(path.join(root,'docs/TEMPLATE_README.md'),path.join(source,'README.md'));

await writeFile(path.join(source,'src/portfolio-config.js'),`// WorkBuddy 主要编辑本文件：每增加一个分类，四个场景自动增加一个动物入口。
export const profile={
 name:'我的创作岛', subtitle:'把经历，放进风景里', byline:'我的互动作品集',
 footer:'我的作品集', url:'', attribution:'示例内容，请替换为自己的真实作品。', defaultScene:0, socialLinks:[]
};
export const portfolioSections=[
 {short:'创作作品',title:'我的创作作品',intro:'示例分类，请替换为你的真实经历。',items:[['作品示例（请替换）','写下你的角色、过程和成果。']]},
 {short:'项目实践',title:'我的项目实践',intro:'示例分类，请替换为你的真实经历。',items:[['项目示例（请替换）','写下你的具体贡献。']]},
 {short:'学习探索',title:'我的学习探索',intro:'示例分类，请替换为你的真实经历。',items:[['探索示例（请替换）','写下你发现了什么。']]},
 {short:'生活记录',title:'我的生活记录',intro:'示例分类，请替换为你的真实经历。',items:[['故事示例（请替换）','写下你想分享的故事。']]}
];
`);
await writeFile(path.join(source,'src/portfolio-content.js'),`import {profile,portfolioSections} from './portfolio-config.js';
export {portfolioSections};
export function renderPortfolioSection(index){
 const section=portfolioSections[index];
 document.querySelector('#card-index').textContent=\`\${String(index+1).padStart(2,'0')} / \${String(portfolioSections.length).padStart(2,'0')} · \${section.short}\`;
 document.querySelector('#card-title').textContent=section.title;
 document.querySelector('#card-copy').textContent=section.intro;
 const list=document.querySelector('#portfolio-items');list.replaceChildren();
 for(const [title,description,coverUrl,projectUrl] of section.items){
  const item=document.createElement('li'),cover=document.createElement('div'),content=document.createElement('div');
  const name=document.createElement('h3'),detail=document.createElement('p');
  cover.className='portfolio-cover';cover.setAttribute('aria-hidden','true');
  if(coverUrl){const image=document.createElement('img');image.src=coverUrl;image.alt='';image.loading='lazy';image.onerror=()=>{image.remove();cover.textContent=title.slice(0,4)};cover.append(image)}
  else cover.textContent=title.slice(0,4);
  name.textContent=title;detail.textContent=description;content.append(name,detail);
  const url=projectUrl||profile.url;
  if(url){const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='查看作品 ↗';content.append(link)}
  item.append(cover,content);list.append(item);
 }
}
`);
let exploration=await readFile(path.join(source,'src/exploration-ui.js'),'utf8');
exploration=exploration.replace('little-wilds-visited-v1','creative-island-portfolio-visited-v1');
await writeFile(path.join(source,'src/exploration-ui.js'),exploration);
let html=await readFile(path.join(source,'index.html'),'utf8');
html=html.replaceAll('Jason 的创作岛','我的创作岛')
 .replaceAll('JASON LIU · 文创设计与 AI 创作','把经历，放进风景里')
 .replaceAll('刘哲赏 Jason · 作品与实践','我的互动作品集')
 .replaceAll('刘哲赏 Jason · 文创设计师 · AI 创作实践者','我的作品集')
 .replaceAll('https://runcrafts.com/portfolio/#works','#')
 .replaceAll('项目名称与归属来自 Jason 的公开作品集','示例内容，请替换为真实作品')
 .replace('>云朵花语</h1>','>风栖草原</h1>');
await writeFile(path.join(source,'index.html'),html);
const pkg=JSON.parse(await readFile(path.join(source,'package.json'),'utf8'));
pkg.name='creative-island-portfolio';
await writeFile(path.join(source,'package.json'),JSON.stringify(pkg,null,2)+'\n');
const lock=JSON.parse(await readFile(path.join(source,'package-lock.json'),'utf8'));
lock.name=pkg.name;lock.packages[''].name=pkg.name;
await writeFile(path.join(source,'package-lock.json'),JSON.stringify(lock,null,2)+'\n');
await writeFile(path.join(source,'.gitignore'),'node_modules/\ndist/\n.DS_Store\n.env\n.env.*\n');

execFileSync(process.execPath,[path.join(root,'node_modules/vite/bin/vite.js'),'build',source],{cwd:root,stdio:'inherit'});
await mkdir(path.join(skill,'assets'),{recursive:true});
await cp(path.join(root,'skills/creative-island-portfolio/SKILL.md'),path.join(skill,'SKILL.md'));
await cp(source,path.join(skill,'assets/template'),{recursive:true});
await rm(path.join(skill,'assets/template/dist'),{recursive:true,force:true});

// The GitHub root is directly readable as a skill from a single repository URL.
await cp(path.join(skill,'SKILL.md'),path.join(root,'SKILL.md'));
await rm(path.join(root,'assets/template'),{recursive:true,force:true});
await mkdir(path.join(root,'assets'),{recursive:true});
await cp(path.join(skill,'assets/template'),path.join(root,'assets/template'),{recursive:true});

const zip=path.join(downloads,'creative-island-portfolio-workbuddy.zip');
await rm(zip,{force:true});
execFileSync('zip',['-qr',zip,path.basename(skill)],{cwd:out});
execFileSync('unzip',['-tq',zip],{stdio:'inherit'});
console.log('WorkBuddy skill package:',zip);

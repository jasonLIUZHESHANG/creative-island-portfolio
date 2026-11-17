import {mkdir,cp,writeFile,readFile,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const root=process.cwd(),out=path.join(root,'releases');
const staging=path.join(out,'little-wilds');
await mkdir(staging,{recursive:true});
for(const name of ['src','tests','index.html','package.json','package-lock.json','vite.config.js','LICENSE','README.md'])await cp(path.join(root,name),path.join(staging,name),{recursive:true});
await writeFile(path.join(staging,'src/portfolio-config.js'),`export const profile={name:'我的创作岛',subtitle:'A LITTLE WORLD OF MY OWN',byline:'示例作品集 · 等你来填写',footer:'把经历，放进风景里。',url:'',attribution:'示例内容，请替换为自己的真实作品。',defaultScene:2};
export const portfolioSections=[
{short:'创作作品',title:'我的创作作品',intro:'示例分类：替换为你的创作经历。',items:[['作品名称','填写你的角色、过程和成果。']]},
{short:'项目实践',title:'我的项目实践',intro:'示例分类：记录实践与合作。',items:[['项目名称','填写真实背景与贡献。']]},
{short:'学习探索',title:'我的学习探索',intro:'示例分类：记录问题和发现。',items:[['探索主题','填写学习过程和收获。']]},
{short:'生活记录',title:'我的生活记录',intro:'示例分类：分享喜欢的事。',items:[['故事名称','填写想分享的故事。']]}
];\n`);
let html=await readFile(path.join(staging,'index.html'),'utf8');html=html.replace(/Jason 的创作岛/g,'我的创作岛').replace(/JASON LIU · 文创设计与 AI 创作/g,'A LITTLE WORLD OF MY OWN').replace(/刘哲赏 Jason · 作品与实践/g,'示例作品集').replace(/刘哲赏 Jason · 文创设计师 · AI 创作实践者/g,'把经历，放进风景里。').replace(/https:\/\/runcrafts.com\/portfolio\/#works/g,'#').replace(/项目名称与归属来自 Jason 的公开作品集/g,'示例内容，请替换为真实作品');await writeFile(path.join(staging,'index.html'),html);
await writeFile(path.join(staging,'.gitignore'),'node_modules/\ndist/\n.DS_Store\n');
execFileSync(process.execPath,[path.join(root,'node_modules/vite/bin/vite.js'),'build',staging],{cwd:root,stdio:'inherit'});
const skill=path.join(out,'little-wilds-portfolio');await mkdir(path.join(skill,'assets'),{recursive:true});await cp(path.join(root,'skills/little-wilds-portfolio/SKILL.md'),path.join(skill,'SKILL.md'));await cp(staging,path.join(skill,'assets/template'),{recursive:true});await rm(path.join(skill,'assets/template/dist'),{recursive:true,force:true});
for(const [zip,dir] of [['little-wilds-source.zip','little-wilds'],['little-wilds-workbuddy.zip','little-wilds-portfolio']]){await rm(path.join(out,zip),{force:true});execFileSync('zip',['-qr',zip,dir],{cwd:out});}
await rm(path.join(out,'little-wilds-static.zip'),{force:true});execFileSync('zip',['-qr',path.join(out,'little-wilds-static.zip'),'.'],{cwd:path.join(staging,'dist')});
console.log('Release packages ready:',out);

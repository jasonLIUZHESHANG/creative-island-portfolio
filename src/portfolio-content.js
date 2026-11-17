import {profile, portfolioSections} from './portfolio-config.js';
export {portfolioSections};
const workAssets={
 '花·旦':['huadan','围绕荔湾文化主题组织系列视觉与路演展示','https://runcrafts.com/gallery/'],
 '车仔茶包':['tea','整合西关文化与茶品包装视觉'],
 '妈祖 · 千年守望':['mazu-h5','将文化产品延伸为可探索的数字页面','https://runcrafts.com/qiannian-shouwang/'],
 '岭南荔枝胸针':['53',null],
 '云萝植物园明信片':['51',null],
 '高校定制文创':['43',null],
 '澳门城市大学押花工作坊':['102',null],
 '香港教育大学师生交流':['105',null],
 '华贸 AI 文创课程':['13','组织文化调研、AI 制作与作品集实操任务'],
 '阿柴送信':['achai','组织角色、场景与可参与的送信体验'],
 '盯非遗':['chanceping','整理非遗机会、规则与行动入口','https://ich.chanceping.com/ich'],
 '润葭文化官网':['runjia-site','设计作品展示与中英文内容入口','https://runcrafts.com/'],
 '油管矩阵':['youtube-matrix','建立内容制作、发布与复盘流程']
};
export function renderPortfolioSection(index){
 const section=portfolioSections[index];
 document.querySelector('#card-index').textContent=`${String(index+1).padStart(2,'0')} / ${String(portfolioSections.length).padStart(2,'0')} · ${section.short}`;
 document.querySelector('#card-title').textContent=section.title;
 document.querySelector('#card-copy').textContent=section.intro;
 const list=document.querySelector('#portfolio-items');list.replaceChildren();
 for(const [title,description] of section.items){
  const item=document.createElement('li'),cover=document.createElement('div'),content=document.createElement('div'),name=document.createElement('h3'),detail=document.createElement('p'),link=document.createElement('a');
  cover.className='portfolio-cover';cover.setAttribute('aria-hidden','true');
  const [asset,contribution,url]=workAssets[title]||[];
  if(asset){const image=document.createElement('img');image.src=`https://runcrafts.com/portfolio/assets/${asset}.webp`;image.alt='';image.loading='lazy';image.onerror=()=>{image.remove();cover.textContent=title.slice(0,4);};cover.append(image);}else cover.textContent=title.slice(0,4);
  name.textContent=title;detail.textContent=contribution?`${description} · ${contribution}`:description;
  link.textContent=url?'查看项目 ↗':'在作品集中查看 ↗';link.href=url||profile.url;link.target='_blank';link.rel='noopener noreferrer';
  content.append(name,detail,link);item.append(cover,content);list.append(item);
 }
}

import {profile,portfolioSections} from './portfolio-config.js';
export {portfolioSections};
export function renderPortfolioSection(index){
 const section=portfolioSections[index];
 document.querySelector('#card-index').textContent=`${String(index+1).padStart(2,'0')} / ${String(portfolioSections.length).padStart(2,'0')} · ${section.short}`;
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

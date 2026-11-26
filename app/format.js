export function number(n,d=1){return new Intl.NumberFormat('en-US',{maximumFractionDigits:d}).format(n);}
export function value(n,unit,compact=true){if(unit==='usd')return '$'+(compact&&n>=1e9?number(n/1e9,2)+'B':number(n,2));if(unit==='people'&&compact)return number(n/1e6,2)+'M';return number(n,2)+(unit==='%'?'%':'');}
export const signed=n=>(n>0?'+':'')+number(n,1)+'%';
export const unitLabel=u=>({usd:'current US dollars',births:'births per woman',people:'people','per 1,000':'per 1,000 live births','%':'percent',years:'years'})[u]||u;

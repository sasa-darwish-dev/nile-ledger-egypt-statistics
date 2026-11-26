import {DATA} from './data.js';
export {DATA};
export const indicators=DATA.indicators;
export const topics=['Economy','People','Health','Society'];
export const topicOf=i=>['Education','Infrastructure'].includes(i.topic)?'Society':i.topic;
export const getIndicator=code=>indicators.find(i=>i.code===code)||indicators[0];
export const names={'NY.GDP.MKTP.CD':'Gross domestic product','NY.GDP.PCAP.CD':'GDP per capita','FP.CPI.TOTL.ZG':'Consumer price inflation','SL.UEM.TOTL.ZS':'Unemployment','NE.EXP.GNFS.ZS':'Exports of goods & services','SP.POP.GROW':'Population growth','SP.URB.TOTL.IN.ZS':'Urban population','SP.DYN.TFRT.IN':'Fertility rate','SH.DYN.MORT':'Under-5 mortality','SE.ADT.LITR.ZS':'Adult literacy','EG.ELC.ACCS.ZS':'Access to electricity','IT.NET.USER.ZS':'Internet use'};
export const title=i=>names[i.code]||i.name;
export const latest=i=>i.series.at(-1);
export const source=DATA.source;
export function change(i,ten=true){const last=latest(i);const first=ten?i.series.find(p=>p[0]===last[0]-10):i.series[0];if(!first)return null;return {value:(last[1]/first[1]-1)*100,from:first[0],to:last[0]};}

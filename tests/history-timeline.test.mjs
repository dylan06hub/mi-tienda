import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { cargarTS } from './cargar-ts.mjs';

const steps=Array.from({length:4},(_,i)=>({year:String(2022+i),title:`Etapa ${i}`,text:`Historia ${i}`,image:{src:`/etapa-${i}.webp`,alt:`Foto ${i}`}}));
function find(node,predicate){if(!node||typeof node!=='object')return;if(predicate(node))return node;for(const child of React.Children.toArray(node.props?.children)){const found=find(child,predicate);if(found)return found;}}
function setup(){
  const state=[],listeners={},mediaListeners={};let cursor,effects,tick,disconnected=false,cleared=false,observe;
  const media={matches:false,addEventListener:(name,fn)=>{mediaListeners[name]=fn;},removeEventListener:name=>{delete mediaListeners[name];}};
  const doc={visibilityState:'visible',addEventListener:(name,fn)=>{listeners[name]=fn;},removeEventListener:name=>{delete listeners[name];}};
  const {HistoryTimeline}=cargarTS('components/HistoryTimeline.tsx',{
    'react/jsx-runtime':jsxRuntime,'next/image':{default:'img'},
    react:{useId:()=> 'historia',useRef:()=>({current:{}}),useEffect:fn=>effects.push(fn),useState:initial=>{const key=cursor++;if(!(key in state))state[key]=initial;return[state[key],next=>{state[key]=typeof next==='function'?next(state[key]):next;}];}},
  },{document:doc,window:{matchMedia:()=>media,setInterval:fn=>{tick=fn;return 1;},clearInterval:()=>{cleared=true;}},IntersectionObserver:class{constructor(fn){observe=fn;}observe(){}disconnect(){disconnected=true;}}});
  const render=()=>{cursor=0;effects=[];return HistoryTimeline({steps});};
  const ui=render();const dispose=effects[0]();
  return{state,render,ui,media,doc,listeners,mediaListeners,tick:()=>tick(),inView:value=>observe([{isIntersecting:value,intersectionRatio:value?0.5:0}]),runTimer:()=>effects[1](),dispose,cleaned:()=>disconnected&&Object.keys(listeners).length===0&&Object.keys(mediaListeners).length===0,cleared:()=>cleared};
}
test('la línea avanza solo cuando está visible y resalta la etapa y su imagen',()=>{
  const h=setup();h.render();assert.equal(h.runTimer(),undefined);
  h.inView(true);h.render();const stop=h.runTimer();h.tick();assert.equal(h.state[0],1);
  const ui=h.render();assert.equal(find(ui,el=>el.props?.['aria-current']==='step').props['aria-label'],'2023: Etapa 1');
  assert.equal(find(ui,el=>el.type==='img').props.src,'/etapa-1.webp');
  h.tick();h.tick();h.tick();assert.equal(h.state[0],0,'el recorrido vuelve al primer punto');
  stop();assert.equal(h.cleared(),true);h.dispose();assert.equal(h.cleaned(),true);
});
test('permite elegir una etapa y pausa con foco, movimiento reducido o pestaña oculta',()=>{
  const h=setup();h.inView(true);let ui=h.render();
  ui.props.onFocusCapture();h.render();assert.equal(h.runTimer(),undefined);
  find(ui,el=>el.props?.['aria-label']==='2025: Etapa 3').props.onClick();assert.equal(h.state[0],3);
  ui=h.render();ui.props.onBlurCapture({currentTarget:{contains:()=>false},relatedTarget:null});h.render();assert.equal(typeof h.runTimer(),'function');
  h.media.matches=true;h.mediaListeners.change();h.render();assert.equal(h.runTimer(),undefined);
  h.media.matches=false;h.mediaListeners.change();h.doc.visibilityState='hidden';h.listeners.visibilitychange();h.render();assert.equal(h.runTimer(),undefined);
  h.dispose();
});

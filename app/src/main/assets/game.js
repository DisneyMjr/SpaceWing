(()=>{'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),mute=document.querySelector('#mute');
function loadBest(){try{return Number(localStorage.getItem('spacewingBest')||0)||0}catch(e){return 0}}
function saveBest(value){try{localStorage.setItem('spacewingBest',String(value))}catch(e){}}
const W=360,H=640; let scale=1,offX=0,offY=0,last=0,mode='title',score=0,best=loadBest(),failures=0,elapsed=0,scroll=0,spawn=0,shipY=H*.44,vel=0,pipes=[],particles=[],sound=true,actx=null,shimmer=0;
const ship=new Image();ship.src='nave.png';
const pipeTop=new Image();pipeTop.src='obstaculo_superior.png';
const pipeBottom=new Image();pipeBottom.src='obstaculo_inferior.png';
function resize(){const d=window.devicePixelRatio||1;canvas.width=Math.round(innerWidth*d);canvas.height=Math.round(innerHeight*d);scale=Math.min(canvas.width/W,canvas.height/H);offX=(canvas.width-W*scale)/2;offY=(canvas.height-H*scale)/2;ctx.imageSmoothingEnabled=false}window.addEventListener('resize',resize);resize();
let stars=Array.from({length:95},(_,i)=>({x:(i*73.7+17)%W,y:(i*39.3+61)%H,r:i%11===0?2:1,s:.12+(i%4)*.08}));
function beep(freq=550,d=.08,type='square',endFreq=freq*.7){if(!sound)return;try{actx??=new(window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();let o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime;o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,endFreq),t+d);g.gain.setValueAtTime(.055,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+d)}catch(e){}}
mute.onclick=e=>{e.stopPropagation();sound=!sound;mute.textContent=sound?'🔊':'🔇'};
function reset(){mode='play';score=0;elapsed=0;scroll=0;spawn=0;shipY=H*.45;vel=-185;pipes=[];particles=[];beep(500,.08,'triangle',760)}
function flap(){if(mode==='title'||mode==='over'){reset();return}if(mode!=='play')return;vel=-245;beep(620,.065,'square',420);for(let i=0;i<5;i++)particles.push({x:104,y:shipY+9,vx:-45-Math.random()*85,vy:(Math.random()-.5)*65,t:.27,c:i%2?'#ff7a28':'#ffe95b'})}
canvas.addEventListener('pointerdown',e=>{e.preventDefault();flap()});window.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();if(!e.repeat)flap()}});
function lose(){if(mode!=='play')return;mode='over';failures++;beep(180,.24,'sawtooth',65);if(score>best){best=score;saveBest(best)}if(failures%4===0&&window.AndroidAds?.showInterstitial)window.AndroidAds.showInterstitial()}
function update(dt){shimmer+=dt;scroll+=dt*42;for(const s of stars){s.x-=s.s*dt*30;if(s.x<0)s.x+=W}for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.t-=dt}particles=particles.filter(p=>p.t>0);if(mode!=='play')return;elapsed+=dt;vel+=590*dt;shipY+=vel*dt;spawn-=dt;if(spawn<=0){spawn=1.52;let gap=168-Math.min(score,25)*1.5;let cy=145+Math.random()*300;pipes.push({x:W+30,cy,gap,passed:false})}const speed=128+Math.min(score,35)*1.8;for(const p of pipes){p.x-=speed*dt;if(!p.passed&&p.x+59<105){p.passed=true;score++;beep(840,.10,'triangle',1160)}if(p.x<136&&p.x+57>90){let top=p.cy-p.gap/2,bot=p.cy+p.gap/2;if(shipY-14<top||shipY+14>bot)lose()}}pipes=pipes.filter(p=>p.x>-85);if(shipY<24||shipY>H-42)lose()}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h))}
function backdrop(){let grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#030a21');grad.addColorStop(.55,'#081d4b');grad.addColorStop(1,'#162d62');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
ctx.save();ctx.globalAlpha=.26;ctx.translate(175,210);ctx.rotate(-.35);let neb=ctx.createRadialGradient(0,0,10,0,0,160);neb.addColorStop(0,'#be48ff');neb.addColorStop(.4,'#7439ed');neb.addColorStop(1,'transparent');ctx.fillStyle=neb;ctx.fillRect(-215,-160,430,320);ctx.restore();
ctx.fillStyle='#13538a';ctx.beginPath();ctx.arc(-52,144,116,0,Math.PI*2);ctx.fill();ctx.fillStyle='#257cba';ctx.beginPath();ctx.arc(-53,144,111,Math.PI*.95,Math.PI*1.6);ctx.lineWidth=7;ctx.strokeStyle='#6bd7ff';ctx.stroke();
ctx.fillStyle='#57378c';ctx.beginPath();ctx.arc(339,98,52,0,Math.PI*2);ctx.fill();for(let i=0;i<5;i++)rect(298,82+i*11,77,3,'#794ba0');
for(const s of stars){const alpha=.55+.35*Math.sin(shimmer*2+s.y);ctx.fillStyle=`rgba(172,235,255,${alpha})`;rect(s.x,s.y,s.r,s.r,ctx.fillStyle);if(s.r===2){rect(s.x-3,s.y,8,1,'#93e5ff');rect(s.x,s.y-3,1,8,'#93e5ff')}}
for(let i=0;i<16;i++){let x=i*25;let h=35+((i*13)%46);rect(x,H-88-h,17,h,'#142954');rect(x+6,H-83-h,2,4,'#31a5db');rect(x+6,H-66-h,2,4,'#ed9b4a')}rect(0,H-42,W,42,'#1d3153');rect(0,H-42,W,5,'#8099ae');for(let x=-40;x<W+40;x+=42){rect(x-(scroll*1.4%42),H-36,23,5,'#f18b2d');rect(x-(scroll*1.4%42),H-6,32,3,'#354b7b')}}
function obstacle(p){let x=Math.round(p.x),pw=58,top=Math.max(0,p.cy-p.gap/2),bot=Math.min(H,p.cy+p.gap/2);
function fallback(y,h,capTop){rect(x+5,y,pw-10,h,'#132b4a');rect(x+13,y,pw-26,h,'#137dc5');rect(x+19,y,11,h,'#72f6ff');let capY=capTop?y+h-20:y;rect(x,capY,pw,20,'#17263e');rect(x+4,capY+3,pw-8,14,'#6484a7');rect(x+9,capY+6,pw-18,7,'#15e3fb');}
// Mantém o acabamento metálico na ponta visível dos tubos.
function drawPipe(im,y,h,upper){if(h<=0)return;if(!im.complete||!im.naturalWidth){fallback(y,h,upper);return}
const w=im.naturalWidth,ih=im.naturalHeight,cap=Math.min(95,Math.round(ih*.22)),endHeight=Math.min(30,h),bodyH=Math.max(0,h-endHeight);
ctx.save();ctx.beginPath();ctx.rect(x,y,pw,h);ctx.clip();ctx.imageSmoothingEnabled=false;
if(upper){if(bodyH>0)ctx.drawImage(im,0,0,w,ih-cap,x,y,pw,bodyH);ctx.drawImage(im,0,ih-cap,w,cap,x,y+bodyH,pw,endHeight)}
else{ctx.drawImage(im,0,0,w,cap,x,y,pw,endHeight);if(bodyH>0)ctx.drawImage(im,0,cap,w,ih-cap,x,y+endHeight,pw,bodyH)}
ctx.restore()}
drawPipe(pipeTop,0,top,true);drawPipe(pipeBottom,bot,H-bot,false)}
function shipDraw(){ctx.save();ctx.translate(112,shipY);ctx.rotate(Math.max(-.37,Math.min(.75,vel/530)));let bob=mode==='title'?Math.sin(shimmer*3)*4:0;if(ship.complete&&ship.naturalWidth){ctx.drawImage(ship,-33,-22+bob,67,44)}else{rect(-23,-12+bob,42,25,'#ffde00');rect(0,-10+bob,19,19,'#29c5ff');rect(-36,-6+bob,16,11,'#ff6a29');rect(-8,13+bob,19,8,'#ff883b')}ctx.restore()}
function center(s,y,size=18,color='#fff'){ctx.font=`900 ${size}px system-ui`;ctx.fillStyle='#07112c';ctx.textAlign='center';ctx.fillText(s,W/2+2,y+3);ctx.fillStyle=color;ctx.fillText(s,W/2,y)}
function draw(){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.setTransform(scale,0,0,scale,offX,offY);backdrop();for(const p of pipes)obstacle(p);for(const p of particles)rect(p.x,p.y,4,4,p.c);shipDraw();
if(mode==='play')center(''+score,70,38,'#fef8cf');
if(mode==='title'){rect(24,176,312,170,'#061a3bdc');center('SPACE WING',225,35,'#ffda4d');center('TOQUE PARA VOAR',272,18,'#98e9ff');center('DESVIE DOS TUBOS',303,14,'#d0e4ff');center('RECORDE: '+best,332,14,'#ffe995')}
if(mode==='over'){rect(24,173,312,203,'#07152fe8');center('FIM DE JOGO',215,30,'#ffb54c');center('PONTOS: '+score,263,24,'#fff');center('RECORDE: '+best,299,19,'#a6eeff');center('TOQUE PARA RECOMEÇAR',343,16,'#ffdf71')}}
function loop(t){let dt=Math.min(.035,((t-last)||16)/1000);last=t;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
})();

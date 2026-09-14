const section=document.getElementById('truckSection');
const video=document.getElementById('truckVideo');
let duration=0,target=0,current=0;
video.addEventListener('loadedmetadata',()=>{duration=video.duration; video.currentTime=0.01;});
function update(){if(!duration)return;const rect=section.getBoundingClientRect();const distance=section.offsetHeight-innerHeight;const progress=Math.max(0,Math.min(1,-rect.top/distance));target=progress*Math.max(0,duration-.05)}
addEventListener('scroll',update,{passive:true});addEventListener('resize',update);
function animate(){current+=(target-current)*.14;if(duration&&Math.abs(video.currentTime-current)>.015){try{video.currentTime=current}catch(e){}}requestAnimationFrame(animate)}
update();animate();

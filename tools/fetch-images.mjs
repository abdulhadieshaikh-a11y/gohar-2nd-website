// Downloads Gohar images from the current site into assets/img
import fs from 'node:fs'; import path from 'node:path';
const base='https://gohar-rcsi.vercel.app';
const list=`brand/gohar-logo-light-trim.png brand/gohar-logo-dark-trim.png
projects/141-broadway-heights/dusk.jpg projects/141-broadway-heights/exterior.jpg projects/141-broadway-heights/rooftop-pool.jpg projects/141-broadway-heights/terrace.jpg projects/141-broadway-heights/living.jpg projects/141-broadway-heights/bedroom.jpg projects/141-broadway-heights/plan-basement.jpg projects/141-broadway-heights/plan-typical-residential.jpg projects/141-broadway-heights/plan-roof.jpg
projects/gohar-gateway/exterior.webp projects/gohar-gateway/aerial-courtyard.webp projects/gohar-gateway/hotel-tower.jpg projects/gohar-gateway/courtyard.jpg
projects/gohar-golf-vista/exterior.webp projects/gohar-golf-vista/golf-course.webp projects/gohar-golf-vista/towers-aerial.webp projects/gohar-golf-vista/facade-detail.webp projects/gohar-golf-vista/balconies.webp
projects/gohar-residencia-shopping-mall/render-010.webp projects/gohar-residencia-shopping-mall/street-view.jpg projects/gohar-residencia-shopping-mall/render-008.webp projects/gohar-residencia-shopping-mall/aerial.jpg projects/gohar-residencia-shopping-mall/render-005.webp projects/gohar-residencia-shopping-mall/render-001.webp
projects/gohar-towers/towers-sky.jpg projects/gohar-towers/exterior.jpg
projects/gohar-complex-shopping-mall/exterior.jpg
projects/gohar-green-corner-shopping-center/exterior.jpg projects/gohar-green-corner-shopping-center/brochure-exterior.jpg projects/gohar-green-corner-shopping-center/street-view.jpg projects/gohar-green-corner-shopping-center/plan-basement.jpg projects/gohar-green-corner-shopping-center/plan-lower-ground.jpg projects/gohar-green-corner-shopping-center/plan-upper-ground.jpg projects/gohar-green-corner-shopping-center/plan-1st-4th.jpg projects/gohar-green-corner-shopping-center/plan-2nd-3rd-5th.jpg
projects/gohar-rabi-center/day-view.jpg
projects/gohar-villas/gate.jpg projects/gohar-villas/masterplan-phase-1.webp projects/gohar-villas/masterplan-phase-2.webp projects/gohar-villas/masterplan-phase-3.webp projects/gohar-villas/masterplan.jpg projects/gohar-villas/park.jpg projects/gohar-villas/community-centre.jpg projects/gohar-villas/masjid.jpg projects/gohar-villas/gate-approach.webp projects/gohar-villas/hospital.jpg projects/gohar-villas/commercial-area.webp
projects/kn-gohar-green-city/view-3.jpg projects/kn-gohar-green-city/master-layout-plan.jpg projects/kn-gohar-green-city/photo-club-house.jpg projects/kn-gohar-green-city/photo-lawn.jpg projects/kn-gohar-green-city/photo-garden-walk.jpg projects/kn-gohar-green-city/photo-street.jpg projects/kn-gohar-green-city/photo-facade.jpg projects/kn-gohar-green-city/view-2.jpg projects/kn-gohar-green-city/view-1.jpg
stories/meezan-bank-mou.jpg stories/green-hotel-reit-signing.jpg`.split(/\s+/).filter(Boolean);
let ok=0;
await Promise.all(list.map(async p=>{
  const out=path.join('assets/img',p.replace(/^projects\//,''));
  fs.mkdirSync(path.dirname(out),{recursive:true});
  const r=await fetch(`${base}/images/${p}`); if(!r.ok){console.log('FAIL',p,r.status);return}
  fs.writeFileSync(out,Buffer.from(await r.arrayBuffer())); ok++;
}));
console.log('downloaded',ok,'of',list.length);

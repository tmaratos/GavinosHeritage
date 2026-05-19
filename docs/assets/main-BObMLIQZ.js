import{r as l,b as s}from"./layout-BFWlbxq1.js";const i=[{id:"no-straw",title:"No Straw Campaign",body:"Gavino's made the decision to take a stand against plastic straws. Something as small as a single straw might not seem like much, but imagine millions used once and thrown away.",active:!0,type:"general"}],d={special:"Daily Special",hours:"Hours",catering:"Catering",hiring:"Now Hiring",general:"Announcement"};function u(e){return d[e]||d.general}function h(e,t=new Date){const n=t.getTime();return e.filter(a=>{if(!a.active)return!1;if(a.startDate){const o=new Date(a.startDate).getTime();if(Number.isFinite(o)&&n<o)return!1}if(a.endDate){const o=new Date(a.endDate).getTime();if(Number.isFinite(o)&&n>o)return!1}return!0})}function r(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function f(e){const t=u(e.type),n=e.buttonText&&e.buttonLink?`<a class="chalkboard-item__cta" href="${r(e.buttonLink)}"${e.buttonLink.startsWith("http")?' target="_blank" rel="noopener noreferrer"':""}>${r(e.buttonText)}</a>`:"";return`
    <article class="chalkboard-item chalkboard-item--${r(e.type)}" data-announcement-id="${r(e.id)}">
      <p class="chalkboard-item__type">${r(t)}</p>
      <h3 class="chalkboard-item__title">${r(e.title)}</h3>
      <p class="chalkboard-item__body">${r(e.body)}</p>
      ${n}
    </article>
  `}function m(e,t){if(!t)return;const n=h(e);if(n.length===0){t.hidden=!0,t.innerHTML="";return}t.hidden=!1,t.innerHTML=`
    <section class="chalkboard-section" aria-label="Today's announcements">
      <div class="container">
        <div class="chalkboard">
          <div class="chalkboard__frame">
            <header class="chalkboard__header">
              <p class="chalkboard__eyebrow">From our kitchen</p>
              <h2 class="chalkboard__title">Today's Board</h2>
            </header>
            <div class="chalkboard__items">
              ${n.map(f).join("")}
            </div>
          </div>
        </div>
      </div>
    </section>
  `}function p(){return Array.isArray(i)?i:i.announcements||[]}function b(){const e=document.getElementById("chalkboard-mount");e&&m(p(),e)}const g=[{days:"Monday – Tuesday",hours:"Closed"},{days:"Wednesday – Thursday",hours:"12PM – 8PM"},{days:"Friday – Saturday",hours:"12PM – 9PM"},{days:"Sunday",hours:"4PM – 8PM"}],y="*Our current hours are due to COVID-19",c={schedule:g,covidDisclaimer:y};function k(){if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.querySelectorAll(".fade-in").forEach(n=>n.classList.add("is-visible"));return}const t=new IntersectionObserver(n=>{n.forEach(a=>{a.isIntersecting&&(a.target.classList.add("is-visible"),t.unobserve(a.target))})},{threshold:.12,rootMargin:"0px 0px -40px 0px"});document.querySelectorAll(".fade-in").forEach(n=>t.observe(n))}function v(){const e=document.getElementById("hours-list");if(!e)return;e.innerHTML=c.schedule.map(({days:n,hours:a})=>`
        <li>
          <span>${n}</span>
          <span>${a}</span>
        </li>
      `).join("");const t=document.getElementById("hours-note");t&&c.covidDisclaimer&&(t.textContent=c.covidDisclaimer)}function _(){document.querySelectorAll("[data-phone]").forEach(e=>{e.textContent=s.phone,e.tagName==="A"&&(e.href=`tel:${s.phoneTel}`)}),document.querySelectorAll("[data-address]").forEach(e=>{e.textContent=s.address.full})}l();b();v();_();k();

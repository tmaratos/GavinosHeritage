import{r as u,a as m}from"./layout-BFWlbxq1.js";const f="Dine-In / To-Go Menu",h="Download the full PDF below, or browse highlights here.",g=[{id:"signature-pizzas",name:"Signature Pizzas",description:"Hand-tossed, stone-baked New York-style pies.",items:[{name:"Cheese Pizza",description:"Classic NY-style with our house sauce and mozzarella.",price:"See PDF"},{name:"Margherita",description:"Fresh mozzarella, basil, and tomato.",price:"See PDF"}]},{id:"baked-pastas",name:"Baked Pastas",items:[{name:"Baked Ziti",description:"Penne, ricotta, mozzarella, and marinara.",price:"See PDF"}]}],p={title:f,subtitle:h,sections:g},v="Lunch Menu",b="Available during lunch hours — see PDF for full list and prices.",y=[{id:"lunch-specials",name:"Lunch Specials",items:[{name:"Slice & Salad Combo",description:"One slice of cheese pizza with house salad.",price:"See PDF"}]}],$={title:v,subtitle:b,sections:y},M="Catering Menu",E="Feed your group — download the catering PDF for trays, pans, and pricing.",I=[{id:"catering-trays",name:"Catering Trays",items:[{name:"Party Pizza Trays",description:"Full and half-sheet options for events and offices.",price:"See PDF"}]}],S={title:M,subtitle:E,sections:I},P=[{id:"dine-in",label:"Dine-In / To-Go Menu",file:"/assets/pdfs/menus/Gavinos-Menu.pdf"},{id:"lunch",label:"Lunch Menu",file:"/assets/pdfs/menus/Gavinos-Lunch-Menu-Feb-2022-PDF.pdf"},{id:"catering",label:"Catering Menu",file:"/assets/pdfs/menus/Gavinos-Catering-menu-March-2022-PDF.pdf"}],o={links:P},r={dinner:p,lunch:$,catering:S};let d="dinner";function z(e){return e?String(e).replace(/^\$/,""):""}function L(e){return!!e.image}function w(e){const n=L(e),t=n?`<div class="menu-card__image">
      <img src="${e.image}" alt="" loading="lazy" onerror="this.parentElement.remove()" />
    </div>`:"";return`
    <article class="menu-card${n?" menu-card--has-image":""}">
      ${t}
      <div class="menu-card__body">
        <div class="menu-card__head">
          <h3 class="menu-card__name">${e.name}</h3>
          ${e.price?`<span class="menu-card__price">${z(e.price)}</span>`:""}
        </div>
        ${e.description?`<p class="menu-card__description">${e.description}</p>`:""}
      </div>
    </article>
  `}function F(e){return`
    <section class="menu-section fade-in" id="${e.id}" aria-labelledby="heading-${e.id}">
      <header class="menu-section__header">
        <h2 id="heading-${e.id}">${e.name}</h2>
        ${e.description?`<p>${e.description}</p>`:""}
      </header>
      <div class="menu-grid">
        ${e.items.map(w).join("")}
      </div>
    </section>
  `}function l(e){const n=document.getElementById("menu-sections");n&&(document.getElementById("menu-page-title").textContent=e.title,document.getElementById("menu-page-subtitle").textContent=e.subtitle||"",n.innerHTML=e.sections.map(F).join(""),_(e),C())}function _(e){const n=document.getElementById("menu-category-nav");if(n&&(n.innerHTML=e.sections.map(t=>`<a href="#${t.id}" data-category="${t.id}">${t.name}</a>`).join(""),n.querySelectorAll("a").forEach(t=>{t.addEventListener("click",i=>{i.preventDefault();const s=document.getElementById(t.dataset.category);s==null||s.scrollIntoView({behavior:"smooth",block:"start"}),n.querySelectorAll("a").forEach(a=>a.classList.remove("is-active")),t.classList.add("is-active")})}),"IntersectionObserver"in window)){const t=new IntersectionObserver(i=>{i.forEach(s=>{if(!s.isIntersecting)return;const a=s.target.id;n.querySelectorAll("a").forEach(c=>{c.classList.toggle("is-active",c.dataset.category===a)})})},{rootMargin:"-40% 0px -50% 0px",threshold:0});e.sections.forEach(i=>{const s=document.getElementById(i.id);s&&t.observe(s)})}}function D(){const e=document.getElementById("pdf-links");e&&(e.innerHTML=(o.links||o.downloads||[]).map(n=>`<li><a href="${n.legacyUrl||m(String(n.file).replace(/^\//,""))}" target="_blank" rel="noopener noreferrer">${n.label}</a></li>`).join(""))}function k(){const e=document.querySelectorAll(".menu-tab");e.forEach(n=>{n.addEventListener("click",()=>{const t=n.dataset.menu;r[t]&&(d=t,e.forEach(i=>{i.classList.toggle("is-active",i===n),i.setAttribute("aria-selected",String(i===n))}),l(r[t]))})})}function C(){if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.querySelectorAll(".fade-in").forEach(t=>t.classList.add("is-visible"));return}const n=new IntersectionObserver(t=>{t.forEach(i=>{i.isIntersecting&&(i.target.classList.add("is-visible"),n.unobserve(i.target))})},{threshold:.08});document.querySelectorAll(".menu-section.fade-in").forEach(t=>{t.classList.remove("is-visible"),n.observe(t)})}u();D();k();l(r[d]);

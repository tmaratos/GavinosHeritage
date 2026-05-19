(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const l of n.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&s(l)}).observe(document,{childList:!0,subtree:!0});function r(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(a){if(a.ep)return;a.ep=!0;const n=r(a);fetch(a.href,n)}})();const m="Gavino's Pizzeria and Restaurant",f="(865) 200-5571",g="+18652005571",h={full:"5211 Kingston Pike, Knoxville, TN 37919"},b="https://maps.google.com/maps?q=5211+Kingston+Pike+Knoxville%2C+TN+37919",v="https://order.spoton.com/6369692730409da37ab0ee8a",y={facebook:"https://www.facebook.com/GavinosPizzeria/",instagram:"https://www.instagram.com/gavinospizzeria_knoxville/",twitter:"https://twitter.com/gavinospizzeria"},o={name:m,phone:f,phoneTel:g,address:h,mapsUrl:b,orderOnlineUrl:v,social:y},c="/Gavinos/";function d(e){const t=String(e).replace(/^\//,"");return`${c}${t}`}function i(e=""){if(!e||e==="/")return c;const t=String(e).replace(/^\//,"");return`${c}${t}`}const u=[{href:i(),label:"Home",page:"home"},{href:i("about.html"),label:"About",page:"about"},{href:i("menu.html"),label:"Menus",page:"menu"},{href:i("employment.html"),label:"Apply",page:"employment"},{href:i("location.html"),label:"Location",page:"location"},{href:i("contact.html"),label:"Contact",page:"contact"}];function $(){return document.body.dataset.page||"home"}function k(){return`
    <a href="${i()}" class="logo-link" aria-label="${o.name} — Home">
      <img
        src="${d("assets/images/logo/logo.png")}"
        alt="Gavino's Restaurant Pizzeria"
        width="200"
        height="80"
        onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='${d("assets/images/logo/logo.svg")}'}else{this.hidden=true;this.nextElementSibling.hidden=false}"
      />
      <span class="logo-fallback" hidden>
        <span class="logo-g">GAV</span><span class="logo-r">I</span><span class="logo-g">NO</span><span class="logo-r">'</span><span class="logo-g">S</span>
        <small>RESTAURANT · PIZZERIA</small>
      </span>
    </a>
  `}function p(e){return u.map(({href:t,label:r,page:s})=>`
      <li>
        <a href="${t}"${s===e?' aria-current="page"':""}>${r}</a>
      </li>
    `).join("")}function w(e){return`
    <header class="site-header">
      <div class="container site-header__inner">
        ${k()}
        <nav class="site-nav" aria-label="Main navigation">
          <ul>${p(e)}</ul>
        </nav>
        <div class="header-actions">
          <a class="btn btn--primary btn--primary-desktop" href="${o.orderOnlineUrl}" target="_blank" rel="noopener noreferrer">Order Online</a>
          <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <nav id="mobile-nav" class="mobile-nav container" aria-label="Mobile navigation" hidden>
        <ul>${p(e)}</ul>
      </nav>
    </header>
  `}function O(){const e=new Date().getFullYear();return`
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <h4>${o.name}</h4>
            <p>
              <a href="${o.mapsUrl}" target="_blank" rel="noopener noreferrer">${o.address.full}</a>
            </p>
            <p>
              <a href="tel:${o.phoneTel}">${o.phone}</a>
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul class="footer-nav">
              ${u.map(({href:t,label:r})=>`<li><a href="${t}">${r}</a></li>`).join("")}
            </ul>
          </div>
          <div>
            <h4>Connect</h4>
            <div class="social-links">
              <a href="${o.social.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="${o.social.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="${o.social.twitter}" target="_blank" rel="noopener noreferrer">Twitter</a>
            </div>
          </div>
        </div>
        <p class="copyright">© ${e} ${o.name}. All rights reserved.</p>
      </div>
    </footer>
  `}function L(){return`
    <div class="sticky-order-cta" id="sticky-order-cta">
      <a class="btn btn--primary" href="${o.orderOnlineUrl}" target="_blank" rel="noopener noreferrer">Order Online</a>
    </div>
  `}function E(){const e=$(),t=document.getElementById("site-header");t&&(t.outerHTML=w(e),A());const r=document.getElementById("site-footer");r&&(r.outerHTML=O());let s=document.getElementById("sticky-order-cta");s||(s=document.createElement("div"),s.id="sticky-order-cta",document.body.appendChild(s)),s.outerHTML=L();const a=window.matchMedia("(max-width: 767px)"),n=()=>{document.body.classList.toggle("has-sticky-cta",a.matches)};n(),a.addEventListener("change",n)}function A(){const e=document.querySelector(".nav-toggle"),t=document.getElementById("mobile-nav");!e||!t||e.addEventListener("click",()=>{const r=e.getAttribute("aria-expanded")==="true";e.setAttribute("aria-expanded",String(!r)),e.setAttribute("aria-label",r?"Open menu":"Close menu"),t.hidden=r,t.classList.toggle("is-open",!r)})}export{d as a,o as b,E as r};

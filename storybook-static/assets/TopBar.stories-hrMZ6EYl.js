import{j as e}from"./jsx-runtime-B-vjrZM9.js";import{u as M,g as L,a as C,L as S,I as B,n as D}from"./nl-wD7mEgNa.js";import{r as T}from"./iframe-NSoKY1mh.js";import{l as H,u as R,g as m,U as b}from"./storage-CudcsGZD.js";import{B as U}from"./Button-CIR6_DzN.js";import{c as d}from"./createLucideIcon-BoUbEuam.js";import{C as g}from"./chevron-down-CPG6tCev.js";import"./preload-helper-C1FmrZbK.js";import"./cn-BNf5BS2b.js";/**
 * @license lucide-react v0.427.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=d("Building2",[["path",{d:"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",key:"1b4qmf"}],["path",{d:"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",key:"i71pzd"}],["path",{d:"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",key:"10jefs"}],["path",{d:"M10 6h4",key:"1itunk"}],["path",{d:"M10 10h4",key:"tcdvrf"}],["path",{d:"M10 14h4",key:"kelpxr"}],["path",{d:"M10 18h4",key:"1ulq68"}]]);/**
 * @license lucide-react v0.427.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=d("Languages",[["path",{d:"m5 8 6 6",key:"1wu5hv"}],["path",{d:"m4 14 6-6 2-3",key:"1k1g8d"}],["path",{d:"M2 5h12",key:"or177f"}],["path",{d:"M7 2h1",key:"1t2jsx"}],["path",{d:"m22 22-5-10-5 10",key:"don7ne"}],["path",{d:"M14 18h6",key:"1m8k6r"}]]);/**
 * @license lucide-react v0.427.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=d("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);function w(){const{locale:s,toggleLocale:i}=M(),r=()=>{const t=s==="nl"?"en":"nl";i(),H("language_changed",{fromLocale:s,toLocale:t,timestamp:new Date().toISOString()})};return e.jsxs(U,{variant:"ghost",size:"sm",onClick:r,className:"gap-2",title:`Switch to ${s==="nl"?"English":"Nederlands"}`,children:[e.jsx(G,{className:"w-4 h-4"}),e.jsxs("span",{className:"text-sm",children:[L(s)," ",C(s)]})]})}w.__docgenInfo={description:"",methods:[],displayName:"LanguageToggle"};function o(){const{user:s,changeRole:i}=R(),[r,t]=T.useState(!1),k=["gp","poh-s","practice-manager"],P=a=>{i(a),t(!1)};return e.jsxs("header",{className:"h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6",children:[e.jsx("div",{className:"flex items-center gap-4",children:e.jsxs("div",{className:"flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg",children:[e.jsx(_,{className:"w-4 h-4 text-gray-600"}),e.jsx("span",{className:"text-sm font-medium text-gray-900",children:s.practice}),e.jsx(g,{className:"w-4 h-4 text-gray-500"})]})}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(w,{}),e.jsxs("div",{className:"relative",children:[e.jsxs("button",{onClick:()=>t(!r),className:"flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors",children:[e.jsx(I,{className:"w-4 h-4 text-gray-600"}),e.jsx("span",{className:"text-sm font-medium text-gray-900",children:s.name}),e.jsx(g,{className:"w-4 h-4 text-gray-500"})]}),r&&e.jsxs("div",{className:"absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50",children:[e.jsx("div",{className:"p-3 border-b border-gray-100",children:e.jsx("div",{className:"text-xs font-medium text-gray-500 uppercase tracking-wider mb-1",children:"Selecteer Rol"})}),k.map(a=>e.jsx("button",{onClick:()=>P(a),className:`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${s.role===a?"bg-primary-50 text-primary-700 font-medium":"text-gray-700"}`,children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"font-medium",children:[a==="gp"&&"Dr. van der Berg",a==="poh-s"&&"Martine van der Berg",a==="practice-manager"&&"Sarah de Jong"]}),e.jsx("div",{className:"text-xs text-gray-500",children:m(a)})]}),s.role===a&&e.jsx("div",{className:"w-2 h-2 bg-primary-600 rounded-full"})]})},a)),e.jsx("div",{className:"p-2 border-t border-gray-100",children:e.jsxs("div",{className:"text-xs text-gray-500",children:["Huidige rol: ",e.jsx("span",{className:"font-medium",children:m(s.role)})]})})]})]})]})]})}o.__docgenInfo={description:"",methods:[],displayName:"TopBar"};const O={nl:D},Z={title:"Molecules/TopBar",component:o,parameters:{layout:"fullscreen"},tags:["autodocs"],decorators:[s=>e.jsx(S,{children:e.jsx(B,{messages:O.nl,locale:"nl",defaultLocale:"nl",children:e.jsx(b,{children:e.jsx(s,{})})})})]},n={},l={render:()=>e.jsxs("div",{className:"min-h-screen bg-gray-50",children:[e.jsx(o,{}),e.jsxs("div",{className:"p-8",children:[e.jsx("h1",{className:"text-2xl font-bold text-gray-900 mb-4",children:"Dashboard Content"}),e.jsx("p",{className:"text-gray-600",children:"The TopBar displays the practice name, user name, role selector, and language toggle. Click on the user menu to switch between different roles (GP, POH-S, Practice Manager)."})]})]})},c={render:()=>e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"p-4 bg-gray-100 rounded",children:[e.jsx("p",{className:"text-sm text-gray-600 mb-2",children:"As GP (Huisarts):"}),e.jsx(b,{children:e.jsx(o,{})})]}),e.jsxs("div",{className:"p-4 bg-gray-100 rounded",children:[e.jsx("p",{className:"text-sm text-gray-600 mb-2",children:"Click the user menu to switch roles"}),e.jsx("p",{className:"text-xs text-gray-500",children:"Available roles: GP, POH-S, Practice Manager"})]})]})};var p,h,x;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:"{}",...(x=(h=n.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};var u,y,j;l.parameters={...l.parameters,docs:{...(u=l.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Content</h1>
        <p className="text-gray-600">
          The TopBar displays the practice name, user name, role selector, and language toggle.
          Click on the user menu to switch between different roles (GP, POH-S, Practice Manager).
        </p>
      </div>
    </div>
}`,...(j=(y=l.parameters)==null?void 0:y.docs)==null?void 0:j.source}}};var N,f,v;c.parameters={...c.parameters,docs:{...(N=c.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => <div className="space-y-4">
      <div className="p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600 mb-2">As GP (Huisarts):</p>
        <UserProvider>
          <TopBar />
        </UserProvider>
      </div>
      
      <div className="p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600 mb-2">Click the user menu to switch roles</p>
        <p className="text-xs text-gray-500">Available roles: GP, POH-S, Practice Manager</p>
      </div>
    </div>
}`,...(v=(f=c.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};const K=["Default","WithContent","DifferentRoles"];export{n as Default,c as DifferentRoles,l as WithContent,K as __namedExportsOrder,Z as default};

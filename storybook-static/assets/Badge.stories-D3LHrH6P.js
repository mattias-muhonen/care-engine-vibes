import{j as a}from"./jsx-runtime-B-vjrZM9.js";import{B as e}from"./Badge-B_suzCdo.js";import{C as T}from"./circle-check-big-D9i8mzBq.js";import{I as X}from"./info-C2gruAa0.js";import{T as _}from"./triangle-alert-DrSJen0x.js";import{c as b}from"./createLucideIcon-BoUbEuam.js";import"./iframe-NSoKY1mh.js";import"./preload-helper-C1FmrZbK.js";import"./cn-BNf5BS2b.js";/**
 * @license lucide-react v0.427.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=b("CircleX",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]),Q={title:"Atoms/Badge",component:e,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["default","success","warning","critical"]},size:{control:{type:"select"},options:["sm","md"]}}},r={args:{children:"Default",variant:"default"}},s={args:{children:"Success",variant:"success"}},c={args:{children:"Warning",variant:"warning"}},i={args:{children:"Critical",variant:"critical"}},n={args:{children:"Small Badge",size:"sm"}},t={args:{children:a.jsxs(a.Fragment,{children:[a.jsx(T,{className:"w-3 h-3 mr-1"}),"Approved"]}),variant:"success"}},o={args:{children:"Badge"},render:()=>a.jsxs("div",{className:"flex space-x-2",children:[a.jsxs(e,{variant:"default",children:[a.jsx(X,{className:"w-3 h-3 mr-1"}),"Draft"]}),a.jsxs(e,{variant:"warning",children:[a.jsx(_,{className:"w-3 h-3 mr-1"}),"Pending"]}),a.jsxs(e,{variant:"success",children:[a.jsx(T,{className:"w-3 h-3 mr-1"}),"Active"]}),a.jsxs(e,{variant:"critical",children:[a.jsx(q,{className:"w-3 h-3 mr-1"}),"Expired"]})]})},d={args:{children:"Count"},render:()=>a.jsxs("div",{className:"flex space-x-2",children:[a.jsx(e,{size:"sm",children:"45 patients"}),a.jsx(e,{size:"sm",variant:"warning",children:"12 at risk"}),a.jsx(e,{size:"sm",variant:"critical",children:"3 overdue"})]})};var l,m,g;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    children: 'Default',
    variant: 'default'
  }
}`,...(g=(m=r.parameters)==null?void 0:m.docs)==null?void 0:g.source}}};var p,u,h;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    children: 'Success',
    variant: 'success'
  }
}`,...(h=(u=s.parameters)==null?void 0:u.docs)==null?void 0:h.source}}};var v,x,f;c.parameters={...c.parameters,docs:{...(v=c.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    children: 'Warning',
    variant: 'warning'
  }
}`,...(f=(x=c.parameters)==null?void 0:x.docs)==null?void 0:f.source}}};var B,C,S;i.parameters={...i.parameters,docs:{...(B=i.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    children: 'Critical',
    variant: 'critical'
  }
}`,...(S=(C=i.parameters)==null?void 0:C.docs)==null?void 0:S.source}}};var j,w,N;n.parameters={...n.parameters,docs:{...(j=n.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    children: 'Small Badge',
    size: 'sm'
  }
}`,...(N=(w=n.parameters)==null?void 0:w.docs)==null?void 0:N.source}}};var z,y,k;t.parameters={...t.parameters,docs:{...(z=t.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    children: <>
        <CheckCircle className="w-3 h-3 mr-1" />
        Approved
      </>,
    variant: 'success'
  }
}`,...(k=(y=t.parameters)==null?void 0:y.docs)==null?void 0:k.source}}};var A,D,I;o.parameters={...o.parameters,docs:{...(A=o.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    children: 'Badge'
  },
  render: () => <div className="flex space-x-2">
      <Badge variant="default">
        <Info className="w-3 h-3 mr-1" />
        Draft
      </Badge>
      <Badge variant="warning">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Pending
      </Badge>
      <Badge variant="success">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
      <Badge variant="critical">
        <XCircle className="w-3 h-3 mr-1" />
        Expired
      </Badge>
    </div>
}`,...(I=(D=o.parameters)==null?void 0:D.docs)==null?void 0:I.source}}};var W,E,P;d.parameters={...d.parameters,docs:{...(W=d.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    children: 'Count'
  },
  render: () => <div className="flex space-x-2">
      <Badge size="sm">45 patients</Badge>
      <Badge size="sm" variant="warning">12 at risk</Badge>
      <Badge size="sm" variant="critical">3 overdue</Badge>
    </div>
}`,...(P=(E=d.parameters)==null?void 0:E.docs)==null?void 0:P.source}}};const U=["Default","Success","Warning","Critical","Small","WithIcon","StatusBadges","PatientCounts"];export{i as Critical,r as Default,d as PatientCounts,n as Small,o as StatusBadges,s as Success,c as Warning,t as WithIcon,U as __namedExportsOrder,Q as default};

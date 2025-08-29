import{j as e}from"./jsx-runtime-B-vjrZM9.js";import{I as a}from"./Input-B4oY4rfT.js";import"./iframe-NSoKY1mh.js";import"./preload-helper-C1FmrZbK.js";import"./cn-BNf5BS2b.js";const z={title:"Atoms/Input",component:a,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{type:{control:{type:"select"},options:["text","email","password","number","tel","url"]},disabled:{control:"boolean"},required:{control:"boolean"}}},r={args:{placeholder:"Enter text..."}},t={args:{label:"Patient Name",placeholder:"Enter patient name"}},s={args:{label:"Email Address",value:"patient@example.com",type:"email"}},l={args:{label:"HbA1c Target",placeholder:"Enter target value",error:"Value must be between 42 and 75 mmol/mol",value:"85",type:"number"}},n={args:{label:"Patient ID",value:"PAT-001234",disabled:!0}},o={args:{label:"Required Field",placeholder:"This field is required",required:!0}},c={args:{label:"Delay (days)",type:"number",min:0,max:365,value:30}},m={args:{type:"text",placeholder:"Search patients...",className:"w-64"}},p={render:()=>e.jsxs("div",{className:"space-y-4 w-80",children:[e.jsx(a,{label:"Patient Name",placeholder:"Enter full name",required:!0}),e.jsx(a,{label:"NHS Number",placeholder:"000 000 0000"}),e.jsx(a,{label:"Date of Birth",type:"date"}),e.jsx(a,{label:"HbA1c Target",type:"number",min:"42",max:"75",placeholder:"mmol/mol"}),e.jsx(a,{label:"Clinical Notes",placeholder:"Add any relevant notes..."})]})};var d,u,i;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    placeholder: 'Enter text...'
  }
}`,...(i=(u=r.parameters)==null?void 0:u.docs)==null?void 0:i.source}}};var b,g,h;t.parameters={...t.parameters,docs:{...(b=t.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    label: 'Patient Name',
    placeholder: 'Enter patient name'
  }
}`,...(h=(g=t.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var y,x,E;s.parameters={...s.parameters,docs:{...(y=s.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    label: 'Email Address',
    value: 'patient@example.com',
    type: 'email'
  }
}`,...(E=(x=s.parameters)==null?void 0:x.docs)==null?void 0:E.source}}};var N,v,S;l.parameters={...l.parameters,docs:{...(N=l.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    label: 'HbA1c Target',
    placeholder: 'Enter target value',
    error: 'Value must be between 42 and 75 mmol/mol',
    value: '85',
    type: 'number'
  }
}`,...(S=(v=l.parameters)==null?void 0:v.docs)==null?void 0:S.source}}};var I,f,q;n.parameters={...n.parameters,docs:{...(I=n.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    label: 'Patient ID',
    value: 'PAT-001234',
    disabled: true
  }
}`,...(q=(f=n.parameters)==null?void 0:f.docs)==null?void 0:q.source}}};var A,D,T;o.parameters={...o.parameters,docs:{...(A=o.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    label: 'Required Field',
    placeholder: 'This field is required',
    required: true
  }
}`,...(T=(D=o.parameters)==null?void 0:D.docs)==null?void 0:T.source}}};var j,P,w;c.parameters={...c.parameters,docs:{...(j=c.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    label: 'Delay (days)',
    type: 'number',
    min: 0,
    max: 365,
    value: 30
  }
}`,...(w=(P=c.parameters)==null?void 0:P.docs)==null?void 0:w.source}}};var H,W,R;m.parameters={...m.parameters,docs:{...(H=m.parameters)==null?void 0:H.docs,source:{originalSource:`{
  args: {
    type: 'text',
    placeholder: 'Search patients...',
    className: 'w-64'
  }
}`,...(R=(W=m.parameters)==null?void 0:W.docs)==null?void 0:R.source}}};var F,V,B;p.parameters={...p.parameters,docs:{...(F=p.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: () => <div className="space-y-4 w-80">
      <Input label="Patient Name" placeholder="Enter full name" required />
      <Input label="NHS Number" placeholder="000 000 0000" />
      <Input label="Date of Birth" type="date" />
      <Input label="HbA1c Target" type="number" min="42" max="75" placeholder="mmol/mol" />
      <Input label="Clinical Notes" placeholder="Add any relevant notes..." />
    </div>
}`,...(B=(V=p.parameters)==null?void 0:V.docs)==null?void 0:B.source}}};const G=["Default","WithLabel","WithValue","WithError","Disabled","Required","NumberInput","SearchInput","FormExample"];export{r as Default,n as Disabled,p as FormExample,c as NumberInput,o as Required,m as SearchInput,l as WithError,t as WithLabel,s as WithValue,G as __namedExportsOrder,z as default};

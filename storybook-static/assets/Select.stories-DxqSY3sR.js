import{j as e}from"./jsx-runtime-B-vjrZM9.js";import{r as M}from"./iframe-NSoKY1mh.js";import{c as U}from"./cn-BNf5BS2b.js";import{C as I}from"./chevron-down-CPG6tCev.js";import"./preload-helper-C1FmrZbK.js";import"./createLucideIcon-BoUbEuam.js";const a=M.forwardRef(({className:k,label:p,options:E,placeholder:u,error:c,...H},L)=>e.jsxs("div",{className:"space-y-1",children:[p&&e.jsx("label",{className:"block text-sm font-medium text-gray-700",children:p}),e.jsxs("div",{className:"relative",children:[e.jsxs("select",{className:U("flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none",c&&"border-red-500 focus:ring-red-500",k),ref:L,...H,children:[u&&e.jsx("option",{value:"",children:u}),E.map(d=>e.jsx("option",{value:d.value,children:d.label},d.value))]}),e.jsx(I,{className:"absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none"})]}),c&&e.jsx("p",{className:"text-sm text-red-600",children:c})]}));a.displayName="Select";a.__docgenInfo={description:"",methods:[],displayName:"Select",props:{label:{required:!1,tsType:{name:"string"},description:""},options:{required:!0,tsType:{name:"Array",elements:[{name:"SelectOption"}],raw:"SelectOption[]"},description:""},placeholder:{required:!1,tsType:{name:"string"},description:""},error:{required:!1,tsType:{name:"string"},description:""}},composes:["Omit"]};const Q={title:"Atoms/Select",component:a,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{disabled:{control:"boolean"},required:{control:"boolean"}}},q=[{value:"diabetes_t2",label:"Diabetes Type 2"},{value:"hypertension",label:"Hypertension"},{value:"copd",label:"COPD"},{value:"asthma",label:"Asthma"}],F=[{value:"low",label:"Low Priority"},{value:"medium",label:"Medium Priority"},{value:"high",label:"High Priority"},{value:"urgent",label:"Urgent"}],l={args:{options:q,placeholder:"Select a condition"}},r={args:{label:"Medical Condition",options:q,placeholder:"Choose condition"}},o={args:{label:"Priority Level",options:F,value:"high"}},t={args:{label:"Workflow State",options:[{value:"draft",label:"Draft"},{value:"review",label:"Under Review"},{value:"published",label:"Published"}],error:"Please select a valid workflow state",placeholder:"Select state"}},s={args:{label:"Status",options:[{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}],value:"active",disabled:!0}},n={args:{label:"Notification Channel",options:[{value:"email",label:"Email"},{value:"sms",label:"SMS"},{value:"portal",label:"Patient Portal"},{value:"phone",label:"Phone Call"}],placeholder:"Select channel",required:!0}},i={args:{options:[]},render:()=>e.jsxs("div",{className:"space-y-4 w-80",children:[e.jsx(a,{label:"Patient Cohort",options:[{value:"diabetes_high_risk",label:"Diabetes - High Risk"},{value:"diabetes_controlled",label:"Diabetes - Well Controlled"},{value:"hypertension_uncontrolled",label:"Hypertension - Uncontrolled"},{value:"respiratory_acute",label:"Respiratory - Acute"}],placeholder:"Select cohort",required:!0}),e.jsx(a,{label:"Action Type",options:[{value:"schedule_appointment",label:"Schedule Appointment"},{value:"send_reminder",label:"Send Reminder"},{value:"order_lab",label:"Order Lab Tests"},{value:"update_medication",label:"Update Medication"}],placeholder:"Choose action"}),e.jsx(a,{label:"Assigned To",options:[{value:"gp_smith",label:"Dr. Smith (GP)"},{value:"nurse_jones",label:"Nurse Jones"},{value:"poh_williams",label:"POH-S Williams"}],placeholder:"Select practitioner"})]})};var m,b,h;l.parameters={...l.parameters,docs:{...(m=l.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    options: conditionOptions,
    placeholder: 'Select a condition'
  }
}`,...(h=(b=l.parameters)==null?void 0:b.docs)==null?void 0:h.source}}};var v,g,S;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    label: 'Medical Condition',
    options: conditionOptions,
    placeholder: 'Choose condition'
  }
}`,...(S=(g=r.parameters)==null?void 0:g.docs)==null?void 0:S.source}}};var y,f,_;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    label: 'Priority Level',
    options: priorityOptions,
    value: 'high'
  }
}`,...(_=(f=o.parameters)==null?void 0:f.docs)==null?void 0:_.source}}};var x,w,P;t.parameters={...t.parameters,docs:{...(x=t.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    label: 'Workflow State',
    options: [{
      value: 'draft',
      label: 'Draft'
    }, {
      value: 'review',
      label: 'Under Review'
    }, {
      value: 'published',
      label: 'Published'
    }],
    error: 'Please select a valid workflow state',
    placeholder: 'Select state'
  }
}`,...(P=(w=t.parameters)==null?void 0:w.docs)==null?void 0:P.source}}};var C,j,D;s.parameters={...s.parameters,docs:{...(C=s.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    label: 'Status',
    options: [{
      value: 'active',
      label: 'Active'
    }, {
      value: 'inactive',
      label: 'Inactive'
    }],
    value: 'active',
    disabled: true
  }
}`,...(D=(j=s.parameters)==null?void 0:j.docs)==null?void 0:D.source}}};var N,O,A;n.parameters={...n.parameters,docs:{...(N=n.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    label: 'Notification Channel',
    options: [{
      value: 'email',
      label: 'Email'
    }, {
      value: 'sms',
      label: 'SMS'
    }, {
      value: 'portal',
      label: 'Patient Portal'
    }, {
      value: 'phone',
      label: 'Phone Call'
    }],
    placeholder: 'Select channel',
    required: true
  }
}`,...(A=(O=n.parameters)==null?void 0:O.docs)==null?void 0:A.source}}};var R,T,W;i.parameters={...i.parameters,docs:{...(R=i.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    options: []
  },
  render: () => <div className="space-y-4 w-80">
      <Select label="Patient Cohort" options={[{
      value: 'diabetes_high_risk',
      label: 'Diabetes - High Risk'
    }, {
      value: 'diabetes_controlled',
      label: 'Diabetes - Well Controlled'
    }, {
      value: 'hypertension_uncontrolled',
      label: 'Hypertension - Uncontrolled'
    }, {
      value: 'respiratory_acute',
      label: 'Respiratory - Acute'
    }]} placeholder="Select cohort" required />
      <Select label="Action Type" options={[{
      value: 'schedule_appointment',
      label: 'Schedule Appointment'
    }, {
      value: 'send_reminder',
      label: 'Send Reminder'
    }, {
      value: 'order_lab',
      label: 'Order Lab Tests'
    }, {
      value: 'update_medication',
      label: 'Update Medication'
    }]} placeholder="Choose action" />
      <Select label="Assigned To" options={[{
      value: 'gp_smith',
      label: 'Dr. Smith (GP)'
    }, {
      value: 'nurse_jones',
      label: 'Nurse Jones'
    }, {
      value: 'poh_williams',
      label: 'POH-S Williams'
    }]} placeholder="Select practitioner" />
    </div>
}`,...(W=(T=i.parameters)==null?void 0:T.docs)==null?void 0:W.source}}};const X=["Default","WithLabel","WithValue","WithError","Disabled","Required","FormExample"];export{l as Default,s as Disabled,i as FormExample,n as Required,t as WithError,r as WithLabel,o as WithValue,X as __namedExportsOrder,Q as default};

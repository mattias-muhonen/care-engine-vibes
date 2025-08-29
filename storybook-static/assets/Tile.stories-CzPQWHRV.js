import{j as e}from"./jsx-runtime-B-vjrZM9.js";import{U as I}from"./users-lZfVf0nk.js";import{A as L}from"./activity-KPUiyzkZ.js";import{C as V,T as J}from"./trending-up-BbNKy0n9.js";import{T as m}from"./triangle-alert-DrSJen0x.js";import{C as K}from"./circle-check-big-D9i8mzBq.js";import"./iframe-NSoKY1mh.js";import"./preload-helper-C1FmrZbK.js";import"./createLucideIcon-BoUbEuam.js";function a({title:z,value:F,icon:v,trend:r,variant:u="default",children:p,onClick:g}){const G={default:"bg-white border-gray-200",warning:"bg-yellow-50 border-yellow-200",critical:"bg-red-50 border-red-200",success:"bg-green-50 border-green-200"},f={default:"text-primary-600",warning:"text-yellow-600",critical:"text-red-600",success:"text-green-600"};return e.jsxs("div",{className:`rounded-lg shadow-sm border p-6 transition-colors ${G[u]} ${g?"cursor-pointer hover:shadow-md":""}`,onClick:g,children:[e.jsx("div",{className:"flex items-center justify-between",children:e.jsxs("div",{className:"flex-1",children:[e.jsx("h3",{className:"text-sm font-medium text-gray-700 mb-1",children:z}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("p",{className:`text-2xl font-bold ${f[u]}`,children:F}),v&&e.jsx(v,{className:`w-6 h-6 ${f[u]}`})]}),r&&e.jsxs("div",{className:"flex items-center mt-2",children:[e.jsxs("span",{className:`text-xs font-medium ${r.positive?"text-green-600":"text-red-600"}`,children:[r.positive?"+":"",r.value,"%"]}),e.jsx("span",{className:"text-xs text-gray-500 ml-1",children:r.label})]})]})}),p&&e.jsx("div",{className:"mt-4",children:p})]})}a.__docgenInfo={description:"",methods:[],displayName:"Tile",props:{title:{required:!0,tsType:{name:"string"},description:""},value:{required:!0,tsType:{name:"union",raw:"string | number",elements:[{name:"string"},{name:"number"}]},description:""},icon:{required:!1,tsType:{name:"LucideIcon"},description:""},trend:{required:!1,tsType:{name:"signature",type:"object",raw:`{
  value: number
  label: string
  positive: boolean
}`,signature:{properties:[{key:"value",value:{name:"number",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"positive",value:{name:"boolean",required:!0}}]}},description:""},variant:{required:!1,tsType:{name:"union",raw:"'default' | 'warning' | 'critical' | 'success'",elements:[{name:"literal",value:"'default'"},{name:"literal",value:"'warning'"},{name:"literal",value:"'critical'"},{name:"literal",value:"'success'"}]},description:"",defaultValue:{value:"'default'",computed:!1}},children:{required:!1,tsType:{name:"ReactNode"},description:""},onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};const te={title:"Atoms/Tile",component:a,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:{type:"select"},options:["default","warning","critical","success"]},onClick:{action:"clicked"}}},s={args:{title:"Total Patients",value:"1,234",icon:I}},t={args:{title:"Active Cohorts",value:"45",icon:L,trend:{value:12,label:"from last month",positive:!0}}},i={args:{title:"Pending Reviews",value:"18",icon:V,variant:"warning",trend:{value:-5,label:"from last week",positive:!1}}},n={args:{title:"High Risk Patients",value:"7",icon:m,variant:"critical"}},l={args:{title:"Completed Actions",value:"156",icon:K,variant:"success",trend:{value:23,label:"this week",positive:!0}}},o={args:{title:"Overdue Reviews",value:"23",icon:m,variant:"warning",onClick:()=>console.log("Tile clicked")}},c={args:{title:"HbA1c Performance",value:"68%",icon:J,variant:"success",children:e.jsxs("div",{className:"text-xs text-gray-600",children:[e.jsxs("div",{className:"flex justify-between mb-1",children:[e.jsx("span",{children:"On target"}),e.jsx("span",{className:"font-medium",children:"68%"})]}),e.jsx("div",{className:"w-full bg-gray-200 rounded-full h-2",children:e.jsx("div",{className:"bg-green-600 h-2 rounded-full",style:{width:"68%"}})})]})}},d={args:{title:"Dashboard Tile",value:"0"},render:()=>e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50",children:[e.jsx(a,{title:"Total Patients",value:"1,234",icon:I,trend:{value:5,label:"from last month",positive:!0}}),e.jsx(a,{title:"Active Cohorts",value:"45",icon:L,variant:"default"}),e.jsx(a,{title:"High Risk",value:"18",icon:m,variant:"warning",trend:{value:-12,label:"from last week",positive:!1}}),e.jsx(a,{title:"Overdue Reviews",value:"7",icon:V,variant:"critical"})]})};var h,x,b;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    title: 'Total Patients',
    value: '1,234',
    icon: Users
  }
}`,...(b=(x=s.parameters)==null?void 0:x.docs)==null?void 0:b.source}}};var w,y,T;t.parameters={...t.parameters,docs:{...(w=t.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    title: 'Active Cohorts',
    value: '45',
    icon: Activity,
    trend: {
      value: 12,
      label: 'from last month',
      positive: true
    }
  }
}`,...(T=(y=t.parameters)==null?void 0:y.docs)==null?void 0:T.source}}};var j,C,N;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    title: 'Pending Reviews',
    value: '18',
    icon: Calendar,
    variant: 'warning',
    trend: {
      value: -5,
      label: 'from last week',
      positive: false
    }
  }
}`,...(N=(C=i.parameters)==null?void 0:C.docs)==null?void 0:N.source}}};var k,A,R;n.parameters={...n.parameters,docs:{...(k=n.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    title: 'High Risk Patients',
    value: '7',
    icon: AlertTriangle,
    variant: 'critical'
  }
}`,...(R=(A=n.parameters)==null?void 0:A.docs)==null?void 0:R.source}}};var q,P,S;l.parameters={...l.parameters,docs:{...(q=l.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    title: 'Completed Actions',
    value: '156',
    icon: CheckCircle,
    variant: 'success',
    trend: {
      value: 23,
      label: 'this week',
      positive: true
    }
  }
}`,...(S=(P=l.parameters)==null?void 0:P.docs)==null?void 0:S.source}}};var O,D,H;o.parameters={...o.parameters,docs:{...(O=o.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    title: 'Overdue Reviews',
    value: '23',
    icon: AlertTriangle,
    variant: 'warning',
    onClick: () => console.log('Tile clicked')
  }
}`,...(H=(D=o.parameters)==null?void 0:D.docs)==null?void 0:H.source}}};var U,W,$;c.parameters={...c.parameters,docs:{...(U=c.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    title: 'HbA1c Performance',
    value: '68%',
    icon: TrendingUp,
    variant: 'success',
    children: <div className="text-xs text-gray-600">
        <div className="flex justify-between mb-1">
          <span>On target</span>
          <span className="font-medium">68%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-600 h-2 rounded-full" style={{
          width: '68%'
        }} />
        </div>
      </div>
  }
}`,...($=(W=c.parameters)==null?void 0:W.docs)==null?void 0:$.source}}};var E,_,B;d.parameters={...d.parameters,docs:{...(E=d.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    title: 'Dashboard Tile',
    value: '0'
  },
  render: () => <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50">
      <Tile title="Total Patients" value="1,234" icon={Users} trend={{
      value: 5,
      label: 'from last month',
      positive: true
    }} />
      <Tile title="Active Cohorts" value="45" icon={Activity} variant="default" />
      <Tile title="High Risk" value="18" icon={AlertTriangle} variant="warning" trend={{
      value: -12,
      label: 'from last week',
      positive: false
    }} />
      <Tile title="Overdue Reviews" value="7" icon={Calendar} variant="critical" />
    </div>
}`,...(B=(_=d.parameters)==null?void 0:_.docs)==null?void 0:B.source}}};const ie=["Default","WithTrend","Warning","Critical","Success","Clickable","WithChildren","DashboardExample"];export{o as Clickable,n as Critical,d as DashboardExample,s as Default,l as Success,i as Warning,c as WithChildren,t as WithTrend,ie as __namedExportsOrder,te as default};

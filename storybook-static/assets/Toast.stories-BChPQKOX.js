import{j as e}from"./jsx-runtime-B-vjrZM9.js";import{r as A}from"./iframe-NSoKY1mh.js";import{T as k}from"./Toast-D0GZ4Fb-.js";import{B as d}from"./Button-CIR6_DzN.js";import"./preload-helper-C1FmrZbK.js";import"./createLucideIcon-BoUbEuam.js";import"./info-C2gruAa0.js";import"./circle-check-big-D9i8mzBq.js";import"./cn-BNf5BS2b.js";const W={title:"Atoms/Toast",component:k,parameters:{layout:"fullscreen"},tags:["autodocs"],argTypes:{type:{control:{type:"select"},options:["success","error","info"]},duration:{control:{type:"number",min:1e3,max:1e4,step:1e3}}}},a={args:{message:"Pathway override saved successfully",type:"success",duration:5e3,onClose:()=>console.log("Toast closed")}},r={args:{message:"Failed to save changes. Please check validation errors.",type:"error",duration:5e3,onClose:()=>console.log("Toast closed")}},t={args:{message:"Review requested. Waiting for physician approval.",type:"info",duration:5e3,onClose:()=>console.log("Toast closed")}},n={args:{message:"Pathway contains 3 deviation(s) from NHG guidelines. High-risk deviations detected. Please review the changes carefully before publishing.",type:"error",duration:8e3,onClose:()=>console.log("Toast closed")}},c={args:{message:"",onClose:()=>{}},render:()=>{const P=()=>{const[B,m]=A.useState([]),i=(s,o)=>{const l=Date.now();m(E=>[...E,{id:l,message:o,type:s}])},D=s=>{m(o=>o.filter(l=>l.id!==s))};return e.jsxs("div",{className:"p-8",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsx("h3",{className:"text-lg font-semibold",children:"Toast Notifications Demo"}),e.jsxs("div",{className:"flex space-x-2",children:[e.jsx(d,{variant:"primary",onClick:()=>i("success","Action completed successfully!"),children:"Show Success"}),e.jsx(d,{variant:"secondary",onClick:()=>i("error","An error occurred. Please try again."),children:"Show Error"}),e.jsx(d,{variant:"outline",onClick:()=>i("info","New updates are available."),children:"Show Info"})]})]}),B.map((s,o)=>e.jsx("div",{style:{top:`${(o+1)*80}px`},className:"fixed right-4 z-50",children:e.jsx(k,{message:s.message,type:s.type,duration:5e3,onClose:()=>D(s.id)})},s.id))]})};return e.jsx(P,{})}};var p,u,g;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    message: 'Pathway override saved successfully',
    type: 'success',
    duration: 5000,
    onClose: () => console.log('Toast closed')
  }
}`,...(g=(u=a.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var v,y,f;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    message: 'Failed to save changes. Please check validation errors.',
    type: 'error',
    duration: 5000,
    onClose: () => console.log('Toast closed')
  }
}`,...(f=(y=r.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};var h,T,x;t.parameters={...t.parameters,docs:{...(h=t.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    message: 'Review requested. Waiting for physician approval.',
    type: 'info',
    duration: 5000,
    onClose: () => console.log('Toast closed')
  }
}`,...(x=(T=t.parameters)==null?void 0:T.docs)==null?void 0:x.source}}};var w,C,S;n.parameters={...n.parameters,docs:{...(w=n.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    message: 'Pathway contains 3 deviation(s) from NHG guidelines. High-risk deviations detected. Please review the changes carefully before publishing.',
    type: 'error',
    duration: 8000,
    onClose: () => console.log('Toast closed')
  }
}`,...(S=(C=n.parameters)==null?void 0:C.docs)==null?void 0:S.source}}};var N,j,b;c.parameters={...c.parameters,docs:{...(N=c.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    message: '',
    onClose: () => {}
  },
  render: () => {
    const ToastDemo = () => {
      const [toasts, setToasts] = useState<Array<{
        id: number;
        message: string;
        type: 'success' | 'error' | 'info';
      }>>([]);
      const addToast = (type: 'success' | 'error' | 'info', message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, {
          id,
          message,
          type
        }]);
      };
      const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
      };
      return <div className="p-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Toast Notifications Demo</h3>
            <div className="flex space-x-2">
              <Button variant="primary" onClick={() => addToast('success', 'Action completed successfully!')}>
                Show Success
              </Button>
              <Button variant="secondary" onClick={() => addToast('error', 'An error occurred. Please try again.')}>
                Show Error
              </Button>
              <Button variant="outline" onClick={() => addToast('info', 'New updates are available.')}>
                Show Info
              </Button>
            </div>
          </div>
          
          {toasts.map((toast, index) => <div key={toast.id} style={{
          top: \`\${(index + 1) * 80}px\`
        }} className="fixed right-4 z-50">
              <Toast message={toast.message} type={toast.type} duration={5000} onClose={() => removeToast(toast.id)} />
            </div>)}
        </div>;
    };
    return <ToastDemo />;
  }
}`,...(b=(j=c.parameters)==null?void 0:j.docs)==null?void 0:b.source}}};const _=["Success","Error","Info","LongMessage","Interactive"];export{r as Error,t as Info,c as Interactive,n as LongMessage,a as Success,_ as __namedExportsOrder,W as default};

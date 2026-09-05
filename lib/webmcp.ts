type GameState={level:number;score:number;aim:number;power:number;busy:boolean;ready:boolean;transition:boolean};
type Tool={name:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean;untrustedContentHint:boolean};execute:(input:unknown)=>unknown};
type Context={registerTool:(tool:Tool,options:{signal:AbortSignal})=>void|Promise<void>};
export function registerGameTools(read:()=>GameState,shoot:(aim:number,power:number)=>boolean,enterBeach:()=>void){
  const context=(document as Document & {modelContext?:Context}).modelContext;
  if(!context?.registerTool)return()=>{};
  const lifecycle=new AbortController();
  const definitions:Tool[]=[{
    name:'get_trashketball_state',description:'Read the active room, score and throw settings.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>read(),
  },{
    name:'throw_paper',description:'Aim and throw one paper ball. Returns the score after the shot resolves. Aim is the slider value from -48 (left) to 48 (right).',inputSchema:{type:'object',properties:{aim:{type:'number',minimum:-48,maximum:48},power:{type:'number',minimum:0,maximum:100}},required:['aim','power'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(input){
      const v=input as {aim?:unknown;power?:unknown};if(!v||typeof v.aim!=='number'||typeof v.power!=='number'||!Number.isFinite(v.aim)||!Number.isFinite(v.power)||Math.abs(v.aim)>48||v.power<0||v.power>100)throw new Error('Use aim between -48 and 48 and power between 0 and 100.');
      if(!shoot(v.aim/100,v.power))throw new Error('Wait until the room is ready and any dialog is closed.');
      await new Promise<void>(resolve=>{const begin=performance.now();const timer=setInterval(()=>{const state=read();if(!state.busy||state.transition||performance.now()-begin>5500||lifecycle.signal.aborted){clearInterval(timer);resolve();}},50);});return read();
    },
  },{
    name:'enter_beach_house',description:'Advance to the beach house after earning 100 office points.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(){const state=read();if(state.level!==1||state.score<100||!state.transition)throw new Error('Earn 100 office points first.');enterBeach();await new Promise<void>(resolve=>setTimeout(resolve,100));return read();},
  }];
  for(const tool of definitions){try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
  return()=>lifecycle.abort();
}

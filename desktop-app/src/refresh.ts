export type PollOptions<T>={read:()=>Promise<T>;accept:(value:T)=>void;error:(cause:unknown)=>void;active?:()=>boolean;interval?:number;schedule?:(fn:()=>void,delay:number)=>unknown;cancel?:(id:unknown)=>void};
export function poll<T>(options:PollOptions<T>):()=>void {let stopped=false;let timer:unknown;
  const schedule=options.schedule??((fn,delay)=>setTimeout(fn,delay));
  const cancel=options.cancel??(id=>clearTimeout(id as ReturnType<typeof setTimeout>));
  async function tick() {
    if(stopped)return;
    try {if(!options.active || options.active()) {const value=await options.read();if(!stopped)options.accept(value);}}
    catch(cause){if(!stopped)options.error(cause);}
    finally{if(!stopped)timer=schedule(()=>{void tick();},options.interval??1000);}
  }
  void tick();
  return()=>{stopped=true;if(timer!==undefined)cancel(timer);};}
export function selectionKey(threadId:string,environmentId:string):string {return `selection:${threadId}:${environmentId}`;}

// Shared across panel mounts so reopen/rescan cannot read an older preference
// while the previous panel still has a save in flight.
export class SelectionSaves {
  private pending=new Map<string,Promise<void>>();
  save(threadId:string,write:()=>Promise<void>):Promise<void> {
    const next=(this.pending.get(threadId)??Promise.resolve()).catch(()=>{}).then(write);
    this.pending.set(threadId,next);
    void next.finally(()=>{if(this.pending.get(threadId)===next)this.pending.delete(threadId);}).catch(()=>{});
    return next;
  }
  async settled(threadId:string):Promise<void> {
    while(this.pending.has(threadId)) {await this.pending.get(threadId)!.catch(()=>{});}
  }
}

from pathlib import Path
import subprocess,hashlib,json,datetime
repo=Path('/Users/rgrp/src/datasets/datapressr')
wt=repo/'.runtime/worktrees/integration-20261030'
log=Path('/tmp/datapressr-main-cas-20261030.json')
record={'timestamp_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'operations':[]}
def save(): log.write_text(json.dumps(record,indent=2)+'\n')
def git(*args,cwd=repo):
 cmd=['git','-c','core.hooksPath=/dev/null',*args]
 r=subprocess.run(cmd,cwd=cwd,capture_output=True)
 record['operations'].append({'cwd':str(cwd),'argv':cmd,'exit':r.returncode,'stdout':r.stdout.decode(errors='replace'),'stderr':r.stderr.decode(errors='replace')});save()
 if r.returncode: raise RuntimeError('Git command failed; see log')
 return r.stdout
old='a11d0670702d8b76cb6131b4fcde0a084ddf42da'
new='5a2d8e8eac906102caf0a95547780260c7cb37dc'
source='dd580cf2760b24ab4558b11a7092849bda3345ac'
work='46a14a5f25cee203844a38d5fcc284293ee2301b'
remote='52f2b232298d88f4cc90c0c8a27d3b61688fd7e0'
refs=['HEAD','main','origin/main','integration/main-reconciliation-20261030','work/structure-eval-quality-2026-10-15']
def snapshot():
 status=git('status','--porcelain=v1','-uall','-z')
 files={}
 for row in status.split(b'\0'):
  if not row: continue
  assert row[:3] in [b' M ',b'?? '], 'Unexpected active status; stop'
  name=row[3:].decode(); p=repo/name
  assert p.is_file() and not p.is_symlink()
  files[name]={'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
 return {'status_hex':status.hex(),'files':files,'head':git('rev-parse','HEAD').decode().strip(),'branch':git('symbolic-ref','HEAD').decode().strip()}
try:
 assert git('rev-parse',*refs).decode().splitlines()==[work,old,remote,new,work]
 registrations=git('worktree','list','--porcelain')
 assert b'branch refs/heads/main\n' not in registrations
 assert registrations.count(b'worktree ')==8
 assert git('rev-parse','HEAD',cwd=wt).decode().strip()==new
 assert git('status','--porcelain=v1','-uall',cwd=wt)==b''
 assert git('show','-s','--format=%T%n%P',new).decode().splitlines()==['0e544055623bc1fa2fbbb62706938f00c9164e2d',work+' '+remote]
 for ref in [old,source,work,remote]: git('merge-base','--is-ancestor',ref,new)
 before=snapshot();record['before']=before;save()
 assert before['files']['.beads/issues.jsonl']['sha256']=='a1c5199e4411718cc50f11d2568db5f8c2f311970f80217846106a5f686a7b86'
 assert len(before['files'])==3
 assert git('worktree','list','--porcelain')==registrations
 assert git('rev-parse',*refs).decode().splitlines()==[work,old,remote,new,work]
 git('update-ref','-m','Reviewed local integration of preserved work and origin/main','refs/heads/main',new,old)
 record['ref_update_occurred']=True;save()
 assert git('rev-parse',*refs).decode().splitlines()==[work,new,remote,new,work]
 assert git('worktree','list','--porcelain')==registrations
 for ref in [source,work,remote,old]:git('merge-base','--is-ancestor',ref,'main')
 after=snapshot();record['after']=after
 assert after==before
 record.update({'result':'PASS','old_main':old,'new_main':new,'source_ancestor_of_main':True,'active_head_dirty_untracked_preserved':True});save()
 print(json.dumps({k:record[k] for k in ['result','old_main','new_main','source_ancestor_of_main','active_head_dirty_untracked_preserved']}))
except BaseException as e:
 record['error']=str(e);save();raise

/* MSI Financing Calculator — Supabase Access Control
   IMPORTANT: use only the Supabase Project URL and Publishable key here.
   NEVER put a sb_secret_ or service_role key in this file.
*/

const SUPABASE_URL = "https://cdtddpmkulrlllgmbasq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_vB63Sq3B-eJe5HGknMkW_Q_9XIbSb5E";
const SUPABASE_CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

let supabaseClient = null;
let currentProfile = null;
let guardInitialized = false;

function esc(value){
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadSupabase(){
  return new Promise((resolve, reject) => {
    if(window.supabase?.createClient){ return resolve(); }
    const s = document.createElement("script");
    s.src = SUPABASE_CDN;
    s.onload = () => {
      if(window.supabase?.createClient) resolve();
      else reject(new Error("Supabase client loaded, but createClient is unavailable."));
    };
    s.onerror = () => reject(new Error("Unable to load the Supabase client library. Check the internet connection or Safari content blockers."));
    document.head.appendChild(s);
  });
}

function validConfig(){
  return SUPABASE_URL.startsWith("https://") &&
         !SUPABASE_URL.includes("PASTE_") &&
         SUPABASE_PUBLISHABLE_KEY.startsWith("sb_") &&
         !SUPABASE_PUBLISHABLE_KEY.includes("PASTE_");
}

function injectStyles(){
  const style = document.createElement("style");
  style.textContent = `
    #msiAuthGate{position:fixed;inset:0;z-index:99999;background:#0b1220;color:#f5f7fb;display:flex;align-items:center;justify-content:center;padding:20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
    #msiAuthCard{width:min(430px,100%);background:#111827;border:1px solid #374151;border-radius:18px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.4)}
    #msiAuthCard h2{margin:0 0 6px;font-size:22px}#msiAuthCard p{color:#9ca3af;font-size:12px;line-height:1.5}
    #msiAuthCard label{display:block;margin:14px 0 6px;color:#d1d5db;font-size:12px;font-weight:700}
    #msiAuthCard input,#msiAuthCard button{width:100%;min-height:46px;border-radius:10px;font-size:15px}
    #msiAuthCard input{padding:10px 12px;border:1px solid #4b5563;background:#1f2937;color:#fff}
    #msiAuthCard button{margin-top:12px;border:0;background:#f9fafb;color:#111827;font-weight:900;cursor:pointer}
    #msiAuthMsg{margin-top:12px;padding:10px;border-radius:9px;font-size:12px;display:none}
    #msiAuthMsg.error{display:block;background:#3f1515;border:1px solid #7f1d1d;color:#fecaca}
    #msiAuthMsg.ok{display:block;background:#064e2b;border:1px solid #15803d;color:#bbf7d0}
    #msiAdminPanel{position:fixed;right:16px;top:16px;z-index:99990;width:min(430px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;background:#111827;border:1px solid #374151;border-radius:16px;padding:16px;box-shadow:0 15px 50px rgba(0,0,0,.45);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:#f5f7fb}
    #msiAdminPanel h3{margin:0 0 4px;font-size:17px}#msiAdminPanel .adminSub{color:#9ca3af;font-size:11px;margin-bottom:12px}
    .msiUser{border:1px solid #374151;border-radius:11px;padding:11px;margin:8px 0}.msiUserTop{display:flex;justify-content:space-between;gap:10px}.msiUserName{font-weight:800;font-size:13px}.msiUserEmail{color:#9ca3af;font-size:11px;margin-top:2px;word-break:break-word}.msiBadge{font-size:10px;font-weight:900;padding:4px 7px;border-radius:999px;white-space:nowrap}.msiBadge.on{background:#064e2b;color:#bbf7d0}.msiBadge.off{background:#3f1515;color:#fecaca}
    .msiUserActions{display:flex;gap:7px;margin-top:9px}.msiUserActions button{flex:1;padding:8px;border-radius:8px;border:1px solid #4b5563;background:#1f2937;color:#fff;font-weight:800;font-size:11px;cursor:pointer}.msiUserActions button.grant{background:#064e2b;border-color:#15803d}.msiUserActions button.revoke{background:#3f1515;border-color:#7f1d1d}.msiAdminClose{position:absolute;right:12px;top:10px;background:none!important;border:0!important;color:#9ca3af!important;font-size:18px!important;width:auto!important;min-height:auto!important}
    #msiUserBar{position:fixed;right:16px;bottom:16px;z-index:99980;background:#111827;border:1px solid #374151;border-radius:10px;padding:9px 11px;color:#d1d5db;font:11px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;display:flex;gap:8px;align-items:center;box-shadow:0 8px 25px rgba(0,0,0,.25)}
    #msiUserBar button{border:1px solid #4b5563;border-radius:7px;background:#1f2937;color:#fff;padding:6px 8px;font-size:10px;font-weight:800;cursor:pointer}
  `;
  document.head.appendChild(style);
}

function showGate(message=""){
  let gate=document.getElementById("msiAuthGate");
  if(!gate){
    gate=document.createElement("div"); gate.id="msiAuthGate";
    gate.innerHTML=`<div id="msiAuthCard"><h2>MSI Financing Calculator</h2><p>Authorized access only.</p><form id="msiLoginForm"><label>Email</label><input id="msiEmail" type="email" autocomplete="username" required><label>Password</label><input id="msiPassword" type="password" autocomplete="current-password" required><button type="submit">SIGN IN</button></form><div id="msiAuthMsg"></div></div>`;
    document.body.appendChild(gate);
    document.getElementById("msiLoginForm").addEventListener("submit", login);
  }
  gate.style.display="flex";
  showApp();
  if(message) setGateMessage(message,"error");
}

function hideGate(){ const gate=document.getElementById("msiAuthGate"); if(gate) gate.style.display="none"; }
function setGateMessage(text,type="error"){ const el=document.getElementById("msiAuthMsg"); if(!el)return; el.textContent=text; el.className=type; }
function hideApp(){ document.documentElement.style.visibility="hidden"; }
function showApp(){ document.documentElement.style.visibility="visible"; }

function profileIsActive(profile){
  if(!profile || profile.is_active !== true) return false;
  if(profile.expires_at){
    const expires = new Date(profile.expires_at).getTime();
    if(Number.isFinite(expires) && expires <= Date.now()) return false;
  }
  return true;
}

async function fetchProfile(userId){
  const {data,error}=await supabaseClient.from("app_users").select("id,email,name,full_name,role,is_active,expires_at,created_at").eq("id",userId).maybeSingle();
  if(error) throw error;
  return data;
}

function friendlyAuthError(error){
  const message=String(error?.message || error || "Sign-in failed.");
  if(message === "Load failed" || message === "Failed to fetch" || /network/i.test(message)){
    return "Unable to connect to the MSI authorization server. Please check your internet connection or Safari content blockers, then try again.";
  }
  return message;
}

async function login(event){
  event.preventDefault();
  const email=document.getElementById("msiEmail").value.trim();
  const password=document.getElementById("msiPassword").value;
  const button=event.submitter;
  button.disabled=true; button.textContent="SIGNING IN...";
  try{
    if(!supabaseClient) throw new Error("Authorization service is still loading. Please refresh and try again.");
    const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
    if(error) throw error;
    const profile=await fetchProfile(data.user.id);
    if(!profileIsActive(profile)){
      await supabaseClient.auth.signOut();
      throw new Error("Your account is not currently authorized to use this calculator.");
    }
    currentProfile=profile;
    hideGate(); showApp(); renderUserBar();
    if(profile.role === "admin") renderAdminPanel();
  }catch(error){
    setGateMessage(friendlyAuthError(error),"error");
  }finally{
    button.disabled=false; button.textContent="SIGN IN";
  }
}

async function logout(){
  await supabaseClient.auth.signOut();
  currentProfile=null;
  const panel=document.getElementById("msiAdminPanel"); if(panel) panel.remove();
  const bar=document.getElementById("msiUserBar"); if(bar) bar.remove();
  showApp(); showGate("You have been signed out.");
}

function renderUserBar(){
  let bar=document.getElementById("msiUserBar"); if(bar)bar.remove();
  bar=document.createElement("div"); bar.id="msiUserBar";
  const label=currentProfile?.name || currentProfile?.full_name || currentProfile?.email || "Authorized user";
  bar.innerHTML=`<span>${esc(label)}</span><button id="msiLogoutBtn">LOG OUT</button>`;
  document.body.appendChild(bar);
  document.getElementById("msiLogoutBtn").onclick=logout;
}

async function loadAdminUsers(){
  const list=document.getElementById("msiAdminUsers"); if(!list)return;
  list.innerHTML="<div class='adminSub'>Loading users...</div>";
  const {data,error}=await supabaseClient.from("app_users").select("id,email,name,full_name,role,is_active,expires_at,created_at").order("created_at",{ascending:true});
  if(error){list.innerHTML=`<div class='adminSub'>Unable to load users: ${esc(error.message)}</div>`;return;}
  list.innerHTML=data.map(user=>{
    const display=user.name||user.full_name||user.email||user.id;
    const active=profileIsActive(user);
    const expiry=user.expires_at ? new Date(user.expires_at).toLocaleString() : "No expiration";
    return `<div class="msiUser"><div class="msiUserTop"><div><div class="msiUserName">${esc(display)}</div><div class="msiUserEmail">${esc(user.email||"")}</div></div><span class="msiBadge ${active?"on":"off"}">${active?"ACTIVE":"REVOKED"}</span></div><div class="msiUserEmail">Role: ${esc(user.role||"sales_agent")} • ${esc(expiry)}</div>${user.id!==currentProfile.id?`<div class="msiUserActions"><button class="grant" data-action="grant" data-id="${esc(user.id)}">GIVE ACCESS</button><button class="revoke" data-action="revoke" data-id="${esc(user.id)}">REVOKE ACCESS</button></div>`:""}</div>`;
  }).join("") || "<div class='adminSub'>No users found.</div>";
  list.querySelectorAll("button[data-action]").forEach(btn=>btn.addEventListener("click",()=>setAccess(btn.dataset.id,btn.dataset.action==="grant")));
}

async function setAccess(userId,active){
  if(!currentProfile || currentProfile.role!=="admin") return;
  const {error}=await supabaseClient.from("app_users").update({is_active:active}).eq("id",userId);
  if(error){alert(`Unable to update access: ${error.message}`);return;}
  await loadAdminUsers();
}

function renderAdminPanel(){
  let panel=document.getElementById("msiAdminPanel"); if(panel)panel.remove();
  panel=document.createElement("div"); panel.id="msiAdminPanel";
  panel.innerHTML=`<button class="msiAdminClose" id="msiAdminClose">×</button><h3>Access Control</h3><div class="adminSub">Administrator • Give Access / Revoke Access</div><div id="msiAdminUsers"></div>`;
  document.body.appendChild(panel);
  document.getElementById("msiAdminClose").onclick=()=>panel.remove();
  loadAdminUsers();
}

async function verifyCurrentAccess(){
  const {data:{user},error:userError}=await supabaseClient.auth.getUser();
  if(userError) throw userError;
  if(!user) return false;
  const profile=await fetchProfile(user.id);
  if(!profileIsActive(profile)){
    await supabaseClient.auth.signOut();
    throw new Error("Your access has been revoked or expired.");
  }
  currentProfile=profile;
  return true;
}

async function initializeGuard(){
  if(guardInitialized)return;
  guardInitialized=true;
  hideApp(); injectStyles(); showGate();
  if(!validConfig()){
    setGateMessage("Supabase configuration is not set. Add the Project URL and Publishable key in access-guard.js.","error");
    return;
  }
  try{
    await loadSupabase();
    supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
    const authorized=await verifyCurrentAccess().catch(error=>{showGate(friendlyAuthError(error));return false;});
    if(authorized){
      hideGate(); showApp(); renderUserBar();
      if(currentProfile.role === "admin") renderAdminPanel();
    }
    supabaseClient.auth.onAuthStateChange(async (event)=>{
      if(event === "SIGNED_OUT"){
        currentProfile=null;
        const panel=document.getElementById("msiAdminPanel"); if(panel)panel.remove();
        const bar=document.getElementById("msiUserBar"); if(bar)bar.remove();
        showGate();
      }
    });
  }catch(error){
    showGate(friendlyAuthError(error));
  }
}

document.addEventListener("DOMContentLoaded",initializeGuard);

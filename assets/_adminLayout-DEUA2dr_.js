import{_ as f,i as u,g as _,x as p,r as m,a as g,o as I,b as e,e as S,c as i,w as d,f as v,p as c,t as k,M as x,d as h,F as z}from"./index-C2jtDg6B.js";import{H as y}from"./Header-xQKRSuy7.js";const w={__name:"AdminSidebar",props:["activeItem"],setup(b,{expose:t}){t();const s=u(!1),a=()=>{s.value=!s.value},n=_(),o=u({});p(async()=>{o.value=await n.getUserInfo()});const r={isShrinkView:s,toggleSidebar:a,authStore:n,user:o,onSignOut:()=>{x.confirm({title:"Wanna sign out from AIQ ?",content:"Make sure you don't forget anything.",centered:!0,onOk:()=>{n.logOut()},onCancel:()=>{}})},ref:u,onBeforeMount:p,get useAuthStore(){return _},get Modal(){return x}};return Object.defineProperty(r,"__isScriptSetup",{enumerable:!1,value:!0}),r}},A=["aria-label"],L={class:"sidebar-wrapper"},R={class:"sidebar-list"},C={class:"sidebar-profileSection"},V=["src"];function M(b,t,s,a,n,o){const l=m("a-divider"),r=m("RouterLink");return I(),g("div",{class:c(["sidebar-container",{shrink:a.isShrinkView}])},[e("button",{class:"sidebar-viewButton",type:"button","aria-label":a.isShrinkView?"Expand Sidebar":"Shrink Sidebar",onClick:a.toggleSidebar},t[0]||(t[0]=[e("i",{class:"bx bx-left-arrow-alt"},null,-1)]),8,A),e("div",L,[e("ul",R,[S(` <li :class="['sidebar-listItem active', { active: activeItem === 'dashboard' }]">
                    <RouterLink :to="{ name: 'Admin_Dashboards_View' }">
                        <i class="bx bxs-dashboard"></i>
                        <span class="sidebar-listItemText">Dashboards</span>
                    </RouterLink>
                </li>
                <li :class="['sidebar-listItem', { active: activeItem === 'appointment' }]">
                    <RouterLink :to="{}">
                        <i class="bx bx-book-open"></i>
                        <span class="sidebar-listItemText">Quizzes</span>
                    </RouterLink>
                </li>
                <li :class="['sidebar-listItem', { active: activeItem === 'user' }]">
                    <RouterLink :to="{}">
                        <i class="bx bxs-calendar"></i>
                        <span class="sidebar-listItemText">Exam Schedule</span>
                    </RouterLink>
                </li>
                <li :class="['sidebar-listItem', { active: activeItem === 'doctor' }]">
                    <RouterLink :to="{}">
                        <i class="bx bx-group"></i>
                        <span class="sidebar-listItemText">Class</span>
                    </RouterLink>
                </li> `),i(l,{class:"divider",orientation:"left","orientation-margin":"0px",style:{"margin-bottom":"0px",color:"#fff"}},{default:d(()=>t[1]||(t[1]=[v(" Manage ")])),_:1,__:[1]}),i(l,{class:"divider",style:{"margin-top":"0px","background-color":"#fff"}}),e("li",{class:c(["sidebar-listItem",{active:s.activeItem==="specialty"}])},[i(r,{to:{}},{default:d(()=>t[2]||(t[2]=[e("i",{class:"bx bx-cog"},null,-1),e("span",{class:"sidebar-listItemText"},"Settings",-1)])),_:1,__:[2]})],2),e("li",{class:c(["sidebar-listItem",{active:s.activeItem==="account"}])},[i(r,{to:{name:"Admin_Manager_Account"}},{default:d(()=>t[3]||(t[3]=[e("i",{class:"bx bx-cog"},null,-1),e("span",{class:"sidebar-listItemText"},"Manager Account",-1)])),_:1,__:[3]})],2),e("li",{class:c(["sidebar-listItem sign-out",{active:s.activeItem==="specialty"}]),onClick:a.onSignOut},[i(r,{to:{}},{default:d(()=>t[4]||(t[4]=[e("i",{class:"bx bx-download bx-rotate-270"},null,-1),e("span",{class:"sidebar-listItemText"},"Sign out",-1)])),_:1,__:[4]})],2)]),e("div",C,[e("img",{src:a.user.image},null,8,V),e("div",null,[e("span",null,k(a.user.fullName),1),e("span",{class:"sign-out-btn",onClick:a.onSignOut},t[5]||(t[5]=[v(" Sign out "),e("i",{class:"bx bx-download bx-rotate-270"},null,-1)]))])])])],2)}const O=f(w,[["render",M],["__scopeId","data-v-1c2f51ed"],["__file","/home/runner/work/AIQuizzizz-Frontend/AIQuizzizz-Frontend/src/shared/components/AdminSidebar.vue"]]),T=h({__name:"_adminLayout",setup(b,{expose:t}){t();const s=u("dashboard"),n={sidebarItem:s,handleSidebarUpdate:o=>{s.value=o},AdminSidebar:O,Header:y};return Object.defineProperty(n,"__isScriptSetup",{enumerable:!1,value:!0}),n}}),F={class:"layout-container"},Q={class:"layout-body"};function B(b,t,s,a,n,o){const l=m("RouterView");return I(),g(z,null,[i(a.Header),S(' <div class="d-flex"> '),e("div",F,[e("div",null,[i(a.AdminSidebar,{activeItem:a.sidebarItem},null,8,["activeItem"])]),e("div",Q,[i(l,{onUpdateSidebar:a.handleSidebarUpdate})])])],64)}const D=f(T,[["render",B],["__scopeId","data-v-0b08c6b3"],["__file","/home/runner/work/AIQuizzizz-Frontend/AIQuizzizz-Frontend/src/shared/layouts/_adminLayout.vue"]]);export{D as default};

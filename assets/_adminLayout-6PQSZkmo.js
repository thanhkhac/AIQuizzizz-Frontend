import{_ as f,i as u,g as p,x,r as _,c as I,o as S,b as e,e as m,a as i,w as l,f as g,p as d,t as k,M as v,d as y,F as h}from"./index-CPgAPADT.js";import{u as z}from"./user-zaK1_Zi8.js";import{H as A}from"./Header-DydpUvX6.js";const w={__name:"AdminSidebar",props:["activeItem"],setup(b,{expose:t}){t();const a=u(!1),s=()=>{a.value=!a.value},n=p(),r=u({});x(async()=>{r.value=await n.getUserInfo()});const o={isShrinkView:a,toggleSidebar:s,authStore:n,user:r,onSignOut:()=>{v.confirm({title:"Wanna sign out from AIQ ?",content:"Make sure you don't forget anything.",centered:!0,onOk:()=>{n.logOut()},onCancel:()=>{}})},get user_image(){return z},ref:u,onBeforeMount:x,get useAuthStore(){return p},get Modal(){return v}};return Object.defineProperty(o,"__isScriptSetup",{enumerable:!1,value:!0}),o}},L=["aria-label"],R={class:"sidebar-wrapper"},C={class:"sidebar-list"},M={class:d(["sidebar-listItem"])},T={class:"sidebar-profileSection"},V=["src"];function O(b,t,a,s,n,r){const c=_("a-divider"),o=_("RouterLink");return S(),I("div",{class:d(["sidebar-container",{shrink:s.isShrinkView}])},[e("button",{class:"sidebar-viewButton",type:"button","aria-label":s.isShrinkView?"Expand Sidebar":"Shrink Sidebar",onClick:s.toggleSidebar},t[0]||(t[0]=[e("i",{class:"bx bx-left-arrow-alt"},null,-1)]),8,L),e("div",R,[e("ul",C,[m(` <li :class="['sidebar-listItem active', { active: activeItem === 'dashboard' }]">
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
                </li> `),i(c,{class:"divider",orientation:"left","orientation-margin":"0px",style:{"margin-bottom":"0px",color:"#fff"}},{default:l(()=>t[1]||(t[1]=[g(" Manage ")])),_:1,__:[1]}),i(c,{class:"divider",style:{"margin-top":"0px","background-color":"#fff"}}),m(` <li :class="['sidebar-listItem', { active: activeItem === 'specialty' }]">
                    <RouterLink :to="{}">
                        <i class="bx bx-cog"></i>
                        <span class="sidebar-listItemText">Settings</span>
                    </RouterLink>
                </li> `),e("li",{class:d(["sidebar-listItem",{active:a.activeItem==="account"}])},[i(o,{to:{name:"Admin_Manager_Account"}},{default:l(()=>t[2]||(t[2]=[e("i",{class:"bx bx-cog"},null,-1),e("span",{class:"sidebar-listItemText"},"Manager Account",-1)])),_:1,__:[2]})],2),e("li",{class:d(["sidebar-listItem",{active:a.activeItem==="subscription"}])},[i(o,{to:{name:"Admin_Manager_Subscription"}},{default:l(()=>t[3]||(t[3]=[e("i",{class:"bx bx-cog"},null,-1),e("span",{class:"sidebar-listItemText"},"Manager Subscription",-1)])),_:1,__:[3]})],2),e("li",{class:d(["sidebar-listItem",{active:a.activeItem==="system_settings"}])},[i(o,{to:{name:"Admin_System_Settings"}},{default:l(()=>t[4]||(t[4]=[e("i",{class:"bx bx-cog"},null,-1),e("span",{class:"sidebar-listItemText"},"System Settings",-1)])),_:1,__:[4]})],2),e("li",M,[i(o,{to:{name:"User_Dashboard"}},{default:l(()=>t[5]||(t[5]=[e("i",{class:"bx bx-refresh"},null,-1),e("span",{class:"sidebar-listItemText"}," Switch to User ",-1)])),_:1,__:[5]})]),m(` <li :class="['sidebar-listItem', { active: activeItem === 'class' }]">
                    <RouterLink :to="{ name: 'Admin_Manager_Class' }">
                        <i class="bx bx-cog"></i>
                        <span class="sidebar-listItemText">Manager Class</span>
                    </RouterLink>
                </li> `),e("li",{class:d(["sidebar-listItem sign-out",{active:a.activeItem==="specialty"}]),onClick:s.onSignOut},[i(o,{to:{}},{default:l(()=>t[6]||(t[6]=[e("i",{class:"bx bx-download bx-rotate-270"},null,-1),e("span",{class:"sidebar-listItemText"},"Sign out",-1)])),_:1,__:[6]})],2)]),e("div",T,[e("img",{src:s.user_image},null,8,V),e("div",null,[e("span",null,k(s.user.fullName),1),e("span",{class:"sign-out-btn",onClick:s.onSignOut},t[7]||(t[7]=[g(" Sign out "),e("i",{class:"bx bx-download bx-rotate-270"},null,-1)]))])])])],2)}const U=f(w,[["render",O],["__scopeId","data-v-1c2f51ed"],["__file","/home/runner/work/AIQuizzizz-Frontend/AIQuizzizz-Frontend/src/shared/components/AdminSidebar.vue"]]),F=y({__name:"_adminLayout",setup(b,{expose:t}){t();const a=u("dashboard"),n={sidebarItem:a,handleSidebarUpdate:r=>{a.value=r},AdminSidebar:U,Header:A};return Object.defineProperty(n,"__isScriptSetup",{enumerable:!1,value:!0}),n}}),Q={class:"layout-container"},B={class:"layout-body"};function N(b,t,a,s,n,r){const c=_("RouterView");return S(),I(h,null,[i(s.Header),m(' <div class="d-flex"> '),e("div",Q,[e("div",null,[i(s.AdminSidebar,{activeItem:s.sidebarItem},null,8,["activeItem"])]),e("div",B,[i(c,{onUpdateSidebar:s.handleSidebarUpdate})])])],64)}const j=f(F,[["render",N],["__scopeId","data-v-0b08c6b3"],["__file","/home/runner/work/AIQuizzizz-Frontend/AIQuizzizz-Frontend/src/shared/layouts/_adminLayout.vue"]]);export{j as default};

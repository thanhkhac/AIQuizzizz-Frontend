import{_ as f,i as u,g as p,x,r as _,a as I,o as S,b as e,e as m,c as i,w as d,f as g,p as c,t as k,M as v,d as y,F as z}from"./index-BeJw_uqm.js";import{u as h}from"./user-zaK1_Zi8.js";import{H as A}from"./Header-SnuZL0RY.js";const L={__name:"AdminSidebar",props:["activeItem"],setup(b,{expose:t}){t();const a=u(!1),s=()=>{a.value=!a.value},n=p(),r=u({});x(async()=>{r.value=await n.getUserInfo()});const o={isShrinkView:a,toggleSidebar:s,authStore:n,user:r,onSignOut:()=>{v.confirm({title:"Wanna sign out from AIQ ?",content:"Make sure you don't forget anything.",centered:!0,onOk:()=>{n.logOut()},onCancel:()=>{}})},get user_image(){return h},ref:u,onBeforeMount:x,get useAuthStore(){return p},get Modal(){return v}};return Object.defineProperty(o,"__isScriptSetup",{enumerable:!1,value:!0}),o}},w=["aria-label"],R={class:"sidebar-wrapper"},C={class:"sidebar-list"},M={class:"sidebar-profileSection"},T=["src"];function V(b,t,a,s,n,r){const l=_("a-divider"),o=_("RouterLink");return S(),I("div",{class:c(["sidebar-container",{shrink:s.isShrinkView}])},[e("button",{class:"sidebar-viewButton",type:"button","aria-label":s.isShrinkView?"Expand Sidebar":"Shrink Sidebar",onClick:s.toggleSidebar},t[0]||(t[0]=[e("i",{class:"bx bx-left-arrow-alt"},null,-1)]),8,w),e("div",R,[e("ul",C,[m(` <li :class="['sidebar-listItem active', { active: activeItem === 'dashboard' }]">
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
                </li> `),i(l,{class:"divider",orientation:"left","orientation-margin":"0px",style:{"margin-bottom":"0px",color:"#fff"}},{default:d(()=>t[1]||(t[1]=[g(" Manage ")])),_:1,__:[1]}),i(l,{class:"divider",style:{"margin-top":"0px","background-color":"#fff"}}),m(` <li :class="['sidebar-listItem', { active: activeItem === 'specialty' }]">
                    <RouterLink :to="{}">
                        <i class="bx bx-cog"></i>
                        <span class="sidebar-listItemText">Settings</span>
                    </RouterLink>
                </li> `),e("li",{class:c(["sidebar-listItem",{active:a.activeItem==="account"}])},[i(o,{to:{name:"Admin_Manager_Account"}},{default:d(()=>t[2]||(t[2]=[e("i",{class:"bx bx-cog"},null,-1),e("span",{class:"sidebar-listItemText"},"Manager Account",-1)])),_:1,__:[2]})],2),e("li",{class:c(["sidebar-listItem",{active:a.activeItem==="subscription"}])},[i(o,{to:{name:"Admin_Manager_Subscription"}},{default:d(()=>t[3]||(t[3]=[e("i",{class:"bx bx-cog"},null,-1),e("span",{class:"sidebar-listItemText"},"Manager Subscription",-1)])),_:1,__:[3]})],2),e("li",{class:c(["sidebar-listItem",{active:a.activeItem==="system_settings"}])},[i(o,{to:{name:"Admin_System_Settings"}},{default:d(()=>t[4]||(t[4]=[e("i",{class:"bx bx-cog"},null,-1),e("span",{class:"sidebar-listItemText"},"System Settings",-1)])),_:1,__:[4]})],2),m(` <li :class="['sidebar-listItem', { active: activeItem === 'class' }]">
                    <RouterLink :to="{ name: 'Admin_Manager_Class' }">
                        <i class="bx bx-cog"></i>
                        <span class="sidebar-listItemText">Manager Class</span>
                    </RouterLink>
                </li> `),e("li",{class:c(["sidebar-listItem sign-out",{active:a.activeItem==="specialty"}]),onClick:s.onSignOut},[i(o,{to:{}},{default:d(()=>t[5]||(t[5]=[e("i",{class:"bx bx-download bx-rotate-270"},null,-1),e("span",{class:"sidebar-listItemText"},"Sign out",-1)])),_:1,__:[5]})],2)]),e("div",M,[e("img",{src:s.user_image},null,8,T),e("div",null,[e("span",null,k(s.user.fullName),1),e("span",{class:"sign-out-btn",onClick:s.onSignOut},t[6]||(t[6]=[g(" Sign out "),e("i",{class:"bx bx-download bx-rotate-270"},null,-1)]))])])])],2)}const O=f(L,[["render",V],["__scopeId","data-v-1c2f51ed"],["__file","/home/runner/work/AIQuizzizz-Frontend/AIQuizzizz-Frontend/src/shared/components/AdminSidebar.vue"]]),F=y({__name:"_adminLayout",setup(b,{expose:t}){t();const a=u("dashboard"),n={sidebarItem:a,handleSidebarUpdate:r=>{a.value=r},AdminSidebar:O,Header:A};return Object.defineProperty(n,"__isScriptSetup",{enumerable:!1,value:!0}),n}}),Q={class:"layout-container"},B={class:"layout-body"};function N(b,t,a,s,n,r){const l=_("RouterView");return S(),I(z,null,[i(s.Header),m(' <div class="d-flex"> '),e("div",Q,[e("div",null,[i(s.AdminSidebar,{activeItem:s.sidebarItem},null,8,["activeItem"])]),e("div",B,[i(l,{onUpdateSidebar:s.handleSidebarUpdate})])])],64)}const H=f(F,[["render",N],["__scopeId","data-v-0b08c6b3"],["__file","/home/runner/work/AIQuizzizz-Frontend/AIQuizzizz-Frontend/src/shared/layouts/_adminLayout.vue"]]);export{H as default};

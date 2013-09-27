"use strict";function AngularFire(e,t,n,r){this._q=e,this._parse=t,this._timeout=n,this._initial=!0,this._remoteValue=!1,typeof r=="string"?this._fRef=new Firebase(r):this._fRef=r}angular.module("firebase",[]).value("Firebase",Firebase),angular.module("firebase").factory("angularFire",["$q","$parse","$timeout",function(e,t,n){return function(r,i,s,o){var u=new AngularFire(e,t,n,r);return u.associate(i,s,o)}}]),AngularFire.prototype={associate:function(e,t,n){var r=this;n==undefined&&(n=[]);var i=this._q.defer(),s=i.promise;return this._fRef.on("value",function(s){var o=!1;i&&(o=i,i=!1),r._remoteValue=n;if(s&&s.val()!=undefined){var u=s.val();if(typeof u!=typeof n){r._log("Error: type mismatch");return}var a=Object.prototype.toString;if(a.call(n)!=a.call(u)){r._log("Error: type mismatch");return}r._remoteValue=angular.copy(u);if(angular.equals(u,r._parse(t)(e)))return}r._timeout(function(){r._resolve(e,t,o,r._remoteValue)})}),s},disassociate:function(){var e=this;e._unregister&&e._unregister(),this._fRef.off("value")},_resolve:function(e,t,n,r){var i=this;this._parse(t).assign(e,angular.copy(r)),this._remoteValue=angular.copy(r),n&&(n.resolve(function(){i.disassociate()}),this._watch(e,t))},_watch:function(e,t){var n=this;n._unregister=e.$watch(t,function(){if(n._initial){n._initial=!1;return}var r=JSON.parse(angular.toJson(n._parse(t)(e)));if(angular.equals(r,n._remoteValue))return;n._fRef.ref().set(r)},!0),e.$on("$destroy",function(){n.disassociate()})},_log:function(e){console&&console.log&&console.log(e)}},angular.module("firebase").factory("angularFireCollection",["$timeout",function(e){return function(t,n){function r(e,t){this.$ref=e.ref(),this.$id=e.name(),this.$index=t,angular.extend(this,{priority:e.getPriority()},e.val())}function u(e){return e?i[e]+1:0}function a(e,t){i[t.$id]=e,s.splice(e,0,t)}function f(e){var t=i[e];s.splice(t,1),i[e]=undefined}function l(e,t){s[e]=t}function c(e,t,n){s.splice(e,1),s.splice(t,0,n),h(e,t)}function h(e,t){var n=s.length;t=t||n,t>n&&(t=n);for(var r=e;r<t;r++){var o=s[r];o.$index=i[o.$id]=r}}var i={},s=[],o;return typeof t=="string"?o=new Firebase(t):o=t,n&&typeof n=="function"&&o.once("value",n),o.on("child_added",function(t,n){e(function(){var e=u(n);a(e,new r(t,e)),h(e)})}),o.on("child_removed",function(t){e(function(){var e=t.name(),n=i[e];f(e),h(n)})}),o.on("child_changed",function(t,n){e(function(){var e=i[t.name()],s=u(n),o=new r(t,e);l(e,o),s!==e&&c(e,s,o)})}),o.on("child_moved",function(t,n){e(function(){var e=i[t.name()],r=u(n),o=s[e];c(e,r,o)})}),s.getByName=function(e){return s[i[e]]},s.add=function(e,t){var n;return t?n=o.ref().push(e,t):n=o.ref().push(e),n},s.remove=function(e,t){var n=angular.isString(e)?s[i[e]]:e;t?n.$ref.remove(t):n.$ref.remove()},s.update=function(e,t){var n=angular.isString(e)?s[i[e]]:e,r={};angular.forEach(n,function(e,t){t.indexOf("$")!==0&&(r[t]=e)}),t?n.$ref.set(r,t):n.$ref.set(r)},s}}]),angular.module("firebase").factory("angularFireAuth",["$rootScope","$parse","$timeout","$location","$route",function(e,t,n,r,i){function s(e){var t=e.split(".");if(!t instanceof Array||t.length!==3)throw new Error("Invalid JWT");var n=t[1];return JSON.parse(decodeURIComponent(escape(window.atob(n))))}function o(e,r,i,s){r&&n(function(){t(r).assign(e,i),s()})}function u(e,t,n){e.authRequired&&!n._authenticated&&(e.pathTo===undefined?n._redirectTo=r.path():n._redirectTo=e.pathTo===t?"/":e.pathTo,r.replace(),r.path(t))}return{initialize:function(t,n){var r=this;n=n||{},this._scope=e,n.scope&&(this._scope=n.scope),n.name&&(this._name=n.name),this._cb=function(){},n.callback&&typeof n.callback=="function"&&(this._cb=n.callback),this._redirectTo=null,this._authenticated=!1,n.path&&(i.current&&u(i.current,n.path,r),e.$on("$routeChangeStart",function(e,t){u(t,n.path,r)})),this._ref=new Firebase(t);if(n.simple&&n.simple===!1){o(this._scope,this._name,null);return}if(!window.FirebaseSimpleLogin){var s=new Error("FirebaseSimpleLogin undefined, did you include firebase-simple-login.js?");e.$broadcast("angularFireAuth:error",s);return}var a=new FirebaseSimpleLogin(this._ref,function(t,n){r._cb(t,n),t?e.$broadcast("angularFireAuth:error",t):n?r._loggedIn(n):r._loggedOut()});this._authClient=a},login:function(t,n){switch(t){case"github":case"persona":case"twitter":case"facebook":case"password":if(!this._authClient){var r=new Error("Simple Login not initialized");e.$broadcast("angularFireAuth:error",r)}else this._authClient.login(t,n);break;default:var i,o=this;try{i=s(t),this._ref.auth(t,function(t){t?e.$broadcast("angularFireAuth:error",t):o._loggedIn(i)})}catch(u){e.$broadcast("angularFireAuth:error",u)}}},logout:function(){this._authClient?this._authClient.logout():(this._ref.unauth(),this._loggedOut())},_loggedIn:function(t){var n=this;this._authenticated=!0,o(this._scope,this._name,t,function(){e.$broadcast("angularFireAuth:login",t),n._redirectTo&&(r.replace(),r.path(n._redirectTo),n._redirectTo=null)})},_loggedOut:function(){this._authenticated=!1,o(this._scope,this._name,null,function(){e.$broadcast("angularFireAuth:logout")})}}}]),function(e){if("function"==typeof bootstrap)bootstrap("jade",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeJade=e}else"undefined"!=typeof window?window.jade=e():global.jade=e()}(function(){var e,t,n,r,i;return function s(e,t,n){function r(o,u){if(!t[o]){if(!e[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=t[o]={exports:{}};e[o][0].call(f.exports,function(t){var n=e[o][1][t];return r(n?n:t)},f,f.exports,s,e,t,n)}return t[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<n.length;o++)r(n[o]);return r}({1:[function(e,t,n){function r(e){return e!=null&&e!==""}function i(e){return Array.isArray(e)?e.map(i).filter(r).join(" "):e}Array.isArray||(Array.isArray=function(e){return"[object Array]"==Object.prototype.toString.call(e)}),Object.keys||(Object.keys=function(e){var t=[];for(var n in e)e.hasOwnProperty(n)&&t.push(n);return t}),n.merge=function(t,n){var i=t["class"],s=n["class"];if(i||s)i=i||[],s=s||[],Array.isArray(i)||(i=[i]),Array.isArray(s)||(s=[s]),t["class"]=i.concat(s).filter(r);for(var o in n)o!="class"&&(t[o]=n[o]);return t},n.attrs=function(t,r){var s=[],o=t.terse;delete t.terse;var u=Object.keys(t),a=u.length;if(a){s.push("");for(var f=0;f<a;++f){var l=u[f],c=t[l];"boolean"==typeof c||null==c?c&&(o?s.push(l):s.push(l+'="'+l+'"')):0==l.indexOf("data")&&"string"!=typeof c?s.push(l+"='"+JSON.stringify(c)+"'"):"class"==l?r&&r[l]?(c=n.escape(i(c)))&&s.push(l+'="'+c+'"'):(c=i(c))&&s.push(l+'="'+c+'"'):r&&r[l]?s.push(l+'="'+n.escape(c)+'"'):s.push(l+'="'+c+'"')}}return s.join(" ")},n.escape=function(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")},n.rethrow=function s(t,n,r,i){if(t instanceof Error){if((typeof window!="undefined"||!n)&&!i)throw t.message+=" on line "+r,t;try{i=i||e("fs").readFileSync(n,"utf8")}catch(o){s(t,null,r)}var u=3,a=i.split("\n"),f=Math.max(r-u,0),l=Math.min(a.length,r+u),u=a.slice(f,l).map(function(e,t){var n=t+f+1;return(n==r?"  > ":"    ")+n+"| "+e}).join("\n");throw t.path=n,t.message=(n||"Jade")+":"+r+"\n"+u+"\n\n"+t.message,t}throw t}},{fs:2}],2:[function(e,t,n){},{}]},{},[1])(1)}),function(){function s(e){return{top:e.offsetTop,left:e.offsetLeft}}function o(e){var t,n,r,i,o,u,a,f={top:0,left:0},l=e&&e.ownerDocument;if(!l)return;return(n=l.body)===e?s(e):(t=l.documentElement,typeof e.getBoundingClientRect!="undefined"&&(f=e.getBoundingClientRect()),r=window,i=t.clientTop||n.clientTop||0,o=t.clientLeft||n.clientLeft||0,u=r.pageYOffset||t.scrollTop,a=r.pageXOffset||t.scrollLeft,{top:f.top+u-i,left:f.left+a-o})}function u(e,t){var n=e.getAttribute("style").split(";"),r=[];for(var i=0,s=n.length;i<s;i++){var o=n[i].split(":"),u=o[0],a=o[1];u in t?r.push(u+":"+t[u]):r.push(o.join(":"))}e.setAttribute("style",r.join(";"))}function h(e){var t;e=e.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm,"").replace(/\n|\r/g,"");while((t=a.exec(e))!==null){var n=t[1];if(f.test(t[2])&&n!=="#modernizr"){var r=l.exec(t[2]),s=r!==null?parseInt(r[1]):0,u=i.call(document.querySelectorAll(n));u.forEach(function(e){var n=e.offsetHeight,r=e.parentElement,i=o(r),u=i!==null&&i.top!==null?i.top:0,a=o(e),f=a!==null&&a.top!==null?a.top:0,l=f-s,h=u+r.offsetHeight-n-s,p=t[2]+"position:fixed;width:"+e.offsetWidth+"px;height:"+n+"px",d=document.createElement("div");d.innerHTML='<span style="position:static;display:block;height:'+n+'px;"></span>',c.push({element:e,parent:r,repl:d.firstElementChild,start:l,end:h,oldCSS:t[2],newCSS:p,fixed:!1})})}}}var e=["","-webkit-","-ms-","-moz-","-o-"],t=document.createElement("div");for(var n=0,r=e.length;n<r;n++){t.style.position=e[n]+"sticky";if(t.style.position!="")return}var i=Array.prototype.slice,a=/\s*(.*?)\s*{(.*?)}+/g,f=/\.*?position:.*?sticky.*?;/,l=/\.*?top:(.*?);/,c=[];window.addEventListener("scroll",function(){var e=document.documentElement.scrollTop||document.body.scrollTop;for(var t=0,n=c.length;t<n;t++){var r=c[t];if(r.fixed===!1&&e>r.start&&e<r.end)r.element.setAttribute("style",r.newCSS),r.fixed=!0,r.element.classList.add("stuck");else if(r.fixed===!0)if(e<r.start)r.element.setAttribute("style",r.oldCSS),r.fixed=!1,r.element.classList.remove("stuck");else if(e>r.end){var i=o(r.element);i.position="absolute",r.element.setAttribute("style",r.newCSS),u(r.element,i),r.fixed=!1,r.element.classList.remove("stuck")}}},!1),window.addEventListener("load",function(){var e=i.call(document.querySelectorAll("style"));e.forEach(function(e){var t=e.textContent||e.innerText;h(t)});var t=i.call(document.querySelectorAll("link"));t.forEach(function(e){if(e.getAttribute("rel")!=="stylesheet")return;var t=e.getAttribute("href"),n=new XMLHttpRequest;n.open("GET",t,!0),n.onload=function(e){h(n.responseText)},n.send()})},!1)}();var switchTab=function(e){function t(e){var t=e.tabIdArr,n=e.tabClass,r=e.activeClass,i=e.contentId;for(var s=0,o=t.length;s<o;s++)document.getElementById(t[s]).onclick=function(t){var s=t.target.id,o={tab_state:s};history.pushState(o,s,"#"+s),console.log(history),console.log(history.state),e.activeColor(n,r,s),e.fetchContent(e.getUrl(s),i)};window.addEventListener("popstate",function(t){var s=e.showFirst;window.location.hash!==""&&(s=window.location.hash.substring(1)),e.activeColor(n,r,s),e.fetchContent(e.getUrl(s),i)},!1)}this.tabClass=e.tabClass||"",this.contentId=e.contentId||"",this.activeClass=e.activeClass||"",this.showFirst=e.showFirst||"",this.tabIdArr=e.tabId||[],this.showFirstFn(this),this.state(this),t(this)};switchTab.prototype.state=function(e){var t=e.contentId,n=e.tabClass,r=e.activeClass,t=e.contentId,i=window.location.hash,s=i.substring(1);i&&(this.activeColor(n,r,s),this.fetchContent(this.getUrl(s),t))},switchTab.prototype.getUrl=function(e){return document.getElementById(e).getAttribute("tab-url")},switchTab.prototype.fetchContent=function(e,t){var n;window.XMLHttpRequest?n=new XMLHttpRequest:n=new ActiveXObject("Microsoft.XMLHTTP"),n.onreadystatechange=function(){n.readyState==4&&n.status==200&&(document.getElementById(t).innerHTML=n.responseText)},n.open("GET",e,!0),n.send()},switchTab.prototype.activeColor=function(e,t,n){var r=document.getElementsByClassName(e);for(var i=0;i<r.length;i++)r[i].className=r[i].className.replace(t,"");document.getElementById(n).className+=" "+t},switchTab.prototype.showFirstFn=function(e){var t=e.showFirst,n=e.tabClass,r=e.activeClass,i=e.contentId;e.activeColor(n,r,t),e.fetchContent(e.getUrl(t),i)}
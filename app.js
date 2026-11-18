"use strict";
// 같은 사이트의 같은 탭에서 정보를 전달합니다. 서버 세션/DB가 아닙니다.
const KEY = "freshcup-order-v1";
const PRICE = 18000;
function readOrder(){try{return JSON.parse(sessionStorage.getItem(KEY)||"{}")||{};}catch(e){return {};}}
function saveOrder(order){try{sessionStorage.setItem(KEY,JSON.stringify(order));return true;}catch(e){const el=document.getElementById("status");if(el)el.textContent="임시 저장소를 사용할 수 없습니다. 브라우저의 사이트 저장 허용 설정을 확인하고, 게시된 사이트에서 같은 탭으로 다시 시도해 주세요.";return false;}}
function validQty(q){return Number.isInteger(Number(q)) && Number(q)>=1 && Number(q)<=10;}
function hasBuyer(o){return !!(o.buyerName&&o.email&&o.phone&&validQty(o.quantity));}
function hasDelivery(o){return !!(o.postcode&&o.address&&o.addressDetail&&o.payment&&o.agree);}
function money(n){return n.toLocaleString("ko-KR")+"원";}
function text(id,value){const el=document.getElementById(id);if(el)el.textContent=value;}
let order=readOrder();
const buyerForm=document.getElementById("buyer-form");
const deliveryForm=document.getElementById("delivery-form");
function updateTotal(){const q=document.getElementById("quantity");const value=q?q.value:(order.quantity||1);text("live-total",validQty(value)?money(PRICE*Number(value)):"수량 1~10개를 입력하세요");}
if(buyerForm){
 ["buyerName","email","phone","quantity"].forEach(id=>{if(order[id]!==undefined)document.getElementById(id).value=order[id];});
 document.getElementById("quantity").addEventListener("input",updateTotal);
 buyerForm.addEventListener("submit",e=>{e.preventDefault();const next={...order};["buyerName","email","phone","quantity"].forEach(id=>next[id]=document.getElementById(id).value.trim());if(!hasBuyer(next)){text("status","이름, 이메일, 전화번호와 수량을 확인해 주세요.");return;}next.quantity=Number(next.quantity);delete next.orderId;delete next.orderDate;if(saveOrder(next))location.href="delivery.html";});
}
if(deliveryForm){
 text("buyer-guide",hasBuyer(order)?order.buyerName+"님의 주문입니다. 수량 "+order.quantity+"개":"기본 정보가 없습니다. 이전 단계에서 구매자 정보를 먼저 입력해 주세요.");
 ["postcode","address","addressDetail","memo"].forEach(id=>{if(order[id])document.getElementById(id).value=order[id];});
 [...document.querySelectorAll('input[name="payment"]')].forEach(el=>el.checked=el.value===order.payment);
 // 재방문해도 임시 보관 동의는 다시 확인합니다.
 deliveryForm.addEventListener("submit",e=>{e.preventDefault();order=readOrder();if(!hasBuyer(order)){text("status","기본 정보를 먼저 입력해야 합니다. '기본 정보 수정' 버튼을 눌러 주세요.");return;}
 const next={...order};["postcode","address","addressDetail","memo"].forEach(id=>next[id]=document.getElementById(id).value.trim());next.payment=document.querySelector('input[name="payment"]:checked').value;next.agree=document.getElementById("agree").checked;if(!hasDelivery(next)){text("status","배송지 정보를 확인해 주세요.");return;}
 const now=new Date();next.orderDate=now.toISOString();const date=now.getFullYear()+String(now.getMonth()+1).padStart(2,"0")+String(now.getDate()).padStart(2,"0");next.orderId="DEMO-"+date+"-"+Math.random().toString(36).slice(2,8).toUpperCase();if(saveOrder(next))location.href="confirm.html";
 });
}
if(document.getElementById("receipt")&&hasBuyer(order)&&hasDelivery(order)&&order.orderId&&order.orderDate){
 document.getElementById("empty-state").hidden=true;document.getElementById("receipt").hidden=false;
 text("order-id",order.orderId);text("order-date",new Date(order.orderDate).toLocaleString("ko-KR"));
 ["buyerName","email","phone","payment"].forEach(id=>text("out-"+id,order[id]));text("out-quantity",order.quantity+"개");text("out-subtotal",money(PRICE*Number(order.quantity)));text("out-total",money(PRICE*Number(order.quantity)));text("out-address","("+order.postcode+") "+order.address+", "+order.addressDetail);text("out-memo",order.memo||"없음");
 document.getElementById("print").addEventListener("click",()=>window.print());
 document.getElementById("reset").addEventListener("click",()=>{try{sessionStorage.removeItem(KEY);location.href="index.html";}catch(e){window.alert("정보를 지우지 못했습니다. 이 브라우저 탭을 닫아 주세요.");}});
}
updateTotal();

import { card } from './card.js';
import { like } from './like.js';
import { util } from '../../common/util.js';
import { pagination } from './pagination.js';
import { dto } from '../../connection/dto.js';
import { lang } from '../../common/language.js';
import { storage } from '../../common/storage.js';
import { session } from '../../common/session.js';
import { request, HTTP_GET, HTTP_POST, HTTP_DELETE, HTTP_PUT, HTTP_STATUS_CREATED } from '../../connection/request.js';

export const comment = (() => {
    let owns = null;
    let showHide = null;
    let comments = null;
    const lastRender = [];

    const onNullComment = ()=>`<div class="text-center p-4 bg-theme-auto rounded-4 shadow">
        <p class="fw-bold p-0 m-0" style="font-size: 15.2px;">📢 Yuk, share undangan ini biar makin rame komentarnya! 🎉</p>
    </div>`;

    const traverse=(items,hide=[])=>{
        const dataShow = showHide.get('show');
        const buildHide = lists=>lists.forEach(i=>{
            if(hide.find(h=>h.uuid===i.uuid)){ buildHide(i.comments); return; }
            hide.push({uuid:i.uuid,show:false}); buildHide(i.comments);
        });
        const setVisible = lists=>lists.forEach(i=>{
            if(!dataShow.includes(i.uuid)){ setVisible(i.comments); return; }
            i.comments.forEach(c=>{ const idx=hide.findIndex(h=>h.uuid===c.uuid); if(idx!==-1) hide[idx].show=true; });
            setVisible(i.comments);
        });
        buildHide(items); setVisible(items);
        return hide;
    };

const renderCommentHTML = (data) => {

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date.replace(' ', 'T') + '+07:00')) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";

        return "just now";
    };

    const renderSingle = (c, isReply = false) => {
    const hasReply = c.comments && c.comments.length > 0;
        const adminBadge = c.is_admin === 1
            ? `<span class="badge bg-primary ms-2">Admin</span>`
            : '';

       const presenceIcon = !isReply
    ? (c.presence === '1' ? '✅' : '❌')
    : '';

        const replies = c.comments && c.comments.length
            ? c.comments.map(r => renderSingle(r, true)).join('')
            : '';

        return `
<div class="comment-card shadow p-3 mx-0 ${isReply ? 'mt-3 ms-4' : 'mt-2'} mb-3" id="${c.uuid}">

<div class="comment-header">

<div class="comment-left">
<strong class="comment-name">${c.name}</strong>
${adminBadge}
<span class="presence">${presenceIcon}</span>
</div>

<small class="comment-time">
${timeAgo(c.created_at)}
</small>

</div>

<hr class="my-2 comment-divider">

<p dir="auto"
class="text-theme-auto text-start my-2 w-100 comment-text"
style="white-space: pre-wrap !important; font-size: 15.2px;"
id="content-${c.uuid}">
${c.comment}
</p>

${!isReply ? `
<div class="d-flex justify-content-between align-items-center mt-3">

<div>
${!hasReply ? `
<button 
id="button-${c.uuid}"
style="font-size: 12.8px;" 
onclick="undangan.comment.reply('${c.uuid}')"
class="btn btn-sm comment-btn py-0 me-1 shadow-sm">
Reply
</button>
` : ``}
</div>

<button 
style="font-size: 12.8px;"
onclick="undangan.comment.like.love(this)" 
data-uuid="${c.uuid}"
class="btn btn-sm comment-like ms-auto rounded-3 px-2 py-1 shadow-sm btn-like d-inline-flex align-items-center">

<span class="my-0 mx-1">${c.likes || 0}</span>
<i class="me-1 fa-regular fa-heart"></i>

</button>

</div>
` : ``}

<div id="reply-form-${c.uuid}"></div>

<div id="reply-content-${c.uuid}">
${replies}
</div>

</div>
`;
    };

    return data.map(c => renderSingle(c)).join('');
};

    const showOrHide=(button)=>{
        const ids=button.getAttribute('data-uuids').split(',');
        const isShow=button.getAttribute('data-show')==='true';
        const uuid=button.getAttribute('data-uuid');
        const currentShow=showHide.get('show');
        button.setAttribute('data-show',isShow?'false':'true');
        button.innerText=isShow?`Show replies (${ids.length})`:'Hide replies';
        showHide.set('show',isShow?currentShow.filter(i=>i!==uuid):[...currentShow,uuid]);
        for(const id of ids){
            document.getElementById(`comments-${uuid}`)?.classList.toggle('d-none',isShow);
        }
    };

const show = async () => {

    const container = document.getElementById('comments');
    if (!container) return;

    container.innerHTML = 'Loading...';

    try {

        const res = await fetch('/list_comments.php');
        const data = await res.json();

        if (!data.status) {
            container.innerHTML = 'Gagal memuat komentar';
            return;
        }

        const allComments = data.data || [];
        const per = pagination.getPer();

        if (allComments.length === 0) {
            container.innerHTML = `
               <div class="text-center py-4" style="color:#7a7a7a;">
                <div style="font-size:20px; margin-bottom:6px;">💌</div>
                No wishes yet. Be the first to send your wishes!
                </div>
            `;
            pagination.setTotal(0);
            return;
        }

        if (allComments.length <= per) {

            container.innerHTML = renderCommentHTML(allComments);

        } else {

            const start = pagination.getNext();
            const paginated = allComments.slice(start, start + per);

            container.innerHTML = renderCommentHTML(paginated);
        }

        pagination.setTotal(allComments.length);

    } catch (e) {
        console.error(e);
        container.innerHTML = 'Terjadi error';
    }
};

   const send = async (button) => {

    const name = document.getElementById('form-name').value.trim();
    const presence = document.getElementById('form-presence').value;
    const commentText = document.getElementById('form-comment').value.trim();

    if(!name){ alert('Name cannot be empty'); return; }
    if(presence==='0'){ alert('Please select attendance'); return; }
    if(!commentText){ alert('Comment cannot be empty'); return; }

    const formData = new FormData();
    formData.append('name',name);
    formData.append('presence',presence);
    formData.append('comment',commentText);

    const res = await fetch('/submit_comment.php',{method:'POST',body:formData});
    const result = await res.json();

    if(result.status){

        // reset form
        document.getElementById('form-name').value='';
        document.getElementById('form-presence').value='0';
        document.getElementById('form-comment').value='';

        // reload komentar supaya format sama
        show();

    }else{
        alert(result.message);
    }
};

const reply = (uuid) => {

if (document.getElementById(`inner-${uuid}`)) return;

document.getElementById(`reply-form-${uuid}`).innerHTML = `

<div id="inner-${uuid}" class="reply-box mt-3">

<div class="reply-input-wrapper">
<textarea
id="form-inner-comment-${uuid}"
placeholder="Type reply comment"
class="reply-textarea"></textarea>
</div>

<div class="reply-actions">
<button
class="btn-cancel"
onclick="document.getElementById('inner-${uuid}').remove()">
Cancel
</button>

<button
class="btn-send"
onclick="undangan.comment.sendReply('${uuid}')">
Send
</button>
</div>

</div>
`;
};

const sendReply = async (uuid) => {

const commentText = document.getElementById(`form-inner-comment-${uuid}`).value.trim();

if (!commentText) {
    alert('Reply cannot be empty');
    return;
}

const formData = new FormData();
formData.append('presence','1');
formData.append('comment',commentText);
formData.append('parent_id',uuid);

const res = await fetch('/submit_comment.php',{method:'POST',body:formData});
const result = await res.json();

if(result.status){

const html = `
<div class="comment-card shadow p-3 mt-3 ms-4" id="${result.data.uuid}">

<div class="comment-header">

<div class="comment-left">
<strong class="comment-name">${result.data.name}</strong>
</div>

<small class="comment-time">
just now
</small>

</div>

<hr class="my-2 comment-divider">

<p class="comment-text">
${result.data.comment}
</p>

</div>
`;

    document.getElementById(`reply-content-${uuid}`)
        .insertAdjacentHTML('beforeend',html);
    const btn = document.getElementById(`button-${uuid}`);
    if (btn) btn.remove();

    document.getElementById(`inner-${uuid}`).remove();

}else{
if(result.message === 'login_required'){
    document.getElementById('login-popup').style.display='flex';
    return;
}

alert(result.message);
}
};
const showReplies = (uuid) => {

    const container = document.getElementById(`reply-content-${uuid}`);
    const toggle = document.getElementById(`toggle-${uuid}`);

    if (!container) return;

    if (container.style.display === "none" || container.style.display === "") {

        container.style.display = "block";
        toggle.innerText = "Hide replies";

    } else {

        container.style.display = "none";
        toggle.innerText = `Show replies (${container.children.length})`;

    }

};
    const remove=async(button)=>{
        if(!confirm('Are you sure?')) return;
        const id=button.getAttribute('data-uuid');
        const formData=new FormData(); formData.append('uuid',id);
        const res=await fetch('/delete_comment.php',{method:'POST',body:formData});
        const result=await res.json();
        if(result.status){ const el=document.getElementById(id); if(el) el.remove(); }
        else alert('Failed to delete comment');
    };

    const update=async(button)=>{
        const id=button.getAttribute('data-uuid');
        const form=document.getElementById(`form-inner-${id}`);
        const commentValue=form.value.trim();
        const presence=form.getAttribute('data-presence');
        const formData=new FormData();
        formData.append('uuid',id); formData.append('comment',commentValue); formData.append('presence',presence);
        const res=await fetch('/update_comment.php',{method:'POST',body:formData});
        const result=await res.json();
        if(result.status){ document.getElementById(`content-${id}`).innerText=commentValue; removeInnerForm(id); }
        else alert('Failed to update');
    };

    const removeInnerForm=(id)=>{ const el=document.getElementById(`inner-${id}`); if(el) el.remove(); };

    const init = () => {

    owns = storage('owns');
    showHide = storage('comment');

    comments = document.getElementById('comments');

    pagination.init();
    pagination.setPer(5); 
    document.getElementById('pagination').style.display = "none";
    comments.addEventListener('undangan.comment.show', show);

    show();
};

    return { init, send, reply, sendReply, remove, update, showOrHide, show, showReplies, pagination };
})();
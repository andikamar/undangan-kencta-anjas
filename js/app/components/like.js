import { dto } from '../../connection/dto.js';
import { storage } from '../../common/storage.js';
import { session } from '../../common/session.js';
import { tapTapAnimation } from '../../libs/confetti.js';
import { request, HTTP_PATCH, HTTP_POST, HTTP_STATUS_CREATED } from '../../connection/request.js';

export const like = (() => {

    let likes = null;

    const love = async (button) => {

        const info = button.firstElementChild;
        const heart = button.lastElementChild;

        const id = button.getAttribute('data-uuid');
        const count = parseInt(info.getAttribute('data-count-like'));

        button.disabled = true;

        if (navigator.vibrate) {
            navigator.vibrate(100);
        }

        try {

            const formData = new FormData();
            formData.append("comment_id", id);

            const res = await fetch("/like_comment.php", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (data.status) {

                if (data.action === "like") {

                    heart.classList.remove('fa-regular');
                    heart.classList.add('fa-solid', 'text-danger');

                } else {

                    heart.classList.remove('fa-solid', 'text-danger');
                    heart.classList.add('fa-regular');

                }

                info.setAttribute('data-count-like', String(data.likes));
                info.innerText = data.likes;
            }

        } catch (err) {
            console.error(err);
        }

        button.disabled = false;
    };

    const init = () => {
        likes = new Map();
    };

    return {
        init,
        love
    };

})();
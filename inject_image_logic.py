import re

with open('community.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add globals for image
var_insertion = """    const contentInput = document.getElementById('postContent');

    // 새 이미지 업로드 관련
    const postImage = document.getElementById('postImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeImageBtn = document.getElementById('removeImageBtn');
    let currentBase64Image = null;

    if (postImage) {
        postImage.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    let width = img.width;
                    let height = img.height;
                    const maxWidth = 800;
                    
                    if (width > maxWidth) {
                        height = Math.round(height * (maxWidth / width));
                        width = maxWidth;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    currentBase64Image = canvas.toDataURL('image/jpeg', 0.6); // Compress to 60% quality
                    
                    previewImg.src = currentBase64Image;
                    imagePreview.style.display = 'block';
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            postImage.value = '';
            currentBase64Image = null;
            imagePreview.style.display = 'none';
        });
    }
"""
content = content.replace("    const contentInput = document.getElementById('postContent');", var_insertion)


# 2. Update submit logic to include image and clear it
submit_start = """        const newPost = {
            id: Date.now(),
            title: title,
            author: author,
            date: dateString,
            content: content
        };"""
submit_replace = """        const newPost = {
            id: Date.now(),
            title: title,
            author: author,
            date: dateString,
            content: content,
            image: currentBase64Image
        };"""
content = content.replace(submit_start, submit_replace)

reset_logic = """        // Reset and hide form
        titleInput.value = '';
        authorInput.value = '';
        contentInput.value = '';
        writeSection.classList.add('hidden');"""
reset_replace = """        // Reset and hide form
        titleInput.value = '';
        authorInput.value = '';
        contentInput.value = '';
        if(postImage) postImage.value = '';
        currentBase64Image = null;
        if(imagePreview) imagePreview.style.display = 'none';
        writeSection.classList.add('hidden');"""
content = content.replace(reset_logic, reset_replace)

cancel_logic = """    cancelBtn.addEventListener('click', () => {
        writeSection.classList.add('hidden');
        titleInput.value = '';
        authorInput.value = '';
        contentInput.value = '';
    });"""
cancel_replace = """    cancelBtn.addEventListener('click', () => {
        writeSection.classList.add('hidden');
        titleInput.value = '';
        authorInput.value = '';
        contentInput.value = '';
        if(postImage) postImage.value = '';
        currentBase64Image = null;
        if(imagePreview) imagePreview.style.display = 'none';
    });"""
content = content.replace(cancel_logic, cancel_replace)


# 3. Render icon if image exists
render_start = """            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${post.id.toString().startsWith('auto') ? '공지' : posts.length - idx}</td>
                <td class="title-col"><a href="#" class="post-link" data-id="${post.id}">${post.title}</a></td>
                <td>${post.author}</td>
                <td>${post.date}</td>
            `;"""
render_replace = """            const tr = document.createElement('tr');
            let titleHtml = post.title;
            if (post.image) {
                titleHtml += ` <span style="font-size:0.8rem;" title="사진 첨부됨">📷</span>`;
            }
            tr.innerHTML = `
                <td>${post.id.toString().startsWith('auto') ? '공지' : posts.length - idx}</td>
                <td class="title-col"><a href="#" class="post-link" data-id="${post.id}">${titleHtml}</a></td>
                <td>${post.author}</td>
                <td>${post.date}</td>
            `;"""
content = content.replace(render_start, render_replace)

# 4. Show image in Modal
modal_start = """            modalTitle.textContent = post.title;
            modalAuthor.textContent = post.author;
            modalDate.textContent = post.date;
            
            // Convert newlines to <br>
            modalBody.innerHTML = post.content.replace(/\\n/g, '<br>');
"""
modal_replace = """            modalTitle.textContent = post.title;
            modalAuthor.textContent = post.author;
            modalDate.textContent = post.date;
            
            // Convert newlines to <br>
            let contentHtml = post.content.replace(/\\n/g, '<br>');
            if (post.image) {
                contentHtml += `<div style="margin-top: 20px;"><img src="${post.image}" style="max-width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"></div>`;
            }
            modalBody.innerHTML = contentHtml;
"""
content = content.replace(modal_start, modal_replace)

with open('community.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("community.js updated successfully.")

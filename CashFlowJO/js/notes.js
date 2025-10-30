const Notes = (function() {
    
    async function render() {
        const courseFilter = document.getElementById('notes-course-filter')?.value;
        const searchQuery = document.getElementById('notes-search-input')?.value;

        const filters = {};
        if (courseFilter) filters.courseId = courseFilter;
        if (searchQuery) filters.search = searchQuery;

        const notes = await DB.getNotes(filters);
        const courses = await DB.getCourses();
        const courseMap = new Map(courses.map(c => [c.id, c]));

        const container = document.getElementById('notes-container');
        if (!container) return;

        if (notes.length === 0) {
            container.innerHTML = '<p class="empty-state">No notes yet. Click "New Note" to create your first note! 📝</p>';
            return;
        }

        container.innerHTML = notes.map(note => {
            const course = courseMap.get(note.courseId);
            const categoryIcons = {
                lecture: '📚',
                study: '✍️',
                summary: '📋',
                reference: '📖',
                other: '📄'
            };

            return `
                <div class="note-card" data-note-id="${note.id}">
                    <div class="note-header">
                        <span class="note-icon">${categoryIcons[note.category] || '📄'}</span>
                        <h3 class="note-title">${note.title}</h3>
                    </div>
                    ${course ? `<span class="course-badge" style="background:${course.color}20;color:${course.color}">${course.name}</span>` : ''}
                    <div class="note-category">${note.category}</div>
                    ${note.content ? `<div class="note-preview">${note.content.substring(0, 150)}${note.content.length > 150 ? '...' : ''}</div>` : ''}
                    ${note.tags && note.tags.length > 0 ? `
                        <div class="note-tags">
                            ${note.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    ${note.attachments && note.attachments.length > 0 ? `
                        <div class="file-thumbnails">
                            ${note.attachments.map(file => `
                                <span class="file-thumbnail" title="${file.name}">${Utils.getFileIcon(file.name)}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div class="note-footer">
                        <span class="note-date">${new Date(note.createdAt).toLocaleDateString()}</span>
                        <div class="note-actions">
                            <button class="card-btn view-note-btn" data-id="${note.id}">View</button>
                            <button class="card-btn edit-note-btn" data-id="${note.id}">Edit</button>
                            <button class="card-btn delete-note-btn" data-id="${note.id}">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        addNoteStyles();

        container.querySelectorAll('.view-note-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const note = await DB.getNote(btn.getAttribute('data-id'));
                viewNote(note);
            });
        });

        container.querySelectorAll('.edit-note-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const note = await DB.getNote(btn.getAttribute('data-id'));
                UI.editNote(note);
            });
        });

        container.querySelectorAll('.delete-note-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Delete this note?')) {
                    await DB.deleteNote(btn.getAttribute('data-id'));
                    Animations.createToast('Note deleted', 'info');
                    render();
                }
            });
        });

        await populateNoteCourseFilter();
    }

    function viewNote(note) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'view-note-modal';
        
        const course = DB.getCourse(note.courseId);
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${note.title}</h3>
                    <button class="close-btn" aria-label="Close">&times;</button>
                </div>
                <div class="note-view-content">
                    ${note.content ? `<div class="note-full-content">${note.content.replace(/\n/g, '<br>')}</div>` : ''}
                    ${note.attachments && note.attachments.length > 0 ? `
                        <div class="note-attachments">
                            <h4>Attachments</h4>
                            ${note.attachments.map(file => `
                                <div class="attachment-item">
                                    <span>${Utils.getFileIcon(file.name)}</span>
                                    <span>${file.name}</span>
                                    <span class="file-size">${Utils.formatFileSize(file.size)}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.getElementById('modal-overlay').classList.add('active');
        document.body.appendChild(modal);

        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
            document.getElementById('modal-overlay').classList.remove('active');
        });
    }

    async function populateNoteCourseFilter() {
        const courses = await DB.getCourses();
        const select = document.getElementById('notes-course-filter');
        
        if (!select) return;

        const currentValue = select.value;
        select.innerHTML = '<option value="">All Courses</option>';
        
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.name;
            select.appendChild(option);
        });

        if (currentValue) {
            select.value = currentValue;
        }
    }

    function addNoteStyles() {
        if (document.getElementById('notes-custom-styles')) return;

        const style = document.createElement('style');
        style.id = 'notes-custom-styles';
        style.textContent = `
            .notes-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                gap: 1.5rem;
            }
            .note-card {
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 1.25rem;
                transition: all 0.3s ease;
                animation: fadeIn 0.4s ease-out backwards;
            }
            .note-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 16px var(--shadow);
            }
            .note-header {
                display: flex;
                align-items: flex-start;
                gap: 0.75rem;
                margin-bottom: 0.75rem;
            }
            .note-icon {
                font-size: 1.5rem;
            }
            .note-title {
                font-size: 1.1rem;
                font-weight: 600;
                flex: 1;
            }
            .note-category {
                display: inline-block;
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-size: 0.85rem;
                background: var(--surface-hover);
                color: var(--text-muted);
                margin-bottom: 0.75rem;
                text-transform: capitalize;
            }
            .note-preview {
                color: var(--text-muted);
                line-height: 1.6;
                margin: 0.75rem 0;
            }
            .note-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin: 0.75rem 0;
            }
            .tag {
                padding: 0.25rem 0.5rem;
                background: var(--primary);
                color: white;
                border-radius: 4px;
                font-size: 0.8rem;
            }
            .note-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 1rem;
                padding-top: 0.75rem;
                border-top: 1px solid var(--border);
            }
            .note-date {
                font-size: 0.85rem;
                color: var(--text-muted);
            }
            .note-actions {
                display: flex;
                gap: 0.5rem;
            }
            .note-view-content {
                padding: 1rem 0;
            }
            .note-full-content {
                line-height: 1.8;
                margin-bottom: 1.5rem;
            }
            .note-attachments h4 {
                margin-bottom: 0.75rem;
            }
            .attachment-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
                background: var(--surface);
                border-radius: var(--radius);
                margin-bottom: 0.5rem;
            }
        `;
        document.head.appendChild(style);
    }

    return {
        render,
        populateNoteCourseFilter,
        viewNote
    };
})();

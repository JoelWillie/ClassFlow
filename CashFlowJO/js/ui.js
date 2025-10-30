const UI = (function() {
    let currentView = 'dashboard';
    let currentFiles = [];
    let currentNoteFiles = [];
    let editingAssignment = null;
    let editingCourse = null;
    let editingNote = null;

    function init() {
        initNavigation();
        initModals();
        initAssignmentForm();
        initCourseForm();
        initNoteForm();
        initTimetableForm();
        initGradeForm();
        initAttendanceTracker();
        initSettings();
        initFileUpload();
        initNoteFileUpload();

        const notesSearchInput = document.getElementById('notes-search-input');
        if (notesSearchInput) {
            notesSearchInput.addEventListener('input', Utils.debounce(() => {
                if (currentView === 'notes') {
                    Notes.render();
                }
            }, 300));
        }

        const notesCourseFilter = document.getElementById('notes-course-filter');
        if (notesCourseFilter) {
            notesCourseFilter.addEventListener('change', () => {
                if (currentView === 'notes') {
                    Notes.render();
                }
            });
        }
    }

    function initNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                switchView(view);
            });
        });

        // Mobile nav toggle (shows/hides the stacked nav on small screens)
        const mobileToggle = document.getElementById('mobile-nav-toggle');
        mobileToggle?.addEventListener('click', () => {
            const header = document.querySelector('.header');
            if (!header) return;
            const expanded = header.classList.toggle('nav-open');
            mobileToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        });

        // Close mobile nav when a nav item is clicked (small screens)
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const header = document.querySelector('.header');
                if (!header) return;
                if (header.classList.contains('nav-open')) {
                    header.classList.remove('nav-open');
                    const toggle = document.getElementById('mobile-nav-toggle');
                    if (toggle) toggle.setAttribute('aria-expanded', 'false');
                }
            });
        });

        document.getElementById('theme-btn')?.addEventListener('click', () => {
            openModal('theme-modal');
        });

        document.getElementById('user-menu-btn')?.addEventListener('click', async () => {
            const user = await Auth.getCurrentUser();
            const nameEl = document.getElementById('user-info-name');
            const emailEl = document.getElementById('user-info-email');
            
            if (nameEl) nameEl.textContent = user.displayName;
            if (emailEl) emailEl.textContent = user.email || 'Guest (no email)';
            
            const guestSection = document.getElementById('guest-convert-section');
            if (guestSection) {
                guestSection.style.display = user.isGuest ? 'block' : 'none';
            }

            const isAdminUser = await Auth.isAdmin();
            const adminPanel = document.getElementById('admin-panel');
            const adminBadge = document.getElementById('admin-badge');
            
            if (adminPanel) adminPanel.style.display = isAdminUser ? 'block' : 'none';
            if (adminBadge) adminBadge.style.display = isAdminUser ? 'inline-block' : 'none';
            
            openModal('user-menu-modal');
        });

        document.getElementById('view-all-users-btn')?.addEventListener('click', async () => {
            const users = await Auth.getAllUsers();
            Animations.createToast(`Total users: ${users.length}`, 'info');
        });

        document.getElementById('system-stats-btn')?.addEventListener('click', async () => {
            const allAssignments = [];
            await localforage.createInstance({ name: 'ClassFlow', storeName: 'assignments' }).iterate((value) => {
                allAssignments.push(value);
            });
            Animations.createToast(`Total assignments in system: ${allAssignments.length}`, 'info');
        });

        document.getElementById('convert-guest-btn')?.addEventListener('click', () => {
            closeModal('user-menu-modal');
            openModal('convert-guest-modal');
        });

        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            if (confirm('Are you sure you want to logout?')) {
                await Auth.logout();
            }
        });

        const convertForm = document.getElementById('convert-guest-form');
        convertForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('convert-name').value;
            const email = document.getElementById('convert-email').value;
            const password = document.getElementById('convert-password').value;
            const confirm = document.getElementById('convert-confirm').value;

            if (password !== confirm) {
                Animations.createToast('Passwords do not match', 'error');
                return;
            }

            try {
                await Auth.convertGuestToAccount(email, password, name);
                Animations.createToast('Account created! All data saved.', 'success');
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                Animations.createToast(error.message, 'error');
            }
        });

        document.getElementById('add-assignment-btn')?.addEventListener('click', () => {
            newAssignment();
        });

        document.getElementById('add-course-btn')?.addEventListener('click', () => {
            newCourse();
        });

        document.getElementById('add-note-btn')?.addEventListener('click', () => {
            newNote();
        });

        document.getElementById('add-timetable-entry-btn')?.addEventListener('click', () => {
            newTimetableEntry();
        });

        document.getElementById('attendance-tracker-btn')?.addEventListener('click', () => {
            openModal('attendance-modal');
        });

        document.getElementById('export-ics-btn')?.addEventListener('click', async () => {
            const assignments = await DB.getAssignments();
            const courses = await DB.getCourses();
            Utils.exportToICS(assignments, courses);
        });
    }

    function switchView(viewName) {
        currentView = viewName;
        
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        document.getElementById(`${viewName}-view`)?.classList.add('active');
        document.querySelector(`[data-view="${viewName}"]`)?.classList.add('active');

        if (viewName === 'dashboard') {
            renderDashboard();
        } else if (viewName === 'timetable') {
            
        } else if (viewName === 'notes') {
            Notes.render();
        } else if (viewName === 'calendar') {
            Calendar.render();
        } else if (viewName === 'kanban') {
            renderKanban();
        } else if (viewName === 'courses') {
            renderCourses();
        } else if (viewName === 'analytics') {
            renderAnalytics();
        }
    }

    function initModals() {
        const overlay = document.getElementById('modal-overlay');
        const closeButtons = document.querySelectorAll('.close-btn, .cancel-btn');

        overlay?.addEventListener('click', closeAllModals);

        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                if (modal) {
                    closeModal(modal.id);
                }
            });
        });
    }

    function openModal(modalId) {
        document.getElementById('modal-overlay')?.classList.add('active');
        document.getElementById(modalId)?.classList.add('active');
    }

    function closeModal(modalId) {
        document.getElementById(modalId)?.classList.remove('active');
        
        const anyModalOpen = document.querySelector('.modal.active');
        if (!anyModalOpen) {
            document.getElementById('modal-overlay')?.classList.remove('active');
        }
    }

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.getElementById('modal-overlay')?.classList.remove('active');
    }

    function initAssignmentForm() {
        const form = document.getElementById('assignment-form');
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveAssignment();
        });
    }

    function newAssignment() {
        editingAssignment = null;
        currentFiles = [];
        document.getElementById('modal-title').textContent = 'New Assignment';
        document.getElementById('assignment-form').reset();
        document.getElementById('assignment-id').value = '';
        document.getElementById('file-list').innerHTML = '';
        populateCourseSelect();
        openModal('assignment-modal');
    }

    async function editAssignment(assignment) {
        editingAssignment = assignment;
        currentFiles = assignment.attachments || [];
        
        document.getElementById('modal-title').textContent = 'Edit Assignment';
        document.getElementById('assignment-id').value = assignment.id;
        document.getElementById('assignment-title').value = assignment.title;
        document.getElementById('assignment-course').value = assignment.courseId;
        
        const dueDate = new Date(assignment.dueDate);
        document.getElementById('assignment-due-date').value = dueDate.toISOString().split('T')[0];
        document.getElementById('assignment-due-time').value = dueDate.toTimeString().substring(0, 5);
        
        document.getElementById('assignment-status').value = assignment.status;
        document.getElementById('assignment-priority').value = assignment.priority;
        document.getElementById('assignment-notes').value = assignment.notes || '';
        document.getElementById('assignment-requirements').value = (assignment.requirements || []).join('\n');
        document.getElementById('assignment-tags').value = (assignment.tags || []).join(', ');

        await populateCourseSelect();
        renderFileList();
        openModal('assignment-modal');
    }

    async function saveAssignment() {
        const id = document.getElementById('assignment-id').value;
        const title = document.getElementById('assignment-title').value;
        const courseId = document.getElementById('assignment-course').value;
        const dueDate = document.getElementById('assignment-due-date').value;
        const dueTime = document.getElementById('assignment-due-time').value;
        const status = document.getElementById('assignment-status').value;
        const priority = document.getElementById('assignment-priority').value;
        const notes = document.getElementById('assignment-notes').value;
        const requirements = document.getElementById('assignment-requirements').value
            .split('\n')
            .filter(r => r.trim())
            .map(r => r.trim());
        const tags = document.getElementById('assignment-tags').value
            .split(',')
            .filter(t => t.trim())
            .map(t => t.trim());

        const dueDateTimeString = `${dueDate}T${dueTime}:00`;

        const assignmentData = {
            title,
            courseId,
            dueDate: new Date(dueDateTimeString).toISOString(),
            status,
            priority,
            notes,
            requirements,
            tags,
            attachments: currentFiles
        };

        try {
            if (id) {
                await DB.updateAssignment(id, assignmentData);
                Animations.createToast('Assignment updated successfully!', 'success');
            } else {
                await DB.addAssignment(assignmentData);
                Animations.createToast('Assignment created successfully!', 'success');
            }

            closeModal('assignment-modal');
            renderDashboard();
            
            if (currentView === 'kanban') {
                renderKanban();
            }
        } catch (error) {
            console.error('Error saving assignment:', error);
            Animations.createToast('Failed to save assignment', 'error');
        }
    }

    async function deleteAssignment(id) {
        if (confirm('Are you sure you want to delete this assignment?')) {
            const card = document.querySelector(`[data-id="${id}"]`);
            if (card) {
                Animations.fadeOutAndRemove(card, async () => {
                    await DB.deleteAssignment(id);
                    Animations.createToast('Assignment deleted', 'info');
                    renderDashboard();
                    if (currentView === 'kanban') {
                        renderKanban();
                    }
                });
            } else {
                await DB.deleteAssignment(id);
                renderDashboard();
                if (currentView === 'kanban') {
                    renderKanban();
                }
            }
        }
    }

    async function markComplete(id) {
        const card = document.querySelector(`[data-id="${id}"]`);
        if (card) {
            Animations.celebrateCompletion(card);
        }
        
        await DB.updateAssignment(id, { status: 'completed' });
        
        Animations.createToast('Assignment marked complete! 🎉', 'success');
        
        setTimeout(() => {
            renderDashboard();
            if (currentView === 'kanban') {
                renderKanban();
            }
        }, 300);
    }

    function initCourseForm() {
        const form = document.getElementById('course-form');
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveCourse();
        });
    }

    function newCourse() {
        editingCourse = null;
        document.getElementById('course-form').reset();
        document.getElementById('course-id').value = '';
        openModal('course-modal');
    }

    async function saveCourse() {
        const id = document.getElementById('course-id').value;
        const name = document.getElementById('course-name').value;
        const code = document.getElementById('course-code').value;
        const instructor = document.getElementById('course-instructor').value;
        const semester = document.getElementById('course-semester').value;
        const color = document.getElementById('course-color').value;

        const courseData = { name, code, instructor, semester, color };

        try {
            if (id) {
                await DB.updateCourse(id, courseData);
                Animations.createToast('Course updated!', 'success');
            } else {
                await DB.addCourse(courseData);
                Animations.createToast('Course created!', 'success');
            }

            closeModal('course-modal');
            renderCourses();
        } catch (error) {
            console.error('Error saving course:', error);
            Animations.createToast('Failed to save course', 'error');
        }
    }

    async function deleteCourse(id) {
        const assignments = await DB.getAssignments({ courseId: id });
        if (assignments.length > 0) {
            if (!confirm(`This course has ${assignments.length} assignments. Delete anyway?`)) {
                return;
            }
        }
        
        if (confirm('Are you sure you want to delete this course?')) {
            await DB.deleteCourse(id);
            Animations.createToast('Course deleted', 'info');
            renderCourses();
        }
    }

    async function populateCourseSelect() {
        const courses = await DB.getCourses();
        const selects = [
            document.getElementById('assignment-course'),
            document.getElementById('course-filter')
        ];

        selects.forEach(select => {
            if (!select) return;
            
            const currentValue = select.value;
            const isFilter = select.id === 'course-filter';
            
            select.innerHTML = isFilter ? '<option value="">All Courses</option>' : '<option value="">Select a course</option>';
            
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.name;
                select.appendChild(option);
            });

            if (currentValue) {
                select.value = currentValue;
            }
        });
    }

    function initFileUpload() {
        const dropZone = document.getElementById('file-drop-zone');
        const fileInput = document.getElementById('file-input');

        dropZone?.addEventListener('click', () => fileInput?.click());

        dropZone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone?.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone?.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files);
            await handleFiles(files);
        });

        fileInput?.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            await handleFiles(files);
        });
    }

    async function handleFiles(files) {
        for (const file of files) {
            const fileData = await DB.saveFile(file, {
                name: file.name,
                type: file.type,
                size: file.size
            });
            currentFiles.push(fileData);
        }
        renderFileList();
    }

    function renderFileList() {
        const fileList = document.getElementById('file-list');
        if (!fileList) return;

        fileList.innerHTML = currentFiles.map((file, index) => `
            <div class="file-item">
                <span class="file-icon">${Utils.getFileIcon(file.name)}</span>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${Utils.formatFileSize(file.size)}</div>
                </div>
                <button type="button" class="file-remove" data-index="${index}">&times;</button>
            </div>
        `).join('');

        fileList.querySelectorAll('.file-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                currentFiles.splice(index, 1);
                renderFileList();
            });
        });
    }

    async function renderDashboard() {
        const courseFilter = document.getElementById('course-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        const searchQuery = document.getElementById('search-input').value;

        const filters = {};
        if (courseFilter) filters.courseId = courseFilter;
        if (statusFilter) filters.status = statusFilter;
        if (searchQuery) filters.search = searchQuery;

        const assignments = await DB.getAssignments(filters);
        const courses = await DB.getCourses();
        const courseMap = new Map(courses.map(c => [c.id, c]));

        const upcoming = assignments.filter(a => a.status !== 'completed').length;
        const overdue = assignments.filter(a => Utils.isOverdue(a.dueDate, a.status)).length;
        const completed = assignments.filter(a => a.status === 'completed').length;
        const total = assignments.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        document.getElementById('upcoming-count').textContent = upcoming;
        document.getElementById('overdue-count').textContent = overdue;
        document.getElementById('completed-count').textContent = completed;
        document.getElementById('progress-percent').textContent = `${progress}%`;

        const overdueBanner = document.getElementById('overdue-banner');
        if (overdueBanner) {
            if (overdue > 0) {
                overdueBanner.removeAttribute('hidden');
            } else {
                overdueBanner.setAttribute('hidden', '');
            }
        }

        const container = document.getElementById('assignments-container');
        if (!container) return;

        if (assignments.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:3rem;">No assignments found. Click "New Assignment" to get started!</p>';
            return;
        }

        container.innerHTML = assignments.map(assignment => {
            const course = courseMap.get(assignment.courseId);
            const isOverdue = Utils.isOverdue(assignment.dueDate, assignment.status);

            return `
                <div class="assignment-card ${isOverdue ? 'overdue' : ''} ${assignment.status === 'completed' ? 'completed' : ''}" data-id="${assignment.id}">
                    <div class="card-header">
                        <h3 class="card-title">${assignment.title}</h3>
                    </div>
                    ${course ? `<span class="course-badge" style="background:${course.color}20;color:${course.color}">${course.name}</span>` : ''}
                    <div class="card-due ${isOverdue ? 'overdue' : ''}">${Utils.formatDate(assignment.dueDate)}</div>
                    <span class="card-status status-${assignment.status}">${assignment.status.replace('_', ' ')}</span>
                    ${assignment.attachments && assignment.attachments.length > 0 ? `
                        <div class="file-thumbnails">
                            ${assignment.attachments.map(file => `
                                <span class="file-thumbnail" title="${file.name}">${Utils.getFileIcon(file.name)}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div class="card-actions">
                        ${assignment.status !== 'completed' ? `
                            <button class="card-btn mark-complete-btn" data-id="${assignment.id}">✓ Mark Complete</button>
                        ` : ''}
                        <button class="card-btn edit-btn" data-id="${assignment.id}">Edit</button>
                        <button class="card-btn delete-btn" data-id="${assignment.id}">Delete</button>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.mark-complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                markComplete(btn.getAttribute('data-id'));
            });
        });

        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const assignment = await DB.getAssignment(btn.getAttribute('data-id'));
                editAssignment(assignment);
            });
        });

        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteAssignment(btn.getAttribute('data-id'));
            });
        });

        await populateCourseSelect();
    }

    async function renderKanban() {
        const assignments = await DB.getAssignments();
        const courses = await DB.getCourses();
        const courseMap = new Map(courses.map(c => [c.id, c]));

        ['todo', 'in_progress', 'completed'].forEach(status => {
            const container = document.querySelector(`.kanban-cards[data-status="${status}"]`);
            if (!container) return;

            const statusAssignments = assignments.filter(a => a.status === status);

            container.innerHTML = statusAssignments.map(assignment => {
                const course = courseMap.get(assignment.courseId);
                const isOverdue = Utils.isOverdue(assignment.dueDate, assignment.status);

                return `
                    <div class="assignment-card ${isOverdue ? 'overdue' : ''}" data-id="${assignment.id}">
                        <h3 class="card-title">${assignment.title}</h3>
                        ${course ? `<span class="course-badge" style="background:${course.color}20;color:${course.color}">${course.name}</span>` : ''}
                        <div class="card-due ${isOverdue ? 'overdue' : ''}">${Utils.formatDate(assignment.dueDate)}</div>
                        <div class="card-actions">
                            <button class="card-btn edit-btn" data-id="${assignment.id}">Edit</button>
                        </div>
                    </div>
                `;
            }).join('');

            container.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const assignment = await DB.getAssignment(btn.getAttribute('data-id'));
                    editAssignment(assignment);
                });
            });
        });
    }

    async function renderCourses() {
        const courses = await DB.getCourses();
        const container = document.getElementById('courses-container');
        if (!container) return;

        if (courses.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:3rem;">No courses yet. Click "New Course" to add one!</p>';
            return;
        }

        const coursesWithStats = await Promise.all(courses.map(async course => {
            const assignments = await DB.getAssignments({ courseId: course.id });
            const attendance = await DB.getAttendanceForCourse(course.id);
            const grades = await DB.getGradesForCourse(course.id);
            
            return { 
                ...course, 
                assignmentCount: assignments.length,
                attendanceCount: attendance.length,
                gradeCount: grades.length
            };
        }));

        container.innerHTML = coursesWithStats.map(course => `
            <div class="course-card" style="border-left-color: ${course.color}">
                <h3 class="course-name">${course.name}</h3>
                ${course.code ? `<div class="course-info">Code: ${course.code}</div>` : ''}
                ${course.instructor ? `<div class="course-info">Instructor: ${course.instructor}</div>` : ''}
                ${course.semester ? `<div class="course-info">Semester: ${course.semester}</div>` : ''}
                <div class="course-info">${course.assignmentCount} assignment${course.assignmentCount !== 1 ? 's' : ''}</div>
                <div class="course-info">${course.attendanceCount} attendance record${course.attendanceCount !== 1 ? 's' : ''}</div>
                <div class="course-info">${course.gradeCount} grade${course.gradeCount !== 1 ? 's' : ''}</div>
                <div class="card-actions" style="margin-top: 1rem;">
                    <button class="card-btn view-grades-btn" data-id="${course.id}">📊 Grades</button>
                    <button class="card-btn delete-course-btn" data-id="${course.id}">Delete</button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.view-grades-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const courseId = btn.getAttribute('data-id');
                await viewGradesForCourse(courseId);
            });
        });

        container.querySelectorAll('.delete-course-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                deleteCourse(btn.getAttribute('data-id'));
            });
        });
    }

    async function viewGradesForCourse(courseId) {
        const course = await DB.getCourse(courseId);
        const grades = await DB.getGradesForCourse(courseId);
        
        document.getElementById('grade-course').value = courseId;
        
        await populateGradeCourseSelect();
        
        renderGrades(courseId);
        openModal('grades-modal');
    }

    async function renderGrades(courseId) {
        const grades = await DB.getGradesForCourse(courseId);
        const summary = document.getElementById('grade-summary');
        
        if (grades.length === 0) {
            summary.innerHTML = '<p style="color:var(--text-muted);text-align:center;">No grades yet. Add your first grade above!</p>';
            return;
        }
        
        let totalWeightedScore = 0;
        let totalWeight = 0;
        
        const gradeItems = grades.map(g => {
            const percent = (g.grade / g.maxGrade) * 100;
            const weighted = percent * g.weight;
            totalWeightedScore += weighted;
            totalWeight += g.weight;
            
            return `
                <div class="grade-item">
                    <div>
                        <strong>${g.assignmentName}</strong>
                        <div style="font-size:0.85rem;color:var(--text-muted);">
                            ${g.grade}/${g.maxGrade} (Weight: ${g.weight}%)
                        </div>
                    </div>
                    <div class="grade-percent">${percent.toFixed(1)}%</div>
                </div>
            `;
        }).join('');
        
        const overallGrade = totalWeight > 0 ? (totalWeightedScore / totalWeight).toFixed(1) : 0;
        
        summary.innerHTML = `
            <h4>Overall Grade: <span class="grade-percent" style="font-size:2rem;">${overallGrade}%</span></h4>
            <div class="grade-list">${gradeItems}</div>
        `;
    }

    async function populateGradeCourseSelect() {
        const courses = await DB.getCourses();
        const select = document.getElementById('grade-course');
        
        if (!select) return;

        const currentValue = select.value;
        select.innerHTML = '<option value="">Select a course</option>';
        
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

    function initGradeForm() {
        const form = document.getElementById('grade-form');
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const courseId = document.getElementById('grade-course').value;
            const assignmentName = document.getElementById('grade-assignment').value;
            const score = document.getElementById('grade-score').value;
            const maxScore = document.getElementById('grade-max').value;
            const weight = document.getElementById('grade-weight').value;
            
            await DB.addGrade(courseId, assignmentName, score, weight, maxScore);
            Animations.createToast('Grade added!', 'success');
            
            document.getElementById('grade-assignment').value = '';
            document.getElementById('grade-score').value = '';
            document.getElementById('grade-max').value = '100';
            document.getElementById('grade-weight').value = '1';
            
            renderGrades(courseId);
        });
    }

    async function initAttendanceTracker() {
        const attendanceCourse = document.getElementById('attendance-course');
        const attendanceDate = document.getElementById('attendance-date');
        
        attendanceDate.value = new Date().toISOString().split('T')[0];
        
        const courses = await DB.getCourses();
        attendanceCourse.innerHTML = '<option value="">Choose a course...</option>';
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.name;
            attendanceCourse.appendChild(option);
        });
        
        document.getElementById('mark-present')?.addEventListener('click', async () => {
            await markAttendance('present');
        });
        
        document.getElementById('mark-absent')?.addEventListener('click', async () => {
            await markAttendance('absent');
        });
        
        document.getElementById('mark-late')?.addEventListener('click', async () => {
            await markAttendance('late');
        });
        
        attendanceCourse.addEventListener('change', updateAttendanceStats);
    }

    async function markAttendance(status) {
        const courseId = document.getElementById('attendance-course').value;
        const date = document.getElementById('attendance-date').value;
        
        if (!courseId || !date) {
            Animations.createToast('Please select course and date', 'warning');
            return;
        }
        
        await DB.recordAttendance(courseId, date, status);
        Animations.createToast(`Marked as ${status}!`, 'success');
        updateAttendanceStats();
    }

    async function updateAttendanceStats() {
        const courseId = document.getElementById('attendance-course').value;
        const statsDiv = document.getElementById('attendance-stats');
        
        if (!courseId) {
            statsDiv.innerHTML = '';
            return;
        }
        
        const records = await DB.getAttendanceForCourse(courseId);
        const present = records.filter(r => r.status === 'present').length;
        const absent = records.filter(r => r.status === 'absent').length;
        const late = records.filter(r => r.status === 'late').length;
        const total = records.length;
        const attendanceRate = total > 0 ? ((present + late) / total * 100).toFixed(1) : 0;
        
        statsDiv.innerHTML = `
            <h4>Attendance Statistics</h4>
            <div class="summary-stats">
                <div class="stat">
                    <div class="stat-value">${attendanceRate}%</div>
                    <div class="stat-label">Attendance Rate</div>
                </div>
                <div class="stat">
                    <div class="stat-value" style="color:#10b981">${present}</div>
                    <div class="stat-label">Present</div>
                </div>
                <div class="stat">
                    <div class="stat-value" style="color:#f59e0b">${late}</div>
                    <div class="stat-label">Late</div>
                </div>
                <div class="stat">
                    <div class="stat-value" style="color:#ef4444">${absent}</div>
                    <div class="stat-label">Absent</div>
                </div>
            </div>
        `;
    }

    async function renderAnalytics() {
        const assignments = await DB.getAssignments();
        const courses = await DB.getCourses();

        const statusCounts = {
            todo: assignments.filter(a => a.status === 'todo').length,
            in_progress: assignments.filter(a => a.status === 'in_progress').length,
            completed: assignments.filter(a => a.status === 'completed').length
        };

        const workloadCanvas = document.getElementById('workload-chart');
        if (workloadCanvas && typeof Chart !== 'undefined') {
            const ctx = workloadCanvas.getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['To Do', 'In Progress', 'Completed'],
                    datasets: [{
                        data: [statusCounts.todo, statusCounts.in_progress, statusCounts.completed],
                        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true
                }
            });
        }

        const courseStats = await Promise.all(courses.map(async course => {
            const courseAssignments = await DB.getAssignments({ courseId: course.id });
            const completed = courseAssignments.filter(a => a.status === 'completed').length;
            const total = courseAssignments.length;
            return {
                name: course.name,
                progress: total > 0 ? Math.round((completed / total) * 100) : 0
            };
        }));

        const progressCanvas = document.getElementById('progress-chart');
        if (progressCanvas && typeof Chart !== 'undefined') {
            const ctx = progressCanvas.getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: courseStats.map(c => c.name),
                    datasets: [{
                        label: 'Progress %',
                        data: courseStats.map(c => c.progress),
                        backgroundColor: '#3b82f6'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    }

    function newNote() {
        editingNote = null;
        currentNoteFiles = [];
        document.getElementById('note-modal-title').textContent = 'New Note';
        document.getElementById('note-form').reset();
        document.getElementById('note-id').value = '';
        document.getElementById('note-file-list').innerHTML = '';
        populateNoteCourseSelect();
        openModal('note-modal');
    }

    async function editNote(note) {
        editingNote = note;
        currentNoteFiles = note.attachments || [];
        
        document.getElementById('note-modal-title').textContent = 'Edit Note';
        document.getElementById('note-id').value = note.id;
        document.getElementById('note-title').value = note.title;
        document.getElementById('note-course').value = note.courseId;
        document.getElementById('note-category').value = note.category;
        document.getElementById('note-content').value = note.content || '';
        document.getElementById('note-tags').value = (note.tags || []).join(', ');

        await populateNoteCourseSelect();
        renderNoteFileList();
        openModal('note-modal');
    }

    async function saveNote() {
        const id = document.getElementById('note-id').value;
        const title = document.getElementById('note-title').value;
        const courseId = document.getElementById('note-course').value;
        const category = document.getElementById('note-category').value;
        const content = document.getElementById('note-content').value;
        const tags = document.getElementById('note-tags').value
            .split(',')
            .filter(t => t.trim())
            .map(t => t.trim());

        const noteData = {
            title,
            courseId,
            category,
            content,
            tags,
            attachments: currentNoteFiles
        };

        try {
            if (id) {
                await DB.updateNote(id, noteData);
                Animations.createToast('Note updated!', 'success');
            } else {
                await DB.addNote(noteData);
                Animations.createToast('Note created!', 'success');
            }

            closeModal('note-modal');
            Notes.render();
        } catch (error) {
            console.error('Error saving note:', error);
            Animations.createToast('Failed to save note', 'error');
        }
    }

    function newTimetableEntry() {
        document.getElementById('timetable-form').reset();
        document.getElementById('timetable-id').value = '';
        populateTimetableCourseSelect();
        openModal('timetable-modal');
    }

    async function saveTimetableEntry() {
        const id = document.getElementById('timetable-id').value;
        const courseId = document.getElementById('timetable-course').value;
        const day = document.getElementById('timetable-day').value;
        const startTime = document.getElementById('timetable-start-time').value;
        const endTime = document.getElementById('timetable-end-time').value;
        const location = document.getElementById('timetable-location').value;
        const instructor = document.getElementById('timetable-instructor').value;

        const entryData = {
            courseId,
            day,
            startTime,
            endTime,
            location,
            instructor
        };

        try {
            if (id) {
                await DB.updateTimetableEntry(id, entryData);
                Animations.createToast('Timetable entry updated!', 'success');
            } else {
                await DB.addTimetableEntry(entryData);
                Animations.createToast('Timetable entry added!', 'success');
            }

            closeModal('timetable-modal');
            Timetable.render();
        } catch (error) {
            console.error('Error saving timetable entry:', error);
            Animations.createToast('Failed to save timetable entry', 'error');
        }
    }

    async function populateNoteCourseSelect() {
        const courses = await DB.getCourses();
        const select = document.getElementById('note-course');
        
        if (!select) return;

        const currentValue = select.value;
        select.innerHTML = '<option value="">Select a course</option>';
        
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

    async function populateTimetableCourseSelect() {
        const courses = await DB.getCourses();
        const select = document.getElementById('timetable-course');
        
        if (!select) return;

        const currentValue = select.value;
        select.innerHTML = '<option value="">Select a course</option>';
        
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

    function renderNoteFileList() {
        const fileList = document.getElementById('note-file-list');
        if (!fileList) return;

        fileList.innerHTML = currentNoteFiles.map((file, index) => `
            <div class="file-item">
                <span class="file-icon">${Utils.getFileIcon(file.name)}</span>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${Utils.formatFileSize(file.size)}</div>
                </div>
                <button type="button" class="file-remove" data-index="${index}">&times;</button>
            </div>
        `).join('');

        fileList.querySelectorAll('.file-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                currentNoteFiles.splice(index, 1);
                renderNoteFileList();
            });
        });
    }

    function initNoteFileUpload() {
        const dropZone = document.getElementById('note-file-drop-zone');
        const fileInput = document.getElementById('note-file-input');

        dropZone?.addEventListener('click', () => fileInput?.click());

        dropZone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone?.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone?.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files);
            await handleNoteFiles(files);
        });

        fileInput?.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            await handleNoteFiles(files);
        });
    }

    async function handleNoteFiles(files) {
        for (const file of files) {
            const fileData = await DB.saveFile(file, {
                name: file.name,
                type: file.type,
                size: file.size
            });
            currentNoteFiles.push(fileData);
        }
        renderNoteFileList();
    }

    function initNoteForm() {
        const form = document.getElementById('note-form');
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveNote();
        });
    }

    function initTimetableForm() {
        const form = document.getElementById('timetable-form');
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveTimetableEntry();
        });
    }

    function initSettings() {
        document.getElementById('export-data-btn')?.addEventListener('click', async () => {
            const data = await DB.exportData();
            Utils.downloadJSON(data, `classflow-backup-${new Date().toISOString().split('T')[0]}.json`);
            Animations.createToast('Data exported!', 'success');
        });

        document.getElementById('import-data-btn')?.addEventListener('click', () => {
            document.getElementById('import-file-input')?.click();
        });

        document.getElementById('import-file-input')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await Utils.readFileAsText(file);
                const data = JSON.parse(text);
                await DB.importData(data);
                Animations.createToast('Data imported successfully!', 'success');
                renderDashboard();
            } catch (error) {
                console.error('Import error:', error);
                Animations.createToast('Failed to import data', 'error');
            }
        });

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                if (currentView === 'dashboard') {
                    renderDashboard();
                }
            }, 300));
        }

        const courseFilterSelect = document.getElementById('course-filter');
        const statusFilterSelect = document.getElementById('status-filter');

        courseFilterSelect?.addEventListener('change', () => {
            if (currentView === 'dashboard') {
                renderDashboard();
            }
        });

        statusFilterSelect?.addEventListener('change', () => {
            if (currentView === 'dashboard') {
                renderDashboard();
            }
        });
    }

    return {
        init,
        openModal,
        closeModal,
        switchView,
        renderDashboard,
        renderKanban,
        renderCourses,
        renderAnalytics,
        editAssignment,
        newAssignment,
        editNote,
        newNote
    };
})();

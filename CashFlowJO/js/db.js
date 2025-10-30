const DB = (function() {
    const STORES = {
        ASSIGNMENTS: 'assignments',
        COURSES: 'courses',
        FILES: 'files',
        SETTINGS: 'settings',
        NOTES: 'notes',
        TIMETABLE: 'timetable',
        ATTENDANCE: 'attendance',
        GRADES: 'grades'
    };

    localforage.config({
        name: 'ClassFlow',
        version: 1.0,
        storeName: 'classflow_data'
    });

    const assignmentsStore = localforage.createInstance({ name: 'ClassFlow', storeName: STORES.ASSIGNMENTS });
    const coursesStore = localforage.createInstance({ name: 'ClassFlow', storeName: STORES.COURSES });
    const filesStore = localforage.createInstance({ name: 'ClassFlow', storeName: STORES.FILES });
    const settingsStore = localforage.createInstance({ name: 'ClassFlow', storeName: STORES.SETTINGS });
    const notesStore = localforage.createInstance({ name: 'ClassFlow', storeName: STORES.NOTES });
    const timetableStore = localforage.createInstance({ name: 'ClassFlow', storeName: STORES.TIMETABLE });
    const attendanceStore = localforage.createInstance({ name: 'ClassFlow', storeName: STORES.ATTENDANCE });
    const gradesStore = localforage.createInstance({ name: 'ClassFlow', storeName: STORES.GRADES });

    function generateId() {
        return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    async function getCourses() {
        const userId = await getCurrentUserId();
        if (!userId) return [];

        const courses = [];
        await coursesStore.iterate((value) => {
            if (value.userId === userId) {
                courses.push(value);
            }
        });
        return courses.sort((a, b) => a.name.localeCompare(b.name));
    }

    async function getCourse(id) {
        return await coursesStore.getItem(id);
    }

    async function addCourse(course) {
        const userId = await getCurrentUserId();
        if (!userId) throw new Error('User not authenticated');

        const id = course.id || generateId();
        const newCourse = {
            id,
            userId,
            name: course.name,
            code: course.code || '',
            instructor: course.instructor || '',
            semester: course.semester || '',
            color: course.color || '#3b82f6',
            createdAt: new Date().toISOString()
        };
        await coursesStore.setItem(id, newCourse);
        return newCourse;
    }

    async function updateCourse(id, updates) {
        const course = await coursesStore.getItem(id);
        if (!course) throw new Error('Course not found');
        const updated = { ...course, ...updates };
        await coursesStore.setItem(id, updated);
        return updated;
    }

    async function deleteCourse(id) {
        await coursesStore.removeItem(id);
    }

    async function getCurrentUserId() {
        const user = await Auth.getCurrentUser();
        return user ? user.id : null;
    }

    async function getAssignments(filters = {}) {
        const userId = await getCurrentUserId();
        if (!userId) return [];

        const assignments = [];
        await assignmentsStore.iterate((value) => {
            if (value.userId === userId) {
                assignments.push(value);
            }
        });

        let filtered = assignments;

        if (filters.courseId) {
            filtered = filtered.filter(a => a.courseId === filters.courseId);
        }

        if (filters.status) {
            filtered = filtered.filter(a => {
                if (filters.status === 'overdue') {
                    return a.status !== 'completed' && new Date(a.dueDate) < new Date();
                }
                return a.status === filters.status;
            });
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(a => 
                a.title.toLowerCase().includes(searchLower) ||
                (a.notes && a.notes.toLowerCase().includes(searchLower)) ||
                (a.tags && a.tags.some(tag => tag.toLowerCase().includes(searchLower)))
            );
        }

        return filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    async function getAssignment(id) {
        return await assignmentsStore.getItem(id);
    }

    async function addAssignment(assignment) {
        const userId = await getCurrentUserId();
        if (!userId) throw new Error('User not authenticated');

        const id = assignment.id || generateId();
        const newAssignment = {
            id,
            userId,
            title: assignment.title,
            courseId: assignment.courseId,
            dueDate: assignment.dueDate,
            status: assignment.status || 'todo',
            priority: assignment.priority || 'medium',
            notes: assignment.notes || '',
            requirements: assignment.requirements || [],
            tags: assignment.tags || [],
            attachments: assignment.attachments || [],
            lectureLink: assignment.lectureLink || '',
            estimatedTime: assignment.estimatedTime || 0,
            completedAt: assignment.completedAt || null,
            recurring: assignment.recurring || null,
            createdAt: new Date().toISOString()
        };
        await assignmentsStore.setItem(id, newAssignment);
        return newAssignment;
    }

    async function updateAssignment(id, updates) {
        const assignment = await assignmentsStore.getItem(id);
        if (!assignment) throw new Error('Assignment not found');
        
        if (updates.status === 'completed' && assignment.status !== 'completed') {
            updates.completedAt = new Date().toISOString();
        }
        
        const updated = { ...assignment, ...updates };
        await assignmentsStore.setItem(id, updated);
        return updated;
    }

    async function deleteAssignment(id) {
        const assignment = await assignmentsStore.getItem(id);
        if (assignment && assignment.attachments) {
            for (const attachment of assignment.attachments) {
                await filesStore.removeItem(attachment.blobKey);
            }
        }
        await assignmentsStore.removeItem(id);
    }

    async function saveFile(blob, metadata) {
        const blobKey = generateId();
        const fileData = {
            blob,
            metadata: {
                name: metadata.name,
                type: metadata.type,
                size: metadata.size,
                uploadedAt: new Date().toISOString()
            }
        };
        await filesStore.setItem(blobKey, fileData);
        return { blobKey, ...fileData.metadata };
    }

    async function getFile(blobKey) {
        const fileData = await filesStore.getItem(blobKey);
        return fileData ? fileData.blob : null;
    }

    async function getFileMetadata(blobKey) {
        const fileData = await filesStore.getItem(blobKey);
        return fileData ? fileData.metadata : null;
    }

    async function deleteFile(blobKey) {
        await filesStore.removeItem(blobKey);
    }

    async function getSetting(key) {
        return await settingsStore.getItem(key);
    }

    async function setSetting(key, value) {
        await settingsStore.setItem(key, value);
    }

    async function exportData() {
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            courses: await getCourses(),
            assignments: await getAssignments(),
            notes: await getNotes(),
            timetable: await getTimetableEntries(),
            files: [],
            settings: {}
        };

        await filesStore.iterate((value, key) => {
            data.files.push({
                key,
                metadata: value.metadata,
                blob: value.blob
            });
        });

        await settingsStore.iterate((value, key) => {
            data.settings[key] = value;
        });

        return data;
    }

    async function importData(data) {
        if (data.courses) {
            for (const course of data.courses) {
                await coursesStore.setItem(course.id, course);
            }
        }

        if (data.assignments) {
            for (const assignment of data.assignments) {
                await assignmentsStore.setItem(assignment.id, assignment);
            }
        }

        if (data.notes) {
            for (const note of data.notes) {
                await notesStore.setItem(note.id, note);
            }
        }

        if (data.timetable) {
            for (const entry of data.timetable) {
                await timetableStore.setItem(entry.id, entry);
            }
        }

        if (data.files) {
            for (const file of data.files) {
                await filesStore.setItem(file.key, {
                    blob: file.blob,
                    metadata: file.metadata
                });
            }
        }

        if (data.settings) {
            for (const [key, value] of Object.entries(data.settings)) {
                await settingsStore.setItem(key, value);
            }
        }
    }

    async function getNotes(filters = {}) {
        const userId = await getCurrentUserId();
        if (!userId) return [];

        const notes = [];
        await notesStore.iterate((value) => {
            if (value.userId === userId) {
                notes.push(value);
            }
        });

        let filtered = notes;

        if (filters.courseId) {
            filtered = filtered.filter(n => n.courseId === filters.courseId);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(n => 
                n.title.toLowerCase().includes(searchLower) ||
                (n.content && n.content.toLowerCase().includes(searchLower)) ||
                (n.tags && n.tags.some(tag => tag.toLowerCase().includes(searchLower)))
            );
        }

        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    async function getNote(id) {
        return await notesStore.getItem(id);
    }

    async function addNote(note) {
        const userId = await getCurrentUserId();
        if (!userId) throw new Error('User not authenticated');

        const id = note.id || generateId();
        const newNote = {
            id,
            userId,
            title: note.title,
            courseId: note.courseId,
            category: note.category || 'other',
            content: note.content || '',
            tags: note.tags || [],
            attachments: note.attachments || [],
            createdAt: new Date().toISOString()
        };
        await notesStore.setItem(id, newNote);
        return newNote;
    }

    async function updateNote(id, updates) {
        const note = await notesStore.getItem(id);
        if (!note) throw new Error('Note not found');
        const updated = { ...note, ...updates };
        await notesStore.setItem(id, updated);
        return updated;
    }

    async function deleteNote(id) {
        const note = await notesStore.getItem(id);
        if (note && note.attachments) {
            for (const attachment of note.attachments) {
                await filesStore.removeItem(attachment.blobKey);
            }
        }
        await notesStore.removeItem(id);
    }

    async function getTimetableEntries() {
        const entries = [];
        await timetableStore.iterate((value) => {
            entries.push(value);
        });
        return entries.sort((a, b) => {
            const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
            if (dayDiff !== 0) return dayDiff;
            return a.startTime.localeCompare(b.startTime);
        });
    }

    async function getTimetableEntry(id) {
        return await timetableStore.getItem(id);
    }

    async function addTimetableEntry(entry) {
        const id = entry.id || generateId();
        const newEntry = {
            id,
            courseId: entry.courseId,
            day: entry.day,
            startTime: entry.startTime,
            endTime: entry.endTime,
            location: entry.location || '',
            instructor: entry.instructor || '',
            createdAt: new Date().toISOString()
        };
        await timetableStore.setItem(id, newEntry);
        return newEntry;
    }

    async function updateTimetableEntry(id, updates) {
        const entry = await timetableStore.getItem(id);
        if (!entry) throw new Error('Timetable entry not found');
        const updated = { ...entry, ...updates };
        await timetableStore.setItem(id, updated);
        return updated;
    }

    async function deleteTimetableEntry(id) {
        await timetableStore.removeItem(id);
    }

    async function recordAttendance(courseId, date, status) {
        const key = `${courseId}-${date}`;
        const record = {
            courseId,
            date,
            status,
            timestamp: new Date().toISOString()
        };
        await attendanceStore.setItem(key, record);
        return record;
    }

    async function getAttendanceForCourse(courseId) {
        const records = [];
        await attendanceStore.iterate((value, key) => {
            if (value.courseId === courseId) {
                records.push(value);
            }
        });
        return records.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    async function getAllAttendance() {
        const records = [];
        await attendanceStore.iterate((value) => {
            records.push(value);
        });
        return records;
    }

    async function addGrade(courseId, assignmentName, grade, weight, maxGrade) {
        const id = generateId();
        const gradeRecord = {
            id,
            courseId,
            assignmentName,
            grade: parseFloat(grade),
            weight: parseFloat(weight) || 1,
            maxGrade: parseFloat(maxGrade) || 100,
            createdAt: new Date().toISOString()
        };
        await gradesStore.setItem(id, gradeRecord);
        return gradeRecord;
    }

    async function getGradesForCourse(courseId) {
        const grades = [];
        await gradesStore.iterate((value) => {
            if (value.courseId === courseId) {
                grades.push(value);
            }
        });
        return grades.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    async function deleteGrade(id) {
        await gradesStore.removeItem(id);
    }

    async function clearAllData() {
        await assignmentsStore.clear();
        await coursesStore.clear();
        await filesStore.clear();
        await settingsStore.clear();
        await notesStore.clear();
        await timetableStore.clear();
        await attendanceStore.clear();
        await gradesStore.clear();
    }

    async function initializeDemo() {
        const existingCourses = await getCourses();
        if (existingCourses.length > 0) return;

        const demoCourses = [
            { name: 'Data Structures', code: 'CS201', instructor: 'Dr. Smith', semester: 'Fall 2025', color: '#3b82f6' },
            { name: 'Web Development', code: 'CS301', instructor: 'Prof. Johnson', semester: 'Fall 2025', color: '#10b981' },
            { name: 'Database Systems', code: 'CS305', instructor: 'Dr. Williams', semester: 'Fall 2025', color: '#f59e0b' }
        ];

        for (const course of demoCourses) {
            await addCourse(course);
        }

        const courses = await getCourses();
        
        const demoAssignments = [
            {
                title: 'Implement Binary Search Tree',
                courseId: courses[0].id,
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'todo',
                priority: 'high',
                notes: 'Implement insert, delete, and search operations',
                requirements: ['Write code', 'Write tests', 'Submit documentation'],
                tags: ['programming', 'data-structures']
            },
            {
                title: 'Build Responsive Portfolio',
                courseId: courses[1].id,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'in_progress',
                priority: 'medium',
                notes: 'Use HTML, CSS, and JavaScript',
                requirements: ['Create HTML structure', 'Style with CSS', 'Add interactivity'],
                tags: ['web', 'project']
            },
            {
                title: 'SQL Queries Assignment',
                courseId: courses[2].id,
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'todo',
                priority: 'high',
                notes: 'Complete exercises 1-10',
                requirements: ['Complete all queries', 'Test with sample data'],
                tags: ['database', 'homework']
            }
        ];

        for (const assignment of demoAssignments) {
            await addAssignment(assignment);
        }
    }

    return {
        getCourses,
        getCourse,
        addCourse,
        updateCourse,
        deleteCourse,
        getAssignments,
        getAssignment,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        getNotes,
        getNote,
        addNote,
        updateNote,
        deleteNote,
        getTimetableEntries,
        getTimetableEntry,
        addTimetableEntry,
        updateTimetableEntry,
        deleteTimetableEntry,
        recordAttendance,
        getAttendanceForCourse,
        getAllAttendance,
        addGrade,
        getGradesForCourse,
        deleteGrade,
        saveFile,
        getFile,
        getFileMetadata,
        deleteFile,
        getSetting,
        setSetting,
        exportData,
        importData,
        clearAllData,
        initializeDemo
    };
})();

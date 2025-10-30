const Timetable = (function() {
    const TIMETABLE_IMAGE_KEY = 'timetable-photo';

    async function init() {
        const uploadBtn = document.getElementById('upload-timetable-photo-btn');
        const uploadPromptBtn = document.getElementById('upload-prompt-btn');
        const removeBtn = document.getElementById('remove-timetable-photo-btn');
        const downloadBtn = document.getElementById('download-timetable-btn');
        const fileInput = document.getElementById('timetable-photo-input');

        uploadBtn?.addEventListener('click', () => fileInput?.click());
        uploadPromptBtn?.addEventListener('click', () => fileInput?.click());

        removeBtn?.addEventListener('click', async () => {
            if (confirm('Remove timetable photo?')) {
                await removeTimetablePhoto();
            }
        });

        downloadBtn?.addEventListener('click', () => {
            downloadTimetablePhoto();
        });

        fileInput?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await handleTimetablePhoto(file);
            }
        });

        await loadTimetablePhoto();
    }

    async function handleTimetablePhoto(file) {
        if (file.size > 10 * 1024 * 1024) {
            Animations.createToast('File too large! Max 10MB', 'error');
            return;
        }

        if (!file.type.startsWith('image/')) {
            Animations.createToast('Please upload an image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const imageData = e.target.result;
            await DB.setSetting(TIMETABLE_IMAGE_KEY, imageData);
            displayTimetablePhoto(imageData);
            Animations.createToast('Timetable uploaded!', 'success');
        };
        reader.readAsDataURL(file);
    }

    function displayTimetablePhoto(imageData) {
        const container = document.getElementById('timetable-display');
        const imageWrapper = document.getElementById('timetable-image-wrapper');
        const image = document.getElementById('timetable-image');
        const uploadPrompt = container.querySelector('.upload-prompt');

        if (uploadPrompt) {
            uploadPrompt.style.display = 'none';
        }

        image.src = imageData;
        imageWrapper.style.display = 'block';
        container.classList.add('has-image');

        document.getElementById('remove-timetable-photo-btn').style.display = 'inline-flex';
        document.getElementById('download-timetable-btn').style.display = 'inline-flex';
    }

    async function loadTimetablePhoto() {
        const imageData = await DB.getSetting(TIMETABLE_IMAGE_KEY);
        if (imageData) {
            displayTimetablePhoto(imageData);
        }
    }

    async function removeTimetablePhoto() {
        await DB.setSetting(TIMETABLE_IMAGE_KEY, null);
        
        const container = document.getElementById('timetable-display');
        const imageWrapper = document.getElementById('timetable-image-wrapper');
        const uploadPrompt = container.querySelector('.upload-prompt');

        imageWrapper.style.display = 'none';
        if (uploadPrompt) {
            uploadPrompt.style.display = 'block';
        }
        container.classList.remove('has-image');

        document.getElementById('remove-timetable-photo-btn').style.display = 'none';
        document.getElementById('download-timetable-btn').style.display = 'none';

        Animations.createToast('Timetable removed', 'info');
    }

    function downloadTimetablePhoto() {
        const image = document.getElementById('timetable-image');
        const link = document.createElement('a');
        link.href = image.src;
        link.download = 'my-timetable.png';
        link.click();
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = {
        monday: 'Mon',
        tuesday: 'Tue',
        wednesday: 'Wed',
        thursday: 'Thu',
        friday: 'Fri',
        saturday: 'Sat',
        sunday: 'Sun'
    };

    async function render() {
        const container = document.getElementById('timetable-container');
        if (!container) return;

        const entries = await DB.getTimetableEntries();
        const courses = await DB.getCourses();
        const courseMap = new Map(courses.map(c => [c.id, c]));

        const timeSlots = generateTimeSlots(8, 18);
        
        let html = '<div class="timetable-grid">';
        
        html += '<div class="timetable-corner"></div>';
        days.forEach(day => {
            html += `<div class="timetable-day-header">${dayNames[day]}</div>`;
        });

        timeSlots.forEach(time => {
            html += `<div class="timetable-time-label">${time}</div>`;
            
            days.forEach(day => {
                const dayEntries = entries.filter(e => e.day === day);
                const entryAtTime = findEntryAtTime(dayEntries, time);
                
                if (entryAtTime) {
                    const course = courseMap.get(entryAtTime.courseId);
                    const duration = calculateDuration(entryAtTime.startTime, entryAtTime.endTime);
                    
                    html += `
                        <div class="timetable-cell has-class" 
                             style="background: ${course ? course.color + '20' : '#f0f0f0'}; 
                                    border-left: 4px solid ${course ? course.color : '#ccc'};
                                    grid-row: span ${duration};"
                             data-entry-id="${entryAtTime.id}">
                            <div class="timetable-class-name">${course ? course.name : 'Unknown'}</div>
                            <div class="timetable-class-time">${formatTime(entryAtTime.startTime)} - ${formatTime(entryAtTime.endTime)}</div>
                            ${entryAtTime.location ? `<div class="timetable-class-location">📍 ${entryAtTime.location}</div>` : ''}
                            ${entryAtTime.instructor ? `<div class="timetable-class-instructor">👤 ${entryAtTime.instructor}</div>` : ''}
                        </div>
                    `;
                } else if (!isCoveredByPreviousEntry(dayEntries, time)) {
                    html += '<div class="timetable-cell"></div>';
                }
            });
        });

        html += '</div>';
        container.innerHTML = html;

        addTimetableStyles();

        document.querySelectorAll('.timetable-cell.has-class').forEach(cell => {
            cell.addEventListener('click', async (e) => {
                const entryId = e.currentTarget.getAttribute('data-entry-id');
                if (entryId) {
                    const entry = await DB.getTimetableEntry(entryId);
                    if (entry && confirm('Delete this timetable entry?')) {
                        await DB.deleteTimetableEntry(entryId);
                        render();
                    }
                }
            });
        });
    }

    function generateTimeSlots(startHour, endHour) {
        const slots = [];
        for (let hour = startHour; hour < endHour; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        return slots;
    }

    function findEntryAtTime(entries, timeSlot) {
        return entries.find(entry => {
            const entryStart = entry.startTime.substring(0, 5);
            return entryStart === timeSlot;
        });
    }

    function isCoveredByPreviousEntry(entries, timeSlot) {
        const [hour, minute] = timeSlot.split(':').map(Number);
        const slotMinutes = hour * 60 + minute;

        return entries.some(entry => {
            const [startHour, startMinute] = entry.startTime.split(':').map(Number);
            const [endHour, endMinute] = entry.endTime.split(':').map(Number);
            const startMinutes = startHour * 60 + startMinute;
            const endMinutes = endHour * 60 + endMinute;

            return slotMinutes > startMinutes && slotMinutes < endMinutes;
        });
    }

    function calculateDuration(startTime, endTime) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
        return Math.ceil(durationMinutes / 60);
    }

    function formatTime(time) {
        return time.substring(0, 5);
    }

    function addTimetableStyles() {
        if (document.getElementById('timetable-custom-styles')) return;

        const style = document.createElement('style');
        style.id = 'timetable-custom-styles';
        style.textContent = `
            .timetable-grid {
                display: grid;
                grid-template-columns: 80px repeat(7, 1fr);
                gap: 1px;
                background: var(--border);
                border: 1px solid var(--border);
                overflow-x: auto;
            }
            .timetable-corner {
                background: var(--surface);
            }
            .timetable-day-header {
                background: var(--surface);
                padding: 1rem;
                text-align: center;
                font-weight: 600;
                font-size: 1.1rem;
            }
            .timetable-time-label {
                background: var(--surface);
                padding: 0.75rem;
                text-align: center;
                font-weight: 500;
                color: var(--text-muted);
                font-size: 0.85rem;
            }
            .timetable-cell {
                background: var(--background);
                min-height: 60px;
                padding: 0.5rem;
                position: relative;
                transition: all 0.2s ease;
            }
            .timetable-cell.has-class {
                cursor: pointer;
                padding: 0.75rem;
            }
            .timetable-cell.has-class:hover {
                transform: scale(1.02);
                box-shadow: 0 2px 8px var(--shadow);
                z-index: 10;
            }
            .timetable-class-name {
                font-weight: 600;
                margin-bottom: 0.25rem;
                font-size: 0.95rem;
            }
            .timetable-class-time {
                font-size: 0.85rem;
                color: var(--text-muted);
                margin-bottom: 0.25rem;
            }
            .timetable-class-location,
            .timetable-class-instructor {
                font-size: 0.8rem;
                color: var(--text-muted);
                margin-top: 0.25rem;
            }
            .free-time {
                background: #f0fdf4 !important;
                position: relative;
            }
            .free-time::after {
                content: '✓ Free';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #16a34a;
                font-size: 0.75rem;
                font-weight: 600;
                opacity: 0.5;
            }
            [data-theme="dark"] .free-time {
                background: #064e3b !important;
            }
            @media (max-width: 768px) {
                .timetable-grid {
                    grid-template-columns: 60px repeat(7, minmax(100px, 1fr));
                    font-size: 0.85rem;
                }
                .timetable-day-header {
                    font-size: 0.9rem;
                    padding: 0.5rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function highlightFreeTime() {
        const cells = document.querySelectorAll('.timetable-cell:not(.has-class)');
        const now = new Date();
        const currentDay = now.getDay();
        const currentHour = now.getHours();
        
        cells.forEach(cell => {
            if (currentHour >= 8 && currentHour < 18) {
                cell.classList.add('free-time');
            }
        });
    }

    async function suggestStudyTimes() {
        const entries = await DB.getTimetableEntries();
        const suggestions = [];
        
        days.forEach(day => {
            const dayEntries = entries.filter(e => e.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
            
            for (let i = 0; i < dayEntries.length - 1; i++) {
                const current = dayEntries[i];
                const next = dayEntries[i + 1];
                
                const endHour = parseInt(current.endTime.split(':')[0]);
                const startHour = parseInt(next.startTime.split(':')[0]);
                const gap = startHour - endHour;
                
                if (gap >= 1) {
                    suggestions.push({
                        day: dayNames[day],
                        time: `${current.endTime} - ${next.startTime}`,
                        duration: gap,
                        type: gap >= 2 ? 'Long break - Perfect for study!' : 'Short break'
                    });
                }
            }
        });
        
        return suggestions;
    }

    async function getWeeklySummary() {
        const entries = await DB.getTimetableEntries();
        const summary = {
            totalHours: 0,
            classesByDay: {},
            busiestDay: '',
            maxHours: 0
        };
        
        days.forEach(day => {
            const dayEntries = entries.filter(e => e.day === day);
            let dayHours = 0;
            
            dayEntries.forEach(entry => {
                const [startH, startM] = entry.startTime.split(':').map(Number);
                const [endH, endM] = entry.endTime.split(':').map(Number);
                const hours = (endH * 60 + endM - startH * 60 - startM) / 60;
                dayHours += hours;
            });
            
            summary.classesByDay[day] = { count: dayEntries.length, hours: dayHours };
            summary.totalHours += dayHours;
            
            if (dayHours > summary.maxHours) {
                summary.maxHours = dayHours;
                summary.busiestDay = dayNames[day];
            }
        });
        
        return summary;
    }

    async function exportAsImage() {
        Animations.createToast('Generating timetable image...', 'info');
        
        const container = document.getElementById('timetable-container');
        if (!container) return;
        
        try {
            const dataUrl = await htmlToImage.toPng(container);
            const link = document.createElement('a');
            link.download = 'my-timetable.png';
            link.href = dataUrl;
            link.click();
            Animations.createToast('Timetable exported!', 'success');
        } catch (error) {
            Animations.createToast('Install html-to-image for this feature', 'warning');
            window.print();
        }
    }

    async function importFromImage() {
        const courses = [
            { name: 'Web Dev. 2', code: '', instructor: 'DSpencer', semester: 'Spring 2025', color: '#60a5fa' },
            { name: 'Intro. Mobile App', code: '', instructor: 'AScott', semester: 'Spring 2025', color: '#34d399' },
            { name: 'Intro. Mgt.', code: '', instructor: 'MMcGill', semester: 'Spring 2025', color: '#fbbf24' },
            { name: 'Networking', code: '', instructor: 'ADaley', semester: 'Spring 2025', color: '#a78bfa' },
            { name: 'Law', code: '', instructor: 'FCassells', semester: 'Spring 2025', color: '#f472b6' },
            { name: 'Intro. Psy.', code: '', instructor: 'GChristie', semester: 'Spring 2025', color: '#22d3ee' }
        ];

        const existingCourses = await DB.getCourses();
        const courseMap = new Map();

        for (const courseData of courses) {
            const existing = existingCourses.find(c => c.name === courseData.name);
            if (existing) {
                courseMap.set(courseData.name, existing.id);
            } else {
                const newCourse = await DB.addCourse(courseData);
                courseMap.set(courseData.name, newCourse.id);
            }
        }

        const timetableEntries = [
            { courseId: courseMap.get('Web Dev. 2'), day: 'monday', startTime: '08:00', endTime: '10:00', location: 'Lab 3', instructor: 'DSpencer' },
            { courseId: courseMap.get('Intro. Mobile App'), day: 'monday', startTime: '11:00', endTime: '13:00', location: 'Lab 3', instructor: 'AScott' },
            
            { courseId: courseMap.get('Web Dev. 2'), day: 'tuesday', startTime: '08:00', endTime: '10:00', location: 'Lab 3', instructor: 'DSpencer' },
            { courseId: courseMap.get('Intro. Mgt.'), day: 'tuesday', startTime: '11:00', endTime: '14:00', location: 'R6', instructor: 'MMcGill' },
            { courseId: courseMap.get('Networking'), day: 'tuesday', startTime: '16:00', endTime: '18:00', location: 'Lab 4', instructor: 'ADaley' },
            
            { courseId: courseMap.get('Law'), day: 'wednesday', startTime: '08:00', endTime: '11:00', location: 'R4', instructor: 'FCassells' },
            { courseId: courseMap.get('Intro. Mobile App'), day: 'wednesday', startTime: '14:00', endTime: '16:00', location: 'Lab 3', instructor: 'AScott' },
            
            { courseId: courseMap.get('Networking'), day: 'thursday', startTime: '11:00', endTime: '14:00', location: 'Lab 4', instructor: 'ADaley' },
            
            { courseId: courseMap.get('Intro. Psy.'), day: 'friday', startTime: '09:00', endTime: '11:00', location: 'R4', instructor: 'GChristie' },
            { courseId: courseMap.get('Web Dev. 2'), day: 'friday', startTime: '14:00', endTime: '16:00', location: 'Lab 3', instructor: 'DSpencer' }
        ];

        for (const entry of timetableEntries) {
            await DB.addTimetableEntry(entry);
        }

        Animations.createToast('Timetable imported successfully!', 'success');
        render();
    }

    return {
        init,
        render,
        importFromImage,
        suggestStudyTimes,
        getWeeklySummary,
        exportAsImage,
        highlightFreeTime
    };
})();

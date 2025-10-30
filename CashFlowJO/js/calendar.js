const Calendar = (function() {
    let currentDate = new Date();
    let assignments = [];
    let courses = [];

    async function render() {
        const container = document.getElementById('calendar-container');
        if (!container) return;

        assignments = await DB.getAssignments();
        courses = await DB.getCourses();

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        let html = `
            <div class="calendar-header">
                <button class="btn btn-secondary" id="prev-month">&larr; Previous</button>
                <h3>${firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                <button class="btn btn-secondary" id="next-month">Next &rarr;</button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-day-header">Sun</div>
                <div class="calendar-day-header">Mon</div>
                <div class="calendar-day-header">Tue</div>
                <div class="calendar-day-header">Wed</div>
                <div class="calendar-day-header">Thu</div>
                <div class="calendar-day-header">Fri</div>
                <div class="calendar-day-header">Sat</div>
        `;

        for (let i = 0; i < startingDayOfWeek; i++) {
            html += '<div class="calendar-cell empty"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const dayAssignments = assignments.filter(a => {
                const dueDate = new Date(a.dueDate);
                return dueDate.getDate() === day && 
                       dueDate.getMonth() === month && 
                       dueDate.getFullYear() === year;
            });

            const isToday = new Date().toDateString() === cellDate.toDateString();

            html += `
                <div class="calendar-cell ${isToday ? 'today' : ''}">
                    <div class="calendar-date">${day}</div>
                    <div class="calendar-events">
            `;

            for (const assignment of dayAssignments.slice(0, 3)) {
                const course = courses.find(c => c.id === assignment.courseId);
                const color = course ? course.color : '#3b82f6';
                html += `
                    <div class="calendar-event" style="border-left-color: ${color}" 
                         data-assignment-id="${assignment.id}" 
                         title="${assignment.title}">
                        ${assignment.title.substring(0, 20)}${assignment.title.length > 20 ? '...' : ''}
                    </div>
                `;
            }

            if (dayAssignments.length > 3) {
                html += `<div class="calendar-more">+${dayAssignments.length - 3} more</div>`;
            }

            html += `
                    </div>
                </div>
            `;
        }

        html += '</div>';

        container.innerHTML = html;

        document.getElementById('prev-month')?.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            render();
        });

        document.getElementById('next-month')?.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            render();
        });

        document.querySelectorAll('.calendar-event').forEach(event => {
            event.addEventListener('click', async (e) => {
                const assignmentId = e.target.getAttribute('data-assignment-id');
                const assignment = await DB.getAssignment(assignmentId);
                if (assignment) {
                    UI.editAssignment(assignment);
                }
            });
        });

        addCalendarStyles();
    }

    function addCalendarStyles() {
        if (document.getElementById('calendar-custom-styles')) return;

        const style = document.createElement('style');
        style.id = 'calendar-custom-styles';
        style.textContent = `
            .calendar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
            }
            .calendar-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 1px;
                background: var(--border);
                border: 1px solid var(--border);
            }
            .calendar-day-header {
                background: var(--surface);
                padding: 0.75rem;
                text-align: center;
                font-weight: 600;
                color: var(--text-muted);
            }
            .calendar-cell {
                background: var(--background);
                min-height: 100px;
                padding: 0.5rem;
                position: relative;
            }
            .calendar-cell.empty {
                background: var(--surface);
            }
            .calendar-cell.today {
                background: #eff6ff;
            }
            .calendar-date {
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            .calendar-events {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }
            .calendar-event {
                font-size: 0.75rem;
                padding: 0.25rem 0.5rem;
                background: var(--surface);
                border-radius: 3px;
                border-left: 3px solid var(--primary);
                cursor: pointer;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .calendar-event:hover {
                background: var(--surface-hover);
            }
            .calendar-more {
                font-size: 0.75rem;
                color: var(--text-muted);
                margin-top: 0.25rem;
            }
        `;
        document.head.appendChild(style);
    }

    return {
        render
    };
})();

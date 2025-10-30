const Utils = {
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = date - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days < 0) {
            return `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`;
        } else if (days === 0) {
            return 'Due today';
        } else if (days === 1) {
            return 'Due tomorrow';
        } else if (days < 7) {
            return `Due in ${days} days`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    },

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    isOverdue(dateString, status) {
        return status !== 'completed' && new Date(dateString) < new Date();
    },

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            pdf: '📄',
            doc: '📝',
            docx: '📝',
            ppt: '📊',
            pptx: '📊',
            txt: '📃',
            png: '🖼️',
            jpg: '🖼️',
            jpeg: '🖼️',
            gif: '🖼️',
            zip: '📦'
        };
        return icons[ext] || '📎';
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    exportToICS(assignments, courses) {
        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//ClassFlow//Assignment Tracker//EN',
            'CALNAME:ClassFlow Assignments'
        ];

        const courseMap = new Map(courses.map(c => [c.id, c]));

        for (const assignment of assignments) {
            const course = courseMap.get(assignment.courseId);
            const dueDate = new Date(assignment.dueDate);
            const dtstart = dueDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            
            icsContent.push(
                'BEGIN:VEVENT',
                `UID:${assignment.id}@classflow`,
                `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                `DTSTART:${dtstart}`,
                `SUMMARY:${assignment.title}`,
                `DESCRIPTION:Course: ${course ? course.name : 'Unknown'}\\nStatus: ${assignment.status}${assignment.notes ? '\\n' + assignment.notes : ''}`,
                `STATUS:${assignment.status === 'completed' ? 'COMPLETED' : 'CONFIRMED'}`,
                'END:VEVENT'
            );
        }

        icsContent.push('END:VCALENDAR');

        const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'classflow-assignments.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

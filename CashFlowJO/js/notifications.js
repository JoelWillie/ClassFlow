const Notifications = (function() {
    let notificationsEnabled = false;
    let notificationDays = 1;

    async function init() {
        notificationsEnabled = await DB.getSetting('notificationsEnabled') || false;
        notificationDays = await DB.getSetting('notificationDays') || 1;

        const enableCheckbox = document.getElementById('enable-notifications');
        const daysInput = document.getElementById('notification-days');

        if (enableCheckbox) {
            enableCheckbox.checked = notificationsEnabled;
            enableCheckbox.addEventListener('change', async (e) => {
                if (e.target.checked) {
                    await requestPermission();
                } else {
                    notificationsEnabled = false;
                    await DB.setSetting('notificationsEnabled', false);
                }
            });
        }

        if (daysInput) {
            daysInput.value = notificationDays;
            daysInput.addEventListener('change', async (e) => {
                notificationDays = parseInt(e.target.value);
                await DB.setSetting('notificationDays', notificationDays);
            });
        }

        if (notificationsEnabled) {
            checkUpcomingDeadlines();
            setInterval(checkUpcomingDeadlines, 60 * 60 * 1000);
        }
    }

    async function requestPermission() {
        if (!('Notification' in window)) {
            alert('This browser does not support notifications');
            return false;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            notificationsEnabled = true;
            await DB.setSetting('notificationsEnabled', true);
            return true;
        } else {
            notificationsEnabled = false;
            await DB.setSetting('notificationsEnabled', false);
            return false;
        }
    }

    async function checkUpcomingDeadlines() {
        if (!notificationsEnabled || Notification.permission !== 'granted') return;

        const assignments = await DB.getAssignments({ status: 'todo' });
        const now = new Date();
        const threshold = new Date(now.getTime() + notificationDays * 24 * 60 * 60 * 1000);

        for (const assignment of assignments) {
            const dueDate = new Date(assignment.dueDate);
            
            if (dueDate <= threshold && dueDate > now) {
                const notified = await DB.getSetting(`notified-${assignment.id}`);
                if (!notified) {
                    showNotification(assignment);
                    await DB.setSetting(`notified-${assignment.id}`, true);
                }
            }
        }
    }

    async function showNotification(assignment) {
        const course = await DB.getCourse(assignment.courseId);
        const courseName = course ? course.name : 'Unknown Course';
        
        new Notification('ClassFlow: Upcoming Deadline', {
            body: `${assignment.title} (${courseName}) is due ${Utils.formatDate(assignment.dueDate)}`,
            icon: 'assets/icon.png',
            tag: assignment.id
        });
    }

    return {
        init,
        requestPermission,
        checkUpcomingDeadlines
    };
})();

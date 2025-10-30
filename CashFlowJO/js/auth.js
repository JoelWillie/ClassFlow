const Auth = (function() {
    const CURRENT_USER_KEY = 'currentUser';
    const USERS_STORE_PREFIX = 'user:';

    async function hashPassword(password, salt) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    function generateSalt() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    function generateUserId() {
        return 'uid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    async function signup(email, password, displayName) {
        email = email.toLowerCase().trim();
        
        const existingUser = await DB.getSetting(USERS_STORE_PREFIX + email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const userId = generateUserId();
        const salt = generateSalt();
        const hash = await hashPassword(password, salt);

        const user = {
            id: userId,
            email: email,
            displayName: displayName || email.split('@')[0],
            salt: salt,
            hash: hash,
            createdAt: new Date().toISOString(),
            theme: 'light'
        };

        await DB.setSetting(USERS_STORE_PREFIX + email, user);
        await setCurrentUser(user);

        return user;
    }

    async function login(email, password) {
        email = email.toLowerCase().trim();
        
        const user = await DB.getSetting(USERS_STORE_PREFIX + email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const hash = await hashPassword(password, user.salt);
        if (hash !== user.hash) {
            throw new Error('Invalid email or password');
        }

        await setCurrentUser(user);
        return user;
    }

    async function loginAsGuest(nickname) {
        const sessionId = 'guest-' + Date.now();
        const guestUser = {
            id: sessionId,
            email: null,
            displayName: nickname || 'Guest',
            isGuest: true,
            createdAt: new Date().toISOString(),
            theme: 'light'
        };

        sessionStorage.setItem('guestUser', JSON.stringify(guestUser));
        await setCurrentUser(guestUser);
        
        return guestUser;
    }

    async function convertGuestToAccount(email, password, displayName) {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.isGuest) {
            throw new Error('Not in guest mode');
        }

        const guestData = {
            assignments: await DB.getAssignments(),
            courses: await DB.getCourses(),
            notes: await DB.getNotes(),
            timetable: await DB.getTimetableEntries()
        };

        const newUser = await signup(email, password, displayName);

        for (const assignment of guestData.assignments) {
            assignment.userId = newUser.id;
            await DB.addAssignment(assignment);
        }

        for (const course of guestData.courses) {
            course.userId = newUser.id;
            await DB.addCourse(course);
        }

        for (const note of guestData.notes) {
            note.userId = newUser.id;
            await DB.addNote(note);
        }

        for (const entry of guestData.timetable) {
            entry.userId = newUser.id;
            await DB.addTimetableEntry(entry);
        }

        sessionStorage.removeItem('guestUser');
        
        return newUser;
    }

    async function logout() {
        sessionStorage.removeItem(CURRENT_USER_KEY);
        sessionStorage.removeItem('guestUser');
        window.location.reload();
    }

    async function setCurrentUser(user) {
        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            isGuest: user.isGuest || false
        }));
    }

    async function getCurrentUser() {
        const userJson = sessionStorage.getItem(CURRENT_USER_KEY);
        if (userJson) {
            return JSON.parse(userJson);
        }

        const guestJson = sessionStorage.getItem('guestUser');
        if (guestJson) {
            return JSON.parse(guestJson);
        }

        return null;
    }

    function isAuthenticated() {
        return sessionStorage.getItem(CURRENT_USER_KEY) !== null || 
               sessionStorage.getItem('guestUser') !== null;
    }

    function isGuest() {
        const user = sessionStorage.getItem('guestUser');
        return user !== null;
    }

    async function isAdmin() {
        const currentUser = await getCurrentUser();
        return currentUser && currentUser.email === 'joelwillie252@gmail.com';
    }

    async function getAllUsers() {
        const users = [];
        const keys = [];
        
        await DB.getSetting('').catch(() => {});
        
        const allSettings = [];
        await localforage.createInstance({ name: 'ClassFlow', storeName: 'settings' }).iterate((value, key) => {
            if (key.startsWith('user:')) {
                const userData = value;
                users.push({
                    email: userData.email,
                    displayName: userData.displayName,
                    createdAt: userData.createdAt,
                    id: userData.id
                });
            }
        });
        
        return users;
    }

    async function updateUserTheme(theme) {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.isGuest) return;

        const user = await DB.getSetting(USERS_STORE_PREFIX + currentUser.email);
        if (user) {
            user.theme = theme;
            await DB.setSetting(USERS_STORE_PREFIX + currentUser.email, user);
        }
    }

    async function getUserTheme() {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.isGuest) return 'light';

        const user = await DB.getSetting(USERS_STORE_PREFIX + currentUser.email);
        return user ? user.theme : 'light';
    }

    return {
        signup,
        login,
        loginAsGuest,
        convertGuestToAccount,
        logout,
        getCurrentUser,
        isAuthenticated,
        isGuest,
        isAdmin,
        getAllUsers,
        updateUserTheme,
        getUserTheme
    };
})();

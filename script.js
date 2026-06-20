// ========================================
// ADVANCED DATA MANAGEMENT
// ========================================

let projects = [];
let stats = {
    downloads: 0,
    community: 0,
    views: 0,
    featured: 0
};
let settings = {
    theme: 'dark',
    adminPassword: '333',
    siteTitle: 'CRINGECLAN',
    siteDescription: 'CRINGECLAN - Projekte, Mitglieder und Community an einem Ort.',
    memberAreaText: 'Hier koennen interne Infos, Hinweise oder kleine Clan-Updates stehen.',
    defaultTheme: 'dark',
    sessionTimeout: 30,
    enableAuditLog: true,
    autoBackup: false,
    backupInterval: 24,
    backupRetention: 30,
    discordWebhook: '',
    discordNotifyNewProject: false,
    discordNotifyUpdate: false,
    discordChannelId: '',
    discordToken: '',
    githubToken: ''
};
let activityLog = [];
let newsletterSubscribers = [];
let backups = [];
let updates = [];
let events = [];
let socialDefinitions = [];
let currentFilter = 'all';
let searchQuery = '';
let currentSort = 'newest';
let viewMode = 'grid';
let selectedProjects = [];
let sessionTimeout = null;
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firestorePermissionWarned = false;
let authState = {
    user: null,
    role: 'guest',
    memberId: null,
    email: ''
};

const ADMIN_EMAILS = ['cringealiyt@gmail.com', 'cpamuk333@gmail.com'];
const firebaseConfig = {
    apiKey: 'AIzaSyA12FbroUAcB0N7KaJxVIyFtSNN2ZDvSEA',
    authDomain: 'cringeclan-homepage.firebaseapp.com',
    projectId: 'cringeclan-homepage',
    appId: '1:599751764923:web:b55b3970163eb29b1f729e',
    storageBucket: 'cringeclan-homepage.firebasestorage.app',
    messagingSenderId: '599751764923',
    measurementId: 'G-Y51XMS7QR9'
};
const FIRESTORE_CONTENT_COLLECTION = 'siteContent';
const FIRESTORE_CONTENT_DOC = 'main';
const FIRESTORE_MEMBERS_COLLECTION = 'members';
const MEMBER_TAB_PERMISSION_OPTIONS = [
    { id: 'projects', label: 'Projekte' },
    { id: 'events', label: 'Ereignisse' },
    { id: 'stats', label: 'Statistiken' },
    { id: 'settings', label: 'Einstellungen' },
    { id: 'socials', label: 'Socials' },
    { id: 'internal', label: 'Intern' },
    { id: 'activity', label: 'Aktivität' }
];

// Project Type Configuration
const projectTypeConfig = {
    minecraft: {
        name: 'Minecraft',
        icon: 'fas fa-cube',
        color: '#34d399',
        description: 'Minecraft-bezogene Projekte'
    },
    mod: {
        name: 'Mods',
        icon: 'fas fa-puzzle-piece',
        color: '#818cf8',
        description: 'Modifikationen und Erweiterungen'
    },
    resourcepack: {
        name: 'Resource Packs',
        icon: 'fas fa-palette',
        color: '#f472b6',
        description: 'Ressourcen-Pakete und Texturen'
    },
    jellyfin: {
        name: 'Jellyfin Server',
        icon: 'fas fa-server',
        color: '#60a5fa',
        description: 'Jellyfin Media Server'
    },
    mcserver: {
        name: 'Minecraft Server',
        icon: 'fas fa-network-wired',
        color: '#fbbf24',
        description: 'Minecraft Server Projekte'
    },
    tool: {
        name: 'Tools & Utilities',
        icon: 'fas fa-wrench',
        color: '#a78bfa',
        description: 'Nützliche Tools und Dienstprogramme'
    },
    app: {
        name: 'Anwendungen',
        icon: 'fas fa-mobile-alt',
        color: '#06b6d4',
        description: 'Applikationen und Software'
    },
    other: {
        name: 'Sonstiges',
        icon: 'fas fa-star',
        color: '#ec4899',
        description: 'Weitere Projekte'
    }
};

// Legacy Platform configuration (kept for backward compatibility)
const platformConfig = {
    github: {
        name: 'GitHub',
        icon: 'fab fa-github',
        color: '#6366f1',
        baseUrl: 'https://github.com'
    },
    modrinth: {
        name: 'Modrinth',
        icon: 'fas fa-wrench',
        color: '#10b981',
        baseUrl: 'https://modrinth.com'
    },
    curseforge: {
        name: 'CurseForge',
        icon: 'fas fa-fire',
        color: '#ef4444',
        baseUrl: 'https://curseforge.com'
    },
    other: {
        name: 'Andere',
        icon: 'fas fa-star',
        color: '#f472b6',
        baseUrl: ''
    }
};

const remotePhotosBaseUrl = 'https://raw.githubusercontent.com/dannydevcodes-de/CringeClan-Website/main/photos/';

const defaultSocialDefinitions = [];

function sanitizeIconClass(icon, fallback = 'fas fa-link') {
    const trimmed = (icon || '').trim();
    return /^[a-z0-9\- ]+$/i.test(trimmed) ? trimmed : fallback;
}

function normalizeSocialIcon(icon) {
    const trimmed = (icon || '').trim();
    if (!trimmed) {
        return 'fas fa-link';
    }

    if (validateUrl(trimmed)) {
        return normalizeImageUrl(trimmed);
    }

    return sanitizeIconClass(trimmed, 'fas fa-link');
}

function isSocialIconUrl(icon) {
    return validateUrl(icon);
}

function isValidSocialIconInput(icon) {
    const trimmed = (icon || '').trim();
    if (!trimmed) {
        return false;
    }

    if (validateUrl(trimmed)) {
        return true;
    }

    return sanitizeIconClass(trimmed, '') === trimmed;
}

function getSocialIconMarkup(definition, imageClass = 'social-icon-image') {
    const iconValue = definition?.icon || 'fas fa-link';
    const safeName = sanitizeInput(definition?.name || 'Social');

    if (isSocialIconUrl(iconValue)) {
        return `<img src="${sanitizeInput(iconValue)}" alt="${safeName}" class="${imageClass}" loading="lazy">`;
    }

    return `<i class="${iconValue}"></i>`;
}

function getSocialIconContainerClass(definition) {
    return isSocialIconUrl(definition?.icon) ? ' has-image-icon' : '';
}

function normalizeSocialDefinition(social, index = 0) {
    const safeName = social?.name?.trim() || `Social ${index + 1}`;
    return {
        id: social?.id || `social-${Date.now()}-${index}`,
        name: safeName,
        icon: normalizeSocialIcon(social?.icon)
    };
}

function getSocialDefinitionById(socialId) {
    return socialDefinitions.find(social => social.id === socialId);
}

const defaultClanMembers = [
    { id: 'cringekarl', name: 'CringeKarl', role: 'Anführer', accent: '#8b5cf6', icon: 'fas fa-crown', image: `${remotePhotosBaseUrl}CringeKarl.jpg`, bio: 'Clan-Gründer und einer der Hauptköpfe hinter den Projekten.' },
    { id: 'cringejuii', name: 'CringeJuii', role: 'Vize-Anführer', accent: '#ec4899', icon: 'fas fa-star', image: `${remotePhotosBaseUrl}Cringejuii.png`, bio: 'Organisiert Community-Aktionen und hält den Clan zusammen.' },
    { id: 'cringedonny', name: 'CringeDonny', role: 'Mitglied', accent: '#3b82f6', icon: 'fas fa-code', image: `${remotePhotosBaseUrl}Danny.jpg`, bio: 'Web- und Projektfokus, zuständig für technische Sachen.' },
    { id: 'cringekimi', name: 'CringeKimi', role: 'Dihless-Mitglied', accent: '#f472b6', icon: 'fas fa-moon', image: `${remotePhotosBaseUrl}Kimi.jpg`, bio: 'Teil der Dihless-Gruppe mit eigenem Stil und Vibe.' },
    { id: 'cringelolo', name: 'CringeLolo', role: 'Dihless-Mitglied', accent: '#fb7185', icon: 'fas fa-pencil-ruler', image: `${remotePhotosBaseUrl}Lolo.jpg`, bio: 'Kreativer Teil der Crew mit starkem Look und Wiedererkennungswert.' },
    { id: 'cringejen', name: 'CringeJen', role: 'Dihless-Mitglied', accent: '#f59e0b', icon: 'fas fa-guitar', image: `${remotePhotosBaseUrl}Jenny.jpg`, bio: 'Locker, kreativ und Teil der erweiterten Clan-Crew.' },
    { id: 'cringevio', name: 'CringeVio', role: 'Dihless-Mitglied', accent: '#a855f7', icon: 'fas fa-martini-glass', image: `${remotePhotosBaseUrl}Violetta.jpg`, bio: 'Bringt Persönlichkeit und eigenen Humor in die Gruppe.' },
    { id: 'cringeveit', name: 'CringeVeit', role: 'Mitglied', accent: '#6366f1', icon: 'fas fa-gamepad', image: `${remotePhotosBaseUrl}Veitr.jpg`, bio: 'Gaming- und Clan-Fokus mit eigenem Stil.' },
    { id: 'cringhamilton', name: 'CringeHamilton', role: 'Mitglied', accent: '#14b8a6', icon: 'fas fa-flag-checkered', image: `${remotePhotosBaseUrl}Cringehamiltonr.jpg`, bio: 'F1- und Clan-Vibes in einer Person.' }
];
let clanMembers = defaultClanMembers.map(member => ({ ...member }));

function getFutureDateISO(daysAhead = 7, hour = 18, minute = 0) {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
}

const defaultEvents = [
    {
        id: 'event-fabrik-night',
        title: 'Projekt Fabrik Bauabend',
        type: 'Minecraft Server',
        date: getFutureDateISO(3, 19, 30),
        description: 'Gemeinsamer Bauabend auf dem Fabrik-Server mit Stadtbau und kleinen Clan-Projekten.',
        location: 'Minecraft Server',
        hostId: 'cringekarl',
        link: 'https://discord.gg/pmZWDGFz'
    },
    {
        id: 'event-discord-meeting',
        title: 'Clan Talk im Discord',
        type: 'Community',
        date: getFutureDateISO(7, 20, 0),
        description: 'Kurzer Überblick über kommende Projekte, Server-Ideen und sonstige Clan-Pläne.',
        location: 'Discord Voice',
        hostId: 'cringejuii',
        link: 'https://discord.gg/pmZWDGFz'
    },
    {
        id: 'event-mod-update',
        title: 'Döner Kebab MC Update',
        type: 'Release',
        date: getFutureDateISO(12, 18, 0),
        description: 'Geplantes Update für die Mod mit neuen Items, Fixes und ein paar Extras.',
        location: 'Modrinth / Discord',
        hostId: 'cringedonny',
        link: 'https://modrinth.com/mod/dner-kebab-mod'
    }
];

function getMemberById(memberId) {
    return clanMembers.find(member => member.id === memberId) || clanMembers[0];
}

function normalizeEmail(email) {
    return (email || '').trim().toLowerCase();
}

function isFirebaseConfigured() {
    return Boolean(
        firebaseConfig.apiKey &&
        firebaseConfig.authDomain &&
        firebaseConfig.projectId &&
        firebaseConfig.appId &&
        !Object.values(firebaseConfig).some(value => String(value).includes('TODO_FIREBASE'))
    );
}

function getAuthorizedMemberByEmail(email) {
    const normalized = normalizeEmail(email);
    return clanMembers.find(member => normalizeEmail(member.email) === normalized) || null;
}

function isAdminEmail(email) {
    return ADMIN_EMAILS.includes(normalizeEmail(email));
}

function canManageAllContent() {
    return authState.role === 'admin';
}

function hasClanAccess() {
    return authState.role === 'admin' || authState.role === 'member';
}

function sanitizeTabPermissions(tabPermissions) {
    const allowedTabs = new Set(MEMBER_TAB_PERMISSION_OPTIONS.map(option => option.id));
    return Array.isArray(tabPermissions)
        ? [...new Set(tabPermissions.filter(tabId => allowedTabs.has(tabId)))]
        : [];
}

function getMemberTabPermissions(memberId = authState.memberId) {
    if (!memberId) {
        return [];
    }

    const member = clanMembers.find(entry => entry.id === memberId);
    return sanitizeTabPermissions(member?.tabPermissions);
}

function canAccessAdminTab(tabId) {
    if (authState.role === 'admin') {
        return true;
    }

    if (authState.role !== 'member') {
        return false;
    }

    if (tabId === 'members') {
        return true;
    }

    return getMemberTabPermissions().includes(tabId);
}

function getAvailableAdminTabs() {
    return ['projects', 'events', 'stats', 'settings', 'members', 'socials', 'internal', 'activity']
        .filter(tabId => canAccessAdminTab(tabId));
}

function getDefaultAdminTab() {
    return getAvailableAdminTabs()[0] || 'members';
}

function requireAdminTabAccess(tabId, customMessage = '') {
    if (canAccessAdminTab(tabId)) {
        return true;
    }

    showToast(customMessage || `Du hast keine Berechtigung fuer den Bereich ${tabId}`, 'error');
    return false;
}

function canSyncSharedContent() {
    return authState.role === 'admin' || (authState.role === 'member' && getMemberTabPermissions().length > 0);
}

function canEditMember(memberId) {
    return authState.role === 'admin' || (authState.role === 'member' && authState.memberId === memberId);
}

function requireAdminAccess() {
    if (canManageAllContent()) {
        return true;
    }

    showToast('Dafuer brauchst du Admin-Rechte', 'error');
    return false;
}

function updateAuthInterface() {
    const adminButtonText = document.querySelector('.admin-btn .btn-text');
    const authStatus = document.getElementById('authStatusMessage');
    const signOutButton = document.getElementById('authSignOutButton');
    const authIntro = document.getElementById('authModalIntro');
    const loginButton = document.getElementById('googleLoginButton');

    if (adminButtonText) {
        adminButtonText.textContent = authState.role === 'admin'
            ? 'Admin'
            : authState.role === 'member'
                ? 'Mein Profil'
                : 'Admin';
    }

    if (signOutButton) {
        signOutButton.classList.toggle('hidden', authState.role === 'guest');
    }

    if (authIntro) {
        authIntro.textContent = authState.role === 'guest'
            ? 'Melde dich mit Google an. Admins duerfen alles bearbeiten, Mitglieder nur ihr eigenes Profil.'
            : `Angemeldet als ${authState.email || 'unbekannt'}.`;
    }

    if (authStatus) {
        if (location.protocol === 'file:') {
            authStatus.textContent = 'Du hast die Seite per Datei geoeffnet (file://). Google-Login funktioniert nur ueber http(s). Starte einen lokalen Server (z.B. VS Code Live Server).';
        } else if (!isFirebaseConfigured()) {
            authStatus.textContent = 'Firebase-Konfiguration fehlt noch. Trage zuerst deine Firebase-Daten in script.js ein.';
        } else if (authState.role === 'admin') {
            authStatus.textContent = 'Admin-Zugang erkannt.';
        } else if (authState.role === 'member') {
            authStatus.textContent = 'Mitglieder-Zugang erkannt. Du kannst dein eigenes Profil bearbeiten.';
        } else {
            authStatus.textContent = 'Noch nicht angemeldet.';
        }
    }

    if (loginButton) {
        loginButton.disabled = location.protocol === 'file:' || !isFirebaseConfigured();
    }
}

function renderInternalContent() {
    const content = document.getElementById('memberAreaText');
    if (!content) {
        return;
    }

    const text = typeof settings.memberAreaText === 'string'
        ? settings.memberAreaText.trim()
        : '';

    content.textContent = text || 'Hier wurde noch kein interner Text hinterlegt.';
    content.classList.toggle('internal-content-empty', !text);
}

function renderMemberTabPermissions(member = null) {
    const container = document.getElementById('memberTabPermissions');
    if (!container) {
        return;
    }

    const selectedPermissions = new Set(sanitizeTabPermissions(member?.tabPermissions));
    const disabled = authState.role !== 'admin';

    container.innerHTML = MEMBER_TAB_PERMISSION_OPTIONS.map(option => `
        <label class="member-tab-permission-option ${disabled ? 'is-disabled' : ''}">
            <input
                type="checkbox"
                class="member-tab-permission-checkbox"
                value="${option.id}"
                ${selectedPermissions.has(option.id) ? 'checked' : ''}
                ${disabled ? 'disabled' : ''}
            >
            <span>${option.label}</span>
        </label>
    `).join('');
}

function collectMemberTabPermissions() {
    return Array.from(document.querySelectorAll('.member-tab-permission-checkbox:checked'))
        .map(input => input.value);
}

function activateAdminTab(tabId) {
    if (!canAccessAdminTab(tabId)) {
        tabId = getDefaultAdminTab();
    }

    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`.admin-tab[data-tab="${tabId}"]`)?.classList.add('active');
    document.getElementById(`${tabId}Tab`)?.classList.add('active');
}

function updateClanAccessView() {
    const hasAccess = hasClanAccess();

    document.querySelectorAll('[data-clan-auth="true"]').forEach(element => {
        element.classList.toggle('hidden', !hasAccess);
    });

    document.querySelectorAll('[data-admin-only="true"]').forEach(element => {
        element.classList.toggle('hidden', !canManageAllContent());
    });

    if (!hasAccess && document.getElementById('intern')?.classList.contains('active')) {
        switchClanTab('startseite');
    }
}

function applyPermissionView() {
    const adminTabs = document.querySelectorAll('.admin-tab');
    const membersTabButton = document.querySelector('.admin-tab[data-tab="members"]');
    const membersList = document.getElementById('adminMembersList');
    const memberEmailInput = document.getElementById('memberEmail');
    const memberPriorityInput = document.getElementById('memberPriority');
    const memberTabPermissions = document.querySelectorAll('.member-tab-permission-checkbox');
    const adminHeaderButtons = document.querySelectorAll('.admin-header-actions > button:not(#authSignOutButton)');

    updateClanAccessView();

    adminTabs.forEach(tab => {
        tab.classList.toggle('hidden', !canAccessAdminTab(tab.dataset.tab));
    });

    if (membersList) {
        membersList.classList.toggle('hidden', authState.role === 'member');
    }

    if (memberEmailInput) {
        memberEmailInput.disabled = authState.role !== 'admin';
    }

    if (memberPriorityInput) {
        memberPriorityInput.disabled = authState.role !== 'admin';
    }

    memberTabPermissions.forEach(input => {
        input.disabled = authState.role !== 'admin';
    });

    adminHeaderButtons.forEach(button => {
        button.classList.toggle('hidden', authState.role === 'member');
    });

    if (authState.role === 'member') {
        const activeTab = document.querySelector('.admin-tab.active')?.dataset.tab;
        activateAdminTab(activeTab && canAccessAdminTab(activeTab) ? activeTab : getDefaultAdminTab());

        if (authState.memberId) {
            editMember(authState.memberId);
        }
    } else if (authState.role === 'admin' && !document.querySelector('.admin-tab.active')) {
        membersTabButton?.classList.add('active');
        document.getElementById('membersTab')?.classList.add('active');
    }
}

function applyAuthState(user) {
    const email = normalizeEmail(user?.email);
    const matchedMember = getAuthorizedMemberByEmail(email);

    authState = {
        user,
        email,
        role: user ? (isAdminEmail(email) ? 'admin' : matchedMember ? 'member' : 'guest') : 'guest',
        memberId: matchedMember?.id || null
    };

    updateAuthInterface();
    applyPermissionView();

    if (user && authState.role === 'guest') {
        showToast('Diese Google-Adresse ist keinem Admin oder Mitglied zugeordnet', 'warning');
    }
}

function normalizeMember(member, index = 0) {
    const fallbackMember = defaultClanMembers[index % defaultClanMembers.length] || defaultClanMembers[0];
    const safeName = member?.name?.trim() || fallbackMember.name;
    const parsedPriority = Number.parseInt(member?.priority, 10);
    const socials = Array.isArray(member?.socials)
        ? member.socials
            .filter(entry => entry?.socialId && entry?.url && validateUrl(entry.url))
            .map(entry => ({ socialId: entry.socialId, url: entry.url.trim() }))
        : [];

    return {
        id: member?.id || fallbackMember.id || `member-${Date.now()}-${index}`,
        name: safeName,
        email: normalizeEmail(member?.email),
        role: member?.role?.trim() || fallbackMember.role || 'Mitglied',
        accent: member?.accent || fallbackMember.accent || '#818cf8',
        icon: sanitizeIconClass(member?.icon || fallbackMember.icon, 'fas fa-user'),
        image: normalizeImageUrl(member?.image || fallbackMember.image || ''),
        bio: member?.bio?.trim() || fallbackMember.bio || '',
        priority: Number.isFinite(parsedPriority) && parsedPriority > 0 ? parsedPriority : index + 1,
        tabPermissions: sanitizeTabPermissions(member?.tabPermissions),
        initials: safeName.slice(0, 2).toUpperCase(),
        socials
    };
}

function getSortedClanMembers(members = clanMembers) {
    return [...members].sort((a, b) => {
        const priorityA = Number.isFinite(a?.priority) ? a.priority : Number.MAX_SAFE_INTEGER;
        const priorityB = Number.isFinite(b?.priority) ? b.priority : Number.MAX_SAFE_INTEGER;

        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        return (a?.name || '').localeCompare(b?.name || '', 'de');
    });
}

function getMemberAvatarMarkup(member, className = 'member-avatar') {
    if (member.image) {
        return `<img src="${member.image}" alt="${sanitizeInput(member.name)}" class="${className}" loading="lazy">`;
    }

    return `
        <div class="${className} member-avatar-fallback" style="--member-color: ${member.accent};">
            ${member.initials || member.name.slice(0, 2).toUpperCase()}
        </div>
    `;
}

function getMemberSocialLinksMarkup(member) {
    const socials = Array.isArray(member.socials) ? member.socials : [];
    const visibleSocials = socials
        .map(entry => ({ entry, definition: getSocialDefinitionById(entry.socialId) }))
        .filter(item => item.definition && validateUrl(item.entry.url));

    if (!visibleSocials.length) {
        return '';
    }

    return `
        <div class="member-social-links">
            ${visibleSocials.map(({ entry, definition }) => `
                    <a href="${entry.url}" target="_blank" rel="noreferrer noopener" class="member-social-link${getSocialIconContainerClass(definition)}" title="${sanitizeInput(definition.name)}" aria-label="${sanitizeInput(definition.name)}">
                        ${getSocialIconMarkup(definition)}
                </a>
            `).join('')}
        </div>
    `;
}

function renderMemberSocialAssignments(member = null) {
    const container = document.getElementById('memberSocialAssignments');
    if (!container) return;

    if (!socialDefinitions.length) {
        container.innerHTML = '<p class="member-social-empty">Noch keine Social-Bausteine vorhanden. Lege sie zuerst im Social-Tab an.</p>';
        return;
    }

    const socialMap = new Map((member?.socials || []).map(entry => [entry.socialId, entry.url]));

    container.innerHTML = socialDefinitions.map(definition => {
        const existingUrl = socialMap.get(definition.id) || '';
        const enabled = Boolean(existingUrl);

        return `
            <div class="member-social-assignment ${enabled ? 'active' : ''}" data-social-id="${definition.id}">
                <label class="member-social-assignment-header">
                    <span class="member-social-label">
                        <input type="checkbox" class="member-social-enabled" data-social-id="${definition.id}" ${enabled ? 'checked' : ''}>
                        <span class="member-social-badge${getSocialIconContainerClass(definition)}">${getSocialIconMarkup(definition)}</span>
                        <span>${sanitizeInput(definition.name)}</span>
                    </span>
                </label>
                <input
                    type="url"
                    class="member-social-url ${enabled ? '' : 'hidden'}"
                    data-social-id="${definition.id}"
                    placeholder="https://..."
                    value="${sanitizeInput(existingUrl)}"
                >
            </div>
        `;
    }).join('');
}

function collectMemberSocialAssignments() {
    const container = document.getElementById('memberSocialAssignments');
    if (!container) return [];

    const socials = [];
    container.querySelectorAll('.member-social-assignment').forEach(row => {
        const socialId = row.dataset.socialId;
        const enabled = row.querySelector('.member-social-enabled')?.checked;
        const url = row.querySelector('.member-social-url')?.value.trim();

        if (!enabled) {
            return;
        }

        if (!url || !validateUrl(url)) {
            throw new Error('invalid_member_social_url');
        }

        socials.push({ socialId, url });
    });

    return socials;
}

function getMemberOptionsHtml(selectedId = '') {
    return getSortedClanMembers().map(member => `
        <option value="${member.id}" ${member.id === selectedId ? 'selected' : ''}>${member.name} (${member.role})</option>
    `).join('');
}

function populateMemberSelects() {
    const projectMember = document.getElementById('projectMember');
    const editProjectMember = document.getElementById('editProjectMember');
    const eventHost = document.getElementById('eventHost');

    if (projectMember) {
        projectMember.innerHTML = getMemberOptionsHtml('cringekarl');
    }

    if (editProjectMember) {
        editProjectMember.innerHTML = getMemberOptionsHtml();
    }

    if (eventHost) {
        eventHost.innerHTML = getMemberOptionsHtml('cringekarl');
    }
}

function normalizeProject(project, index = 0) {
    const ownerId = project.ownerId || project.memberId || project.owner || project.member || clanMembers[index % clanMembers.length].id;
    const primaryPlatform = project.platform || 'other';
    const primaryUrl = project.url || 'https://discord.gg/pmZWDGFz';
    const platforms = Array.isArray(project.platforms) && project.platforms.length
        ? project.platforms
        : [{ platform: primaryPlatform, url: primaryUrl }];

    return {
        ...project,
        ownerId,
        type: project.type || project.category || 'other',
        description: project.description || 'Noch keine Beschreibung vorhanden.',
        image: project.image || '',
        downloads: project.downloads || 0,
        tags: Array.isArray(project.tags) ? project.tags : [],
        featured: Boolean(project.featured),
        views: project.views || 0,
        createdAt: project.createdAt || project.created || new Date().toISOString(),
        platforms: platforms.map(platform => ({
            platform: platform.platform || 'other',
            url: platform.url || '',
            label: platform.label || platform.customName || ''
        }))
    };
}

function normalizeEvent(event, index = 0) {
    const fallbackMember = clanMembers[index % clanMembers.length] || clanMembers[0];

    return {
        id: event.id || `event-${Date.now()}-${index}`,
        title: event.title?.trim() || 'Unbenanntes Ereignis',
        type: event.type?.trim() || 'Ereignis',
        date: event.date || getFutureDateISO(7 + index, 19, 0),
        description: event.description?.trim() || 'Noch keine Beschreibung vorhanden.',
        location: event.location?.trim() || 'Wird noch bekannt gegeben',
        hostId: event.hostId || fallbackMember?.id || 'cringekarl',
        link: event.link || 'https://discord.gg/pmZWDGFz'
    };
}

function formatDateTimeLocalValue(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function getUpcomingEvents() {
    const now = Date.now();
    return events
        .filter(event => new Date(event.date).getTime() >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function getPlatformDisplayName(platform) {
    if (platform?.label?.trim()) {
        return platform.label.trim();
    }

    const config = platformConfig[platform?.platform] || platformConfig.other;
    return config.name;
}

function getPlatformVisual(platform) {
    const config = platformConfig[platform?.platform] || platformConfig.other;
    return {
        name: getPlatformDisplayName(platform),
        icon: config.icon,
        color: config.color
    };
}

function getPlatformSelectOptions(selectedValue = '') {
    return `
        <option value="">Plattform wählen</option>
        <option value="github" ${selectedValue === 'github' ? 'selected' : ''}>GitHub</option>
        <option value="modrinth" ${selectedValue === 'modrinth' ? 'selected' : ''}>Modrinth</option>
        <option value="curseforge" ${selectedValue === 'curseforge' ? 'selected' : ''}>CurseForge</option>
        <option value="other" ${selectedValue === 'other' ? 'selected' : ''}>Andere</option>
        <option value="custom" ${selectedValue === 'custom' ? 'selected' : ''}>Eigener Name</option>
    `;
}

function createPlatformRowHtml({ selectedValue = '', url = '', label = '' } = {}) {
    return `
        <select class="additional-platform-select">
            ${getPlatformSelectOptions(selectedValue)}
        </select>
        <input type="text" class="additional-platform-name ${selectedValue === 'custom' ? '' : 'hidden'}" placeholder="Eigener Plattformname" value="${sanitizeInput(label)}">
        <input type="url" class="additional-platform-url" placeholder="URL eingeben" value="${sanitizeInput(url)}">
        <button type="button" class="btn-icon btn-remove" onclick="removePlatformLink(this)" title="Entfernen">
            <i class="fas fa-times"></i>
        </button>
    `;
}

function syncPlatformNameField(selectElement) {
    const row = selectElement.closest('.platform-link-row') || selectElement.closest('.form-group') || selectElement.parentElement;
    if (!row) return;

    const customInput = row.querySelector('.additional-platform-name, .platform-custom-name');
    if (!customInput) return;

    const isCustom = selectElement.value === 'custom';
    customInput.classList.toggle('hidden', !isCustom);
    customInput.required = isCustom;

    if (!isCustom) {
        customInput.value = '';
    }
}

function getPlatformData(selectElement, urlElement, customNameElement) {
    const platform = selectElement.value.trim();
    const urlValue = urlElement.value.trim();
    const label = customNameElement ? customNameElement.value.trim() : '';

    if (!platform || !urlValue || !validateUrl(urlValue)) {
        return null;
    }

    if (platform === 'custom' && !label) {
        return null;
    }

    return {
        platform: platform === 'custom' ? 'other' : platform,
        url: urlValue,
        label: platform === 'custom' ? label : ''
    };
}

// Project Templates
const projectTemplates = {
    github: {
        platform: 'github',
        description: 'Ein GitHub Projekt mit Open-Source Code',
        tags: ['opensource', 'github', 'development']
    },
    modrinth: {
        platform: 'modrinth',
        description: 'Ein Minecraft Mod veröffentlicht auf Modrinth',
        tags: ['minecraft', 'mod', 'gaming']
    },
    curseforge: {
        platform: 'curseforge',
        description: 'Ein Minecraft Mod veröffentlicht auf CurseForge',
        tags: ['minecraft', 'mod', 'curseforge']
    },
    tool: {
        platform: 'other',
        description: 'Ein nützliches Tool für verschiedene Zwecke',
        tags: ['tool', 'utility', 'helper']
    }
};

// ========================================
// ENHANCED DATA OPERATIONS
// ========================================

function getDefaultProjects() {
    return [
        {
            id: 1,
            ownerId: 'cringekarl',
            name: 'Projekt Fabrik',
            description: 'Unser Minecraft Server in Version 1.16.5 mit Städten, Events und kleinen Bauprojekten.',
            type: 'mcserver',
            platforms: [{ platform: 'other', url: 'https://discord.gg/pmZWDGFz' }],
            image: '',
            downloads: 1165,
            tags: ['minecraft', 'server', 'community'],
            featured: true,
            views: 50,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            ownerId: 'cringejuii',
            name: 'Monatliches Döneressen',
            description: 'Der feste Community-Treff fuer Clan-Mitglieder, Updates und Running Gags.',
            type: 'other',
            platforms: [{ platform: 'other', url: 'https://discord.gg/pmZWDGFz' }],
            image: '',
            downloads: 12,
            tags: ['event', 'community', 'treffen'],
            featured: false,
            views: 120,
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            ownerId: 'cringedonny',
            name: 'Döner Kebab MC',
            description: 'Eine Mod, die Döner Kebab in deine Welt bringt.',
            type: 'mod',
            platforms: [{ platform: 'modrinth', url: 'https://modrinth.com/mod/dner-kebab-mod' }],
            image: '',
            downloads: 420,
            tags: ['minecraft', 'mod', 'doener'],
            featured: true,
            views: 180,
            createdAt: new Date().toISOString()
        },
        {
            id: 4,
            ownerId: 'cringedonny',
            name: 'Cringeclan Website',
            description: 'Die zentrale Website fuer Mitglieder, Projekte, Kontakt und Discord.',
            type: 'app',
            platforms: [{ platform: 'github', url: 'https://github.com/karlali' }],
            image: '',
            downloads: 95,
            tags: ['website', 'clan', 'frontend'],
            featured: false,
            views: 65,
            createdAt: new Date().toISOString()
        }
    ].map((project, index) => normalizeProject(project, index));
}

function getDefaultStats() {
    return {
        downloads: 350,
        community: 150,
        views: 1000,
        featured: 1
    };
}

function applySettingsDefaults() {
    if (!settings.siteTitle || settings.siteTitle === 'Karlali - Creator') {
        settings.siteTitle = 'CRINGECLAN';
    }

    if (!settings.siteDescription || settings.siteDescription.includes('Karlali - Creator')) {
        settings.siteDescription = 'CRINGECLAN - Projekte, Mitglieder und Community an einem Ort.';
    }

    if (typeof settings.memberAreaText !== 'string') {
        settings.memberAreaText = 'Hier koennen interne Infos, Hinweise oder kleine Clan-Updates stehen.';
    }
}

function persistLocalData() {
    localStorage.setItem('karlali_projects', JSON.stringify(projects));
    localStorage.setItem('karlali_events', JSON.stringify(events));
    localStorage.setItem('karlali_stats', JSON.stringify(stats));
    localStorage.setItem('karlali_settings', JSON.stringify(settings));
    localStorage.setItem('karlali_members', JSON.stringify(clanMembers));
    localStorage.setItem('karlali_social_definitions', JSON.stringify(socialDefinitions));
    localStorage.setItem('karlali_activity', JSON.stringify(activityLog));
    localStorage.setItem('karlali_newsletter', JSON.stringify(newsletterSubscribers));
    localStorage.setItem('karlali_backups', JSON.stringify(backups));
    localStorage.setItem('karlali_updates', JSON.stringify(updates));
}

function applyRemoteDataToState(remoteData) {
    if (!remoteData) {
        return;
    }

    const content = remoteData.content || {};

    if (Array.isArray(remoteData.members) && remoteData.members.length) {
        clanMembers = remoteData.members.map((member, index) => normalizeMember(member, index));
    }

    if (Array.isArray(content.socialDefinitions) && content.socialDefinitions.length) {
        socialDefinitions = content.socialDefinitions.map((social, index) => normalizeSocialDefinition(social, index));
    }

    if (Array.isArray(content.projects) && content.projects.length) {
        projects = content.projects.map((project, index) => normalizeProject(project, index));
    }

    if (Array.isArray(content.events) && content.events.length) {
        events = content.events.map((event, index) => normalizeEvent(event, index));
    }

    if (content.stats) {
        stats = content.stats;
    }

    if (content.settings) {
        settings = {
            ...settings,
            ...content.settings
        };
    }

    if (Array.isArray(content.activityLog)) {
        activityLog = content.activityLog;
    }

    if (Array.isArray(content.newsletterSubscribers)) {
        newsletterSubscribers = content.newsletterSubscribers;
    }

    if (Array.isArray(content.backups)) {
        backups = content.backups;
    }

    if (Array.isArray(content.updates)) {
        updates = content.updates;
    }

    applySettingsDefaults();
}

async function loadRemoteDataFromFirestore() {
    if (!firebaseDb) {
        return null;
    }

    try {
        const [contentDoc, membersSnapshot] = await Promise.all([
            firebaseDb.collection(FIRESTORE_CONTENT_COLLECTION).doc(FIRESTORE_CONTENT_DOC).get(),
            firebaseDb.collection(FIRESTORE_MEMBERS_COLLECTION).get()
        ]);

        return {
            content: contentDoc.exists ? contentDoc.data() : null,
            members: membersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
        };
    } catch (error) {
        if (error?.code === 'permission-denied') {
            if (!firestorePermissionWarned) {
                firestorePermissionWarned = true;
                showToast('Firestore: Missing or insufficient permissions (Rules pruefen)', 'warning');
            }
            return null;
        }

        console.error('Error loading remote Firestore data:', error);
        return null;
    }
}

function getServerTimestamp() {
    return window.firebase?.firestore?.FieldValue?.serverTimestamp
        ? firebase.firestore.FieldValue.serverTimestamp()
        : new Date().toISOString();
}

async function syncAllSiteDataToFirestore() {
    if (!firebaseDb || !canSyncSharedContent()) {
        return;
    }

    const contentPayload = {
        projects,
        events,
        stats,
        settings,
        socialDefinitions,
        activityLog,
        newsletterSubscribers,
        backups,
        updates,
        updatedAt: getServerTimestamp()
    };

    await firebaseDb.collection(FIRESTORE_CONTENT_COLLECTION).doc(FIRESTORE_CONTENT_DOC).set(contentPayload, { merge: true });

    const membersCollection = firebaseDb.collection(FIRESTORE_MEMBERS_COLLECTION);
    const existingMembersSnapshot = await membersCollection.get();
    const batch = firebaseDb.batch();
    const currentMemberIds = new Set(clanMembers.map(member => member.id));

    existingMembersSnapshot.forEach(doc => {
        if (!currentMemberIds.has(doc.id)) {
            batch.delete(doc.ref);
        }
    });

    clanMembers.forEach(member => {
        batch.set(membersCollection.doc(member.id), {
            ...member,
            updatedAt: getServerTimestamp()
        }, { merge: true });
    });

    await batch.commit();
}

async function syncCurrentMemberToFirestore() {
    if (!firebaseDb || authState.role !== 'member' || !authState.memberId) {
        return;
    }

    const member = clanMembers.find(entry => entry.id === authState.memberId);
    if (!member) {
        return;
    }

    await firebaseDb.collection(FIRESTORE_MEMBERS_COLLECTION).doc(member.id).set({
        ...member,
        updatedAt: getServerTimestamp()
    }, { merge: true });
}

async function saveDataToFirestore() {
    if (!firebaseDb || authState.role === 'guest') {
        return;
    }

    try {
        if (canSyncSharedContent()) {
            await syncAllSiteDataToFirestore();
        } else if (authState.role === 'member') {
            await syncCurrentMemberToFirestore();
        }
    } catch (error) {
        const code = error?.code || 'unknown';
        console.error('Error saving Firestore data:', { code, error, authState });

        if (code === 'permission-denied') {
            showToast('Firestore verweigert Zugriff (permission-denied) – Rules pruefen', 'error');
            return;
        }

        if (code === 'unauthenticated') {
            showToast('Nicht eingeloggt (unauthenticated) – bitte neu anmelden', 'error');
            return;
        }

        showToast(`Firestore-Speicherung fehlgeschlagen (${code})`, 'error');
    }
}

function refreshAppUI() {
    populateMemberSelects();
    loadProjects();
    renderMembersOverview();
    renderEventsOverview();
    renderInternalContent();
    updateStatsDisplay();
    loadAdminProjects();
    loadAdminEvents();
    loadAdminMembers();
    loadAdminSocials();
    loadAdminStats();
    loadActivityLog();
    loadSettings();
    updateAuthInterface();
    applyPermissionView();

    document.title = settings.siteTitle;
    document.querySelector('.nav-logo').textContent = settings.siteTitle.split(' - ')[0];
}

async function loadData() {
    try {
        const savedProjects = localStorage.getItem('karlali_projects');
        const savedStats = localStorage.getItem('karlali_stats');
        const savedSettings = localStorage.getItem('karlali_settings');
        const savedMembers = localStorage.getItem('karlali_members');
        const savedSocialDefinitions = localStorage.getItem('karlali_social_definitions');
        const savedEvents = localStorage.getItem('karlali_events');
        const savedActivity = localStorage.getItem('karlali_activity');
        const savedNewsletter = localStorage.getItem('karlali_newsletter');
        const savedBackups = localStorage.getItem('karlali_backups');
        const savedUpdates = localStorage.getItem('karlali_updates');

        if (savedMembers) {
            clanMembers = JSON.parse(savedMembers).map((member, index) => normalizeMember(member, index));
        } else {
            clanMembers = defaultClanMembers.map((member, index) => normalizeMember(member, index));
            localStorage.setItem('karlali_members', JSON.stringify(clanMembers));
        }

        if (savedSocialDefinitions) {
            socialDefinitions = JSON.parse(savedSocialDefinitions).map((social, index) => normalizeSocialDefinition(social, index));
        } else {
            socialDefinitions = defaultSocialDefinitions.map((social, index) => normalizeSocialDefinition(social, index));
            localStorage.setItem('karlali_social_definitions', JSON.stringify(socialDefinitions));
        }

        if (savedProjects) {
            projects = JSON.parse(savedProjects).map((project, index) => normalizeProject(project, index));
        } else {
            projects = getDefaultProjects();
        }

        if (savedEvents) {
            events = JSON.parse(savedEvents).map((event, index) => normalizeEvent(event, index));
        } else {
            events = defaultEvents.map((event, index) => normalizeEvent(event, index));
        }
        
        if (savedStats) {
            stats = JSON.parse(savedStats);
        } else {
            stats = getDefaultStats();
        }
        
        if (savedSettings) {
            settings = JSON.parse(savedSettings);
            applySettingsDefaults();
            applyTheme(settings.theme);
        }
        
        if (savedActivity) {
            activityLog = JSON.parse(savedActivity);
        }
        
        if (savedNewsletter) {
            newsletterSubscribers = JSON.parse(savedNewsletter);
        }
        
        if (savedBackups) {
            backups = JSON.parse(savedBackups);
        }
        
        if (savedUpdates) {
            updates = JSON.parse(savedUpdates);
        }

        persistLocalData();

        const remoteData = await loadRemoteDataFromFirestore();
        if (remoteData?.content || (Array.isArray(remoteData?.members) && remoteData.members.length)) {
            applyRemoteDataToState(remoteData);
            persistLocalData();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Fehler beim Laden der Daten', 'error');
    }
    
    // Load Discord updates
    loadDiscordUpdates();
}

function saveData() {
    try {
        persistLocalData();
        void saveDataToFirestore();
    } catch (error) {
        console.error('Error saving data:', error);
        showToast('Fehler beim Speichern der Daten', 'error');
    }
}

function logActivity(action, details) {
    if (!settings.enableAuditLog) return;
    
    const logEntry = {
        id: Date.now(),
        action,
        details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: 'client-side' // In real app, this would come from server
    };
    activityLog.unshift(logEntry);
    
    // Keep only last 100 entries
    if (activityLog.length > 100) {
        activityLog = activityLog.slice(0, 100);
    }
    
    saveData();
    
    // Send Discord webhook if enabled
    if (settings.discordWebhook && shouldNotifyDiscord(action)) {
        sendDiscordNotification(logEntry);
    }
}

function shouldNotifyDiscord(action) {
    if (action === 'project_add' && settings.discordNotifyNewProject) return true;
    if (action === 'project_edit' && settings.discordNotifyUpdate) return true;
    return false;
}

// ========================================
// ENHANCED THEME MANAGEMENT
// ========================================

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    settings.theme = theme;
    
    const themeIcon = document.querySelector('#themeToggle i');
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-moon';
    } else if (theme === 'light') {
        themeIcon.className = 'fas fa-sun';
    } else if (theme === 'high-contrast') {
        themeIcon.className = 'fas fa-adjust';
    }
    
    saveData();
}

function toggleTheme() {
    const currentTheme = settings.theme;
    let newTheme;
    
    if (currentTheme === 'dark') {
        newTheme = 'light';
    } else if (currentTheme === 'light') {
        newTheme = 'high-contrast';
    } else {
        newTheme = 'dark';
    }
    
    applyTheme(newTheme);
    showToast(`Theme gewechselt zu ${newTheme}`, 'info');
    logActivity('theme_change', `Changed theme to ${newTheme}`);
}

// ========================================
// ENHANCED TOAST NOTIFICATIONS
// ========================================

function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="${icons[type]}"></i>
        <span>${sanitizeInput(message)}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, duration);
}

// ========================================
// SECURITY & VALIDATION
// ========================================

function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function validateUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function normalizeGitHubImageUrl(url) {
    const trimmed = (url || '').trim();
    if (!trimmed || !validateUrl(trimmed)) {
        return trimmed;
    }

    try {
        const parsed = new URL(trimmed);

        if (parsed.hostname === 'raw.githubusercontent.com') {
            return parsed.toString();
        }

        if (parsed.hostname === 'github.com') {
            const pathParts = parsed.pathname.split('/').filter(Boolean);
            const isBlobOrTree = pathParts[2] === 'blob' || pathParts[2] === 'tree';

            if (pathParts.length >= 6 && isBlobOrTree) {
                const [owner, repo, , branch, ...restPath] = pathParts;
                return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${restPath.join('/')}`;
            }
        }

        return parsed.toString();
    } catch {
        return trimmed;
    }
}

function normalizeImageUrl(url) {
    return normalizeGitHubImageUrl(url);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function formatMoreThanValue(value) {
    return `>${(Number(value) || 0).toLocaleString('de-DE')}`;
}

function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
    return strength;
}

function getPasswordStrengthLabel(strength) {
    const labels = ['Sehr schwach', 'Schwach', 'Mittel', 'Stark', 'Sehr stark'];
    return labels[strength] || 'Kein Passwort';
}

// ========================================
// MOBILE MENU
// ========================================

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
}

// ========================================
// SCROLL PROGRESS & BACK TO TOP
// ========================================

function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    
    document.getElementById('scrollProgress').style.width = `${progress}%`;
}

function handleBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ========================================
// ENHANCED SEARCH & FILTER
// ========================================

function filterProjects() {
    const searchTerm = searchQuery.toLowerCase();
    
    let filtered = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm) ||
                             project.description.toLowerCase().includes(searchTerm) ||
                             (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
        // Filter by project type instead of platform
        const matchesFilter = currentFilter === 'all' || project.type === currentFilter;
        return matchesSearch && matchesFilter;
    });
    
    // Sort projects
    switch (currentSort) {
        case 'newest':
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'downloads':
            filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }
    
    return filtered;
}

function handleSearch(e) {
    searchQuery = e.target.value;
    loadProjects();
}

function handleFilter(e) {
    if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        loadProjects();
    }
}

function handleSort(e) {
    currentSort = e.target.value;
    loadProjects();
}

function toggleViewMode() {
    const grid = document.getElementById('projectsGrid');
    const btn = document.getElementById('viewToggle');
    const icon = btn.querySelector('i');
    
    if (viewMode === 'grid') {
        viewMode = 'list';
        grid.classList.add('list-view');
        grid.classList.remove('masonry');
        icon.className = 'fas fa-list';
    } else if (viewMode === 'list') {
        viewMode = 'masonry';
        grid.classList.remove('list-view');
        grid.classList.add('masonry');
        icon.className = 'fas fa-th-large';
    } else {
        viewMode = 'grid';
        grid.classList.remove('list-view');
        grid.classList.remove('masonry');
        icon.className = 'fas fa-th';
    }
    
    showToast(`Ansicht: ${viewMode}`, 'info');
}

// ========================================
// ENHANCED PROJECT OPERATIONS
// ========================================

function addProjectToGrid(project, targetGrid = null) {
    const grid = targetGrid || document.getElementById('projectsGrid');
    if (!grid) return;
    const card = document.createElement('div');
    card.className = `project-card ${project.featured ? 'featured' : ''}`;
    card.dataset.projectId = project.id;
    
    // Use project type config for styling
    const typeConfig = projectTypeConfig[project.type] || projectTypeConfig.other;
    const owner = getMemberById(project.ownerId);
    const imageUrl = project.image || 'https://via.placeholder.com/400x200/6366f1/ffffff?text=Project';
    const tags = project.tags && project.tags.length ? `
        <div class="project-tags">
            ${project.tags.map(tag => `<span class="project-tag">#${sanitizeInput(tag)}</span>`).join('')}
        </div>
    ` : '';
    const views = project.views ? `<span><i class="fas fa-eye"></i> ${project.views}</span>` : '';
    
    // Handle multiple platform links
    const platforms = project.platforms && project.platforms.length ? project.platforms : [];
    
    const platformBadges = platforms.map(p => {
        const platformVisual = getPlatformVisual(p);
        return `<span class="project-platform" style="background: ${platformVisual.color}; opacity: 0.8;">
                    <i class="${platformVisual.icon}"></i> ${sanitizeInput(platformVisual.name)}
                </span>`;
    }).join('');
    
    const platformLinks = platforms.map(p => {
        const platformVisual = getPlatformVisual(p);
        return `<a href="${p.url}" target="_blank" rel="noopener noreferrer" class="project-link" onclick="trackProjectView(${project.id})" title="${sanitizeInput(platformVisual.name)}">
                    <i class="${platformVisual.icon}"></i> ${sanitizeInput(platformVisual.name)}
                </a>`;
    }).join('');
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${sanitizeInput(project.name)}" class="project-image" loading="lazy" onerror="this.src='https://via.placeholder.com/400x200/6366f1/ffffff?text=Project'">
        <div class="project-content">
            <div class="project-owner" style="--owner-color: ${owner.accent};">
                <span class="project-owner-avatar-wrap">
                    ${getMemberAvatarMarkup(owner, 'project-owner-avatar')}
                </span>
                <span>${sanitizeInput(owner.name)}</span>
            </div>
            <h3 class="project-title">${sanitizeInput(project.name)}</h3>
            <span class="project-type" style="background: ${typeConfig.color}">
                <i class="${typeConfig.icon}"></i> ${typeConfig.name}
            </span>
            <div class="project-platforms-badges">
                ${platformBadges}
            </div>
            <p class="project-description">${sanitizeInput(project.description)}</p>
            ${tags}
            <div class="project-stats">
                <span><i class="fas fa-download"></i> ${formatMoreThanValue(project.downloads)}</span>
                ${views}
            </div>
            <div class="project-actions">
                <button class="project-action-btn" onclick="shareProject(${project.id})" title="Teilen">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="project-action-btn" onclick="showQRCode(${project.id})" title="QR Code">
                    <i class="fas fa-qrcode"></i>
                </button>
            </div>
            <div class="project-links">
                ${platformLinks}
            </div>
        </div>
    `;
    
    grid.appendChild(card);
}

function loadProjects() {
    const grid = document.getElementById('projectsGrid');
    const emptyState = document.getElementById('emptyState');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const filteredProjects = filterProjects();
    
    if (filteredProjects.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
        }
    } else {
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        filteredProjects.forEach(project => {
            addProjectToGrid(project);
        });
    }
    
    renderMembersOverview();

    const heroProjectCount = document.getElementById('heroProjectCount');
    const heroDownloadCount = document.getElementById('heroDownloadCount');
    const heroPlatformCount = document.getElementById('heroPlatformCount');

    const totalDownloads = projects.reduce((sum, p) => sum + (p.downloads || 0), 0);
    const platforms = new Set(projects.flatMap(project => (project.platforms || []).map(platform => getPlatformDisplayName(platform))));

    if (heroProjectCount) {
        heroProjectCount.textContent = projects.length;
    }

    if (heroDownloadCount) {
        heroDownloadCount.textContent = formatMoreThanValue(totalDownloads);
    }

    if (heroPlatformCount) {
        heroPlatformCount.textContent = platforms.size;
    }
}

function renderMembersOverview() {
    const membersGrid = document.getElementById('membersGrid');
    if (!membersGrid) return;

    membersGrid.innerHTML = '';

    getSortedClanMembers().forEach(member => {
        const ownedProjects = projects.filter(project => project.ownerId === member.id);
        const card = document.createElement('article');
        card.className = 'member-overview-card';
        card.style.setProperty('--member-accent', member.accent || '#dc143c');
        card.innerHTML = `
            <div class="member-overview-image-wrap">
                ${getMemberAvatarMarkup(member, 'member-overview-image')}
            </div>
            <div class="member-overview-copy">
                <p class="member-overview-role">${sanitizeInput(member.role)}</p>
                <h3>${sanitizeInput(member.name)}</h3>
                ${member.bio ? `<p class="member-overview-bio">${sanitizeInput(member.bio)}</p>` : ''}
                <div class="member-overview-footer">
                    ${ownedProjects.length ? `<p class="member-project-summary">${ownedProjects.length} Projekt${ownedProjects.length === 1 ? '' : 'e'} verknuepft</p>` : ''}
                    ${buildMemberProjectLinksMarkup(ownedProjects)}
                    ${getMemberSocialLinksMarkup(member)}
                </div>
            </div>
        `;
        membersGrid.appendChild(card);
    });
}

function buildMemberProjectLinksMarkup(ownedProjects) {
    if (!ownedProjects.length) {
        return '';
    }

    return `
        <div class="member-project-links">
            ${ownedProjects.map(project => `
                <button type="button" class="member-project-link" data-project-id="${sanitizeInput(String(project.id))}">
                    ${sanitizeInput(project.name)}
                </button>
            `).join('')}
        </div>
    `;
}

function focusProjectFromMember(projectId) {
    const project = projects.find(entry => String(entry.id) === String(projectId));
    if (!project) {
        return;
    }

    currentFilter = 'all';
    searchQuery = project.name;

    const searchInput = document.getElementById('projectSearch');
    if (searchInput) {
        searchInput.value = project.name;
    }

    document.querySelectorAll('.filter-btn').forEach(button => {
        button.classList.toggle('active', button.dataset.filter === 'all');
    });

    switchClanTab('projekte');
    loadProjects();

    requestAnimationFrame(() => {
        const projectCard = document.querySelector(`.project-card[data-project-id="${CSS.escape(String(project.id))}"]`);
        if (!projectCard) {
            return;
        }

        projectCard.classList.add('project-card-focused');
        projectCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => projectCard.classList.remove('project-card-focused'), 2200);
    });
}

function renderEventsOverview() {
    const eventsGrid = document.getElementById('eventsGrid');
    const emptyState = document.getElementById('eventsEmptyState');
    if (!eventsGrid) return;

    const upcomingEvents = getUpcomingEvents();
    eventsGrid.innerHTML = '';

    if (!upcomingEvents.length) {
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        return;
    }

    if (emptyState) {
        emptyState.style.display = 'none';
    }

    upcomingEvents.forEach(event => {
        const host = getMemberById(event.hostId);
        const date = new Date(event.date);
        const article = document.createElement('article');
        article.className = 'event-card';
        article.innerHTML = `
            <div class="event-card-header">
                <span class="event-type">${sanitizeInput(event.type)}</span>
                <span class="event-date">${date.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
            <h3>${sanitizeInput(event.title)}</h3>
            <p class="event-description">${sanitizeInput(event.description)}</p>
            <div class="event-meta">
                <span><i class="fas fa-clock"></i> ${date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</span>
                <span><i class="fas fa-location-dot"></i> ${sanitizeInput(event.location)}</span>
            </div>
            <div class="event-host">
                <span class="project-owner-avatar-wrap">
                    ${getMemberAvatarMarkup(host, 'project-owner-avatar')}
                </span>
                <span>Organisiert von ${sanitizeInput(host.name)}</span>
            </div>
            <div class="event-actions">
                <a href="${event.link}" target="_blank" rel="noreferrer noopener" class="btn btn-secondary">Mehr dazu</a>
            </div>
        `;
        eventsGrid.appendChild(article);
    });
}

function trackProjectView(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        project.views = (project.views || 0) + 1;
        stats.views++;
        saveData();
    }
}

// ========================================
// BULK ACTIONS
// ========================================

function selectAllProjects() {
    if (!requireAdminTabAccess('projects', 'Du darfst keine Projekte bearbeiten')) {
        return;
    }

    selectedProjects = projects.map(p => p.id);
    updateAdminProjectSelection();
    showToast('Alle Projekte ausgewählt', 'info');
}

function deselectAllProjects() {
    if (!requireAdminTabAccess('projects', 'Du darfst keine Projekte bearbeiten')) {
        return;
    }

    selectedProjects = [];
    updateAdminProjectSelection();
    showToast('Auswahl aufgehoben', 'info');
}

function updateAdminProjectSelection() {
    document.querySelectorAll('.admin-project-item').forEach(item => {
        const checkbox = item.querySelector('.project-select');
        if (checkbox) {
            const projectId = parseInt(checkbox.value);
            checkbox.checked = selectedProjects.includes(projectId);
        }
    });
}

function bulkDeleteProjects() {
    if (!requireAdminTabAccess('projects', 'Du darfst keine Projekte bearbeiten')) {
        return;
    }

    if (selectedProjects.length === 0) {
        showToast('Keine Projekte ausgewählt', 'warning');
        return;
    }
    
    if (confirm(`Möchtest du ${selectedProjects.length} Projekte wirklich löschen?`)) {
        projects = projects.filter(p => !selectedProjects.includes(p.id));
        selectedProjects = [];
        saveData();
        loadAdminProjects();
        loadProjects();
        showToast(`${selectedProjects.length} Projekte gelöscht`, 'success');
        logActivity('bulk_delete', `Bulk deleted ${selectedProjects.length} projects`);
    }
}

function bulkDuplicateProjects() {
    if (!requireAdminTabAccess('projects', 'Du darfst keine Projekte bearbeiten')) {
        return;
    }

    if (selectedProjects.length === 0) {
        showToast('Keine Projekte ausgewählt', 'warning');
        return;
    }
    
    selectedProjects.forEach(projectId => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            const duplicatedProject = {
                ...project,
                id: Date.now() + Math.random(),
                name: `${project.name} (Kopie)`,
                createdAt: new Date().toISOString(),
                downloads: 0,
                views: 0,
                featured: false
            };
            projects.push(duplicatedProject);
        }
    });
    
    selectedProjects = [];
    saveData();
    loadAdminProjects();
    loadProjects();
    showToast('Projekte dupliziert', 'success');
    logActivity('bulk_duplicate', 'Bulk duplicated projects');
}

// ========================================
// PROJECT TEMPLATES
// ========================================

function applyProjectTemplate(template) {
    const templateData = projectTemplates[template];
    if (templateData) {
        document.getElementById('projectPlatform').value = templateData.platform;
        syncPlatformNameField(document.getElementById('projectPlatform'));
        document.getElementById('projectDescription').value = templateData.description;
        document.getElementById('projectTags').value = templateData.tags.join(', ');
    }
}

document.getElementById('projectTemplate')?.addEventListener('change', (e) => {
    if (e.target.value) {
        applyProjectTemplate(e.target.value);
    }
});

// ========================================
// ENHANCED ADMIN PANEL FUNCTIONS
// ========================================

function openAdminModal() {
    if (authState.role === 'admin' || authState.role === 'member') {
        openAdminPanel();
        return;
    }

    document.getElementById('adminModal').style.display = 'block';
    updateAuthInterface();
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
}

function initFirebaseAuth() {
    updateAuthInterface();

    if (location.protocol === 'file:') {
        return;
    }

    if (!window.firebase || !isFirebaseConfigured()) {
        return;
    }

    if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
        firebaseApp = firebase.app();
    }

    firebaseAuth = firebase.auth();
    firebaseDb = firebase.firestore();

    firebaseAuth.onAuthStateChanged(async user => {
        applyAuthState(user);

        if (user) {
            const remoteData = await loadRemoteDataFromFirestore();
            if (remoteData?.content || (Array.isArray(remoteData?.members) && remoteData.members.length)) {
                applyRemoteDataToState(remoteData);
                persistLocalData();
                refreshAppUI();
            }
        }
    });
}

async function signInWithGoogle() {
    if (location.protocol === 'file:') {
        showToast('Google-Login geht nur ueber http(s). Starte die Seite ueber einen lokalen Server.', 'warning');
        return;
    }

    if (!firebaseAuth) {
        showToast('Bitte zuerst Firebase in script.js konfigurieren', 'warning');
        return;
    }

    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await firebaseAuth.signInWithPopup(provider);
        applyAuthState(result.user);

        if (authState.role === 'guest') {
            showToast('Diese E-Mail ist nicht freigeschaltet', 'error');
            await firebaseAuth.signOut();
            return;
        }

        closeAdminModal();
        openAdminPanel();
        showToast('Erfolgreich mit Google eingeloggt', 'success');
    } catch (error) {
        console.error('Google login error:', error);
        if (error?.code === 'auth/unauthorized-domain') {
            showToast('Diese Domain ist in Firebase noch nicht als erlaubte Domain eingetragen', 'error');
            return;
        }

        if (error?.code === 'auth/popup-closed-by-user') {
            showToast('Login-Popup wurde geschlossen', 'info');
            return;
        }

        showToast('Google-Login fehlgeschlagen', 'error');
    }
}

async function signOutGoogle() {
    if (firebaseAuth) {
        await firebaseAuth.signOut();
    }

    applyAuthState(null);
    closeAdminPanel();
    closeAdminModal();
    showToast('Abgemeldet', 'info');
}

function openAdminPanel() {
    if (authState.role !== 'admin' && authState.role !== 'member') {
        openAdminModal();
        return;
    }

    document.getElementById('adminPanel').style.display = 'block';
    document.body.style.overflow = 'hidden';
    populateMemberSelects();
    resetMemberForm();
    resetEventForm();
    resetSocialForm();
    loadAdminProjects();
    loadAdminEvents();
    loadAdminMembers();
    loadAdminSocials();
    loadAdminStats();
    loadActivityLog();
    loadSettings();
    applyPermissionView();
    activateAdminTab(getDefaultAdminTab());
    startSessionTimeout();
}

function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
    document.body.style.overflow = 'auto';
    stopSessionTimeout();
}

function startSessionTimeout() {
    stopSessionTimeout();
    const timeoutMinutes = settings.sessionTimeout || 30;
    sessionTimeout = setTimeout(() => {
        closeAdminPanel();
        showToast('Session abgelaufen - Bitte erneut einloggen', 'warning');
    }, timeoutMinutes * 60 * 1000);
}

function stopSessionTimeout() {
    if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        sessionTimeout = null;
    }
}

function resetSessionTimeout() {
    if (document.getElementById('adminPanel').style.display === 'block') {
        startSessionTimeout();
    }
}

function loadAdminProjects() {
    if (!canAccessAdminTab('projects')) {
        return;
    }

    const list = document.getElementById('adminProjectsList');
    list.innerHTML = '';
    
    projects.forEach(project => {
        // Get all platforms for this project
        const platforms = project.platforms && project.platforms.length ? project.platforms : [];
        
        const platformsDisplay = platforms.map(p => getPlatformDisplayName(p)).join(', ');
        
        const item = document.createElement('div');
        item.className = 'admin-project-item';
        item.innerHTML = `
            <input type="checkbox" class="project-select" value="${project.id}" onchange="toggleProjectSelection(${project.id})">
            <div class="admin-project-info">
                <strong>${sanitizeInput(project.name)}</strong>
                <p>${platformsDisplay} - ${project.downloads || 0} Downloads - ${project.views || 0} Views</p>
                ${project.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
                ${project.tags && project.tags.length ? `<small>Tags: ${project.tags.join(', ')}</small>` : ''}
            </div>
            <div class="admin-project-actions">
                <button class="btn-secondary" onclick="duplicateProject(${project.id})" title="Duplizieren">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="btn-edit" onclick="editProject(${project.id})" title="Bearbeiten">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteProject(${project.id})" title="Löschen">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

function resetMemberForm() {
    const form = document.getElementById('memberForm');
    if (!form) return;

    form.reset();
    document.getElementById('memberId').value = authState.role === 'member' ? authState.memberId || '' : '';
    document.getElementById('memberAccent').value = '#818cf8';
    document.getElementById('memberIcon').value = 'fas fa-user';
    document.getElementById('memberPriority').value = getSortedClanMembers().length + 1;
    document.getElementById('memberFormTitle').textContent = authState.role === 'member' ? 'Mein Profil bearbeiten' : 'Mitglied hinzufügen';
    document.getElementById('memberSubmitText').textContent = authState.role === 'member' ? 'Profil speichern' : 'Mitglied speichern';
    renderMemberTabPermissions();
    renderMemberSocialAssignments();
    updateMemberImagePreview('');
    updateAllMemberSocialAssignmentPreviews();
}

function resetEventForm() {
    const form = document.getElementById('eventForm');
    if (!form) return;

    form.reset();
    document.getElementById('eventId').value = '';
    document.getElementById('eventFormTitle').textContent = 'Ereignis hinzufügen';
    document.getElementById('eventSubmitText').textContent = 'Ereignis speichern';
    document.getElementById('eventDate').value = formatDateTimeLocalValue(getFutureDateISO(7, 19, 0));
    document.getElementById('eventHost').value = clanMembers[0]?.id || 'cringekarl';
    document.getElementById('eventLink').value = 'https://discord.gg/pmZWDGFz';
}

function resetSocialForm() {
    const form = document.getElementById('socialDefinitionForm');
    if (!form) return;

    form.reset();
    document.getElementById('socialDefinitionId').value = '';
    document.getElementById('socialFormTitle').textContent = 'Social-Baustein hinzufügen';
    document.getElementById('socialSubmitText').textContent = 'Social speichern';
    updateSocialDefinitionPreview();
}

function updateMemberImagePreview(inputValue = null) {
    const input = document.getElementById('memberImage');
    const preview = document.getElementById('memberImagePreview');
    const hint = document.getElementById('memberImageHint');
    if (!preview || !hint) return;

    const rawValue = (inputValue ?? input?.value ?? '').trim();

    if (!rawValue) {
        preview.innerHTML = `
            <div class="member-image-preview-empty">
                <i class="fas fa-image"></i>
                <span>Noch keine Bildadresse eingetragen</span>
            </div>
        `;
        hint.textContent = 'Direkte Bild-URL oder GitHub-blob/tree-Link einfuegen.';
        return;
    }

    const normalized = normalizeImageUrl(rawValue);
    if (input && normalized !== rawValue) {
        input.value = normalized;
    }

    if (!validateUrl(normalized)) {
        preview.innerHTML = `
            <div class="member-image-preview-empty invalid">
                <i class="fas fa-triangle-exclamation"></i>
                <span>Die Bildadresse ist ungueltig</span>
            </div>
        `;
        hint.textContent = 'Bitte eine komplette URL inklusive https:// eingeben.';
        return;
    }

    hint.textContent = normalized !== rawValue
        ? 'GitHub-Link automatisch in eine direkte Bildadresse umgewandelt.'
        : 'Direkte Bildadresse erkannt.';

    preview.innerHTML = `
        <img
            src="${sanitizeInput(normalized)}"
            alt="Profilbild Vorschau"
            class="member-image-preview-img"
            loading="lazy"
            onerror="this.closest('.member-image-preview').innerHTML='<div class=&quot;member-image-preview-empty invalid&quot;><i class=&quot;fas fa-image-slash&quot;></i><span>Bild konnte nicht geladen werden</span></div>'"
        >
    `;
}

function updateSocialDefinitionPreview() {
    const preview = document.getElementById('socialDefinitionPreview');
    if (!preview) return;

    const name = document.getElementById('socialDefinitionName')?.value.trim() || 'Social Name';
    const icon = normalizeSocialIcon(document.getElementById('socialDefinitionIcon')?.value.trim());
    const previewDefinition = { name, icon };

    preview.innerHTML = `
        <div class="social-definition-preview-card">
            <span class="member-social-badge${getSocialIconContainerClass(previewDefinition)}">${getSocialIconMarkup(previewDefinition)}</span>
            <div class="social-definition-preview-copy">
                <strong>${sanitizeInput(name)}</strong>
                <span>${sanitizeInput(icon)}</span>
            </div>
        </div>
    `;
}

function updateMemberSocialAssignmentPreview(socialId) {
    const row = document.querySelector(`.member-social-assignment[data-social-id="${socialId}"]`);
    if (!row) return;

    const urlInput = row.querySelector('.member-social-url');
    let previewLink = row.querySelector('.member-social-preview-link');

    if (!previewLink) {
        previewLink = document.createElement('a');
        previewLink.className = 'member-social-preview-link hidden';
        previewLink.target = '_blank';
        previewLink.rel = 'noreferrer noopener';
        previewLink.textContent = 'Social-Vorschau oeffnen';
        row.appendChild(previewLink);
    }

    const url = urlInput?.value.trim() || '';
    const visible = Boolean(url && validateUrl(url));
    previewLink.classList.toggle('hidden', !visible);

    if (visible) {
        previewLink.href = url;
    } else {
        previewLink.removeAttribute('href');
    }
}

function updateAllMemberSocialAssignmentPreviews() {
    document.querySelectorAll('.member-social-assignment').forEach(row => {
        updateMemberSocialAssignmentPreview(row.dataset.socialId);
    });
}

function loadAdminMembers() {
    const list = document.getElementById('adminMembersList');
    if (!list) return;

    list.innerHTML = '';

    const visibleMembers = authState.role === 'member'
        ? clanMembers.filter(member => member.id === authState.memberId)
        : getSortedClanMembers();

    visibleMembers.forEach(member => {
        const projectCount = projects.filter(project => project.ownerId === member.id).length;
        const item = document.createElement('div');
        item.className = 'admin-member-item';
        item.innerHTML = `
            <div class="admin-member-avatar-wrap">
                ${getMemberAvatarMarkup(member, 'admin-member-avatar')}
            </div>
            <div class="admin-member-info">
                <strong>${sanitizeInput(member.name)}</strong>
                <p>${sanitizeInput(member.role)} · Priorität ${member.priority || '-'} · ${projectCount} Projekt${projectCount === 1 ? '' : 'e'}</p>
                ${member.bio ? `<small>${sanitizeInput(member.bio)}</small>` : ''}
                ${member.tabPermissions?.length ? `<small>Reiter: ${member.tabPermissions.map(tab => sanitizeInput(MEMBER_TAB_PERMISSION_OPTIONS.find(option => option.id === tab)?.label || tab)).join(', ')}</small>` : ''}
            </div>
            <div class="admin-member-actions">
                <button class="btn-edit" onclick="editMember('${member.id}')" title="Bearbeiten" ${canEditMember(member.id) ? '' : 'disabled'}>
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

function loadAdminEvents() {
    if (!canAccessAdminTab('events')) {
        return;
    }

    const list = document.getElementById('adminEventsList');
    if (!list) return;

    if (!events.length) {
        list.innerHTML = '<p class="member-social-empty">Noch keine Ereignisse angelegt.</p>';
        return;
    }

    list.innerHTML = '';

    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    sortedEvents.forEach(event => {
        const host = getMemberById(event.hostId);
        const item = document.createElement('div');
        item.className = 'admin-event-item';
        item.innerHTML = `
            <div class="admin-event-info">
                <strong>${sanitizeInput(event.title)}</strong>
                <p>${sanitizeInput(event.type)} · ${new Date(event.date).toLocaleString('de-DE')}</p>
                <small>${sanitizeInput(event.location)} · ${sanitizeInput(host.name)}</small>
            </div>
            <div class="admin-event-actions">
                <button class="btn-edit" onclick="editEvent('${event.id}')" title="Bearbeiten">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteEvent('${event.id}')" title="Löschen">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

function loadAdminSocials() {
    if (!canAccessAdminTab('socials')) {
        return;
    }

    const list = document.getElementById('adminSocialDefinitionsList');
    if (!list) return;

    if (!socialDefinitions.length) {
        list.innerHTML = '<p class="member-social-empty">Noch keine Social-Bausteine angelegt.</p>';
        return;
    }

    list.innerHTML = '';

    socialDefinitions.forEach(definition => {
        const assignedCount = clanMembers.filter(member => (member.socials || []).some(entry => entry.socialId === definition.id)).length;
        const item = document.createElement('div');
        item.className = 'admin-social-item';
        item.innerHTML = `
            <div class="admin-social-preview">
                <span class="member-social-badge${getSocialIconContainerClass(definition)}">${getSocialIconMarkup(definition)}</span>
            </div>
            <div class="admin-social-info">
                <strong>${sanitizeInput(definition.name)}</strong>
                <p>${sanitizeInput(definition.icon)} · ${assignedCount} Mitglied${assignedCount === 1 ? '' : 'er'}</p>
            </div>
            <div class="admin-social-actions">
                <button class="btn-edit" onclick="editSocialDefinition('${definition.id}')" title="Bearbeiten">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteSocialDefinition('${definition.id}')" title="Löschen">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

function editSocialDefinition(socialId) {
    if (!requireAdminTabAccess('socials', 'Du darfst Socials nicht bearbeiten')) {
        return;
    }

    const definition = getSocialDefinitionById(socialId);
    if (!definition) return;

    document.getElementById('socialDefinitionId').value = definition.id;
    document.getElementById('socialDefinitionName').value = definition.name;
    document.getElementById('socialDefinitionIcon').value = definition.icon;
    document.getElementById('socialFormTitle').textContent = 'Social-Baustein bearbeiten';
    document.getElementById('socialSubmitText').textContent = 'Änderungen speichern';
    updateSocialDefinitionPreview();
}

function deleteSocialDefinition(socialId) {
    if (!requireAdminTabAccess('socials', 'Du darfst Socials nicht bearbeiten')) {
        return;
    }

    const definition = getSocialDefinitionById(socialId);
    if (!definition) return;

    if (!confirm(`Möchtest du den Social-Baustein "${definition.name}" wirklich löschen?`)) {
        return;
    }

    socialDefinitions = socialDefinitions.filter(social => social.id !== socialId);
    clanMembers = clanMembers.map(member => ({
        ...member,
        socials: (member.socials || []).filter(entry => entry.socialId !== socialId)
    }));

    saveData();
    loadAdminSocials();
    loadAdminMembers();
    loadProjects();
    resetMemberForm();
    showToast('Social-Baustein gelöscht', 'success');
}

function handleSocialDefinitionSave(e) {
    e.preventDefault();

    if (!requireAdminTabAccess('socials', 'Du darfst Socials nicht bearbeiten')) {
        return;
    }

    const socialId = document.getElementById('socialDefinitionId').value.trim();
    const name = document.getElementById('socialDefinitionName').value.trim();
    const icon = document.getElementById('socialDefinitionIcon').value.trim();

    if (!name || !icon) {
        showToast('Bitte Name und Icon-Klasse ausfüllen', 'error');
        return;
    }

    if (!isValidSocialIconInput(icon)) {
        showToast('Bitte eine gueltige Icon-Klasse oder Bild-URL eingeben', 'error');
        return;
    }

    const normalizedDefinition = normalizeSocialDefinition({
        id: socialId || `social-${Date.now()}`,
        name,
        icon
    }, socialDefinitions.length);

    const existingIndex = socialDefinitions.findIndex(social => social.id === normalizedDefinition.id);
    if (existingIndex >= 0) {
        socialDefinitions[existingIndex] = normalizedDefinition;
    } else {
        socialDefinitions.push(normalizedDefinition);
    }

    saveData();
    loadAdminSocials();
    resetSocialForm();
    renderMemberSocialAssignments();
    loadProjects();
    showToast('Social-Baustein gespeichert', 'success');
}

function editMember(memberId) {
    if (!canEditMember(memberId)) {
        showToast('Du kannst nur dein eigenes Mitglied bearbeiten', 'error');
        return;
    }

    const member = getMemberById(memberId);
    if (!member) return;

    document.getElementById('memberId').value = member.id;
    document.getElementById('memberName').value = member.name;
    document.getElementById('memberEmail').value = member.email || '';
    document.getElementById('memberRole').value = member.role;
    document.getElementById('memberImage').value = member.image || '';
    document.getElementById('memberAccent').value = member.accent || '#818cf8';
    document.getElementById('memberIcon').value = member.icon || 'fas fa-user';
    document.getElementById('memberBio').value = member.bio || '';
    document.getElementById('memberPriority').value = member.priority || '';
    renderMemberTabPermissions(member);
    document.getElementById('memberFormTitle').textContent = authState.role === 'member' ? 'Mein Profil bearbeiten' : 'Mitglied bearbeiten';
    document.getElementById('memberSubmitText').textContent = authState.role === 'member' ? 'Profil speichern' : 'Änderungen speichern';
    renderMemberSocialAssignments(member);
    updateMemberImagePreview(member.image || '');
    updateAllMemberSocialAssignmentPreviews();
}

function handleMemberSave(e) {
    e.preventDefault();

    const requestedMemberId = document.getElementById('memberId').value.trim();
    const memberId = authState.role === 'member' ? authState.memberId || requestedMemberId : requestedMemberId;
    const name = document.getElementById('memberName').value.trim();
    const emailInput = normalizeEmail(document.getElementById('memberEmail').value.trim());
    const role = document.getElementById('memberRole').value.trim();
    const image = normalizeImageUrl(document.getElementById('memberImage').value.trim());
    const accent = document.getElementById('memberAccent').value || '#818cf8';
    const icon = document.getElementById('memberIcon').value.trim() || 'fas fa-user';
    const bio = document.getElementById('memberBio').value.trim();
    const currentMember = getMemberById(memberId);
    const priorityInput = Number.parseInt(document.getElementById('memberPriority').value, 10);
    const tabPermissions = authState.role === 'admin'
        ? collectMemberTabPermissions()
        : currentMember?.tabPermissions;
    let socials = [];

    if (!name || !role) {
        showToast('Bitte Name und Rolle ausfüllen', 'error');
        return;
    }

    if (authState.role === 'member' && requestedMemberId && requestedMemberId !== authState.memberId) {
        showToast('Du kannst nur dein eigenes Mitglied bearbeiten', 'error');
        return;
    }

    if (emailInput && !validateEmail(emailInput)) {
        showToast('Bitte eine gueltige Google-E-Mail eingeben', 'error');
        return;
    }

    if (image && !validateUrl(image)) {
        showToast('Bitte eine gültige Bild-URL eingeben', 'error');
        return;
    }

    document.getElementById('memberImage').value = image;

    try {
        socials = collectMemberSocialAssignments();
    } catch (error) {
        if (error.message === 'invalid_member_social_url') {
            showToast('Bitte für aktive Socials eine gültige URL eingeben', 'error');
            return;
        }
        throw error;
    }

    const normalizedMember = normalizeMember({
        id: memberId || `member-${Date.now()}`,
        name,
        email: authState.role === 'admin' ? emailInput : normalizeEmail(currentMember?.email || authState.email),
        role,
        image,
        accent,
        icon,
        bio,
        priority: authState.role === 'admin'
            ? (Number.isFinite(priorityInput) && priorityInput > 0 ? priorityInput : getSortedClanMembers().length + 1)
            : currentMember?.priority,
        tabPermissions,
        socials
    }, clanMembers.length);

    const existingIndex = clanMembers.findIndex(member => member.id === normalizedMember.id);

    if (existingIndex >= 0) {
        clanMembers[existingIndex] = normalizedMember;
    } else {
        clanMembers.push(normalizedMember);
    }

    saveData();
    populateMemberSelects();
    loadAdminMembers();
    renderMembersOverview();
    loadProjects();
    resetMemberForm();
    if (authState.role === 'member' && authState.memberId) {
        editMember(authState.memberId);
    }
    showToast(authState.role === 'member' ? 'Profil gespeichert' : 'Mitglied gespeichert', 'success');
}

function toggleProjectSelection(projectId) {
    const index = selectedProjects.indexOf(projectId);
    if (index > -1) {
        selectedProjects.splice(index, 1);
    } else {
        selectedProjects.push(projectId);
    }
}

function duplicateProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        const duplicatedProject = {
            ...project,
            id: Date.now(),
            name: `${project.name} (Kopie)`,
            createdAt: new Date().toISOString(),
            downloads: 0,
            views: 0,
            featured: false
        };
        projects.push(duplicatedProject);
        saveData();
        loadAdminProjects();
        loadProjects();
        showToast('Projekt dupliziert', 'success');
        logActivity('project_duplicate', `Duplicated project: ${project.name}`);
    }
}

function loadAdminStats() {
    if (!canAccessAdminTab('stats')) {
        return;
    }

    document.getElementById('editDownloads').value = stats.downloads;
    document.getElementById('editCommunity').value = stats.community;
    document.getElementById('editViews').value = stats.views || 0;
    document.getElementById('editFeatured').value = stats.featured || 0;
    
    // Update dashboard
    document.getElementById('dashProjectCount').textContent = projects.length;
    document.getElementById('dashDownloadCount').textContent = stats.downloads.toLocaleString();
    document.getElementById('dashCommunityCount').textContent = stats.community.toLocaleString();
    document.getElementById('dashViewCount').textContent = (stats.views || 0).toLocaleString();
    
    // Update platform breakdown
    updatePlatformStats();
    
    // Draw chart
    drawStatsChart();
}

function updatePlatformStats() {
    const platformStats = document.getElementById('platformStats');
    const platformCounts = {};
    
    // Count unique platforms across all projects
    projects.forEach(project => {
        if (project.platforms && project.platforms.length > 0) {
            // Use primary platform (first in array)
            const primaryPlatform = project.platforms[0];
            const platform = primaryPlatform.label || primaryPlatform.platform;
            platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        }
    });
    
    const total = projects.length;
    let html = '';
    
    Object.entries(platformCounts).forEach(([platform, count]) => {
        const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
        const config = platformConfig[platform] || platformConfig.other;
        
        html += `
            <div class="platform-stat-item">
                <span class="platform-stat-label">${platform === 'other' ? config.name : sanitizeInput(platformConfig[platform]?.name || platform)}</span>
                <div class="platform-stat-bar">
                    <div class="platform-stat-fill" style="width: ${percentage}%; background: ${config.color}"></div>
                </div>
                <span class="platform-stat-value">${count} (${percentage}%)</span>
            </div>
        `;
    });
    
    platformStats.innerHTML = html || '<p style="color: var(--text-secondary)">Keine Projekte vorhanden</p>';
}

function drawStatsChart() {
    const canvas = document.getElementById('projectStatsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simple bar chart (in production, use a library like Chart.js)
    const barWidth = 40;
    const gap = 30;
    const startX = 50;
    const startY = canvas.height - 50;
    
    const data = [
        { label: 'Projekte', value: projects.length, color: '#6366f1' },
        { label: 'Downloads', value: Math.min(stats.downloads / 100, 100), color: '#10b981' },
        { label: 'Views', value: Math.min((stats.views || 0) / 100, 100), color: '#f472b6' }
    ];
    
    const maxValue = Math.max(...data.map(d => d.value));
    
    data.forEach((item, index) => {
        const x = startX + index * (barWidth + gap);
        const height = (item.value / maxValue) * (canvas.height - 100);
        const y = startY - height;
        
        // Draw bar
        ctx.fillStyle = item.color;
        ctx.fillRect(x, y, barWidth, height);
        
        // Draw label
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x + barWidth / 2, startY + 20);
        
        // Draw value
        ctx.fillText(item.value, x + barWidth / 2, y - 10);
    });
    
    // Draw axis
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(30, startY);
    ctx.lineTo(canvas.width - 30, startY);
    ctx.stroke();
}

function loadActivityLog() {
    if (!canAccessAdminTab('activity')) {
        return;
    }

    const logContainer = document.getElementById('activityLog');
    logContainer.innerHTML = '';
    
    if (activityLog.length === 0) {
        logContainer.innerHTML = '<p style="color: var(--text-secondary);">Keine Aktivitäten bisher.</p>';
        return;
    }
    
    activityLog.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        const icons = {
            project_add: 'fas fa-plus',
            project_delete: 'fas fa-trash',
            project_edit: 'fas fa-edit',
            project_duplicate: 'fas fa-copy',
            bulk_delete: 'fas fa-trash-alt',
            bulk_duplicate: 'fas fa-clone',
            stats_update: 'fas fa-chart-line',
            settings_change: 'fas fa-cog',
            theme_change: 'fas fa-palette',
            admin_login: 'fas fa-sign-in-alt',
            admin_login_failed: 'fas fa-exclamation-triangle',
            data_export: 'fas fa-download',
            data_import: 'fas fa-upload',
            backup_created: 'fas fa-database',
            discord_notification: 'fab fa-discord'
        };
        
        const icon = icons[entry.action] || 'fas fa-info-circle';
        const time = new Date(entry.timestamp).toLocaleString('de-DE');
        
        item.innerHTML = `
            <div class="activity-icon">
                <i class="${icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">${sanitizeInput(entry.details)}</div>
                <div class="activity-time">${time}</div>
            </div>
        `;
        logContainer.appendChild(item);
    });
}

function loadSettings() {
    if (!canAccessAdminTab('settings') && !canAccessAdminTab('internal')) {
        return;
    }

    document.getElementById('siteTitle').value = settings.siteTitle;
    document.getElementById('siteDescription').value = settings.siteDescription || '';
    document.getElementById('memberAreaEditor').value = settings.memberAreaText || '';
    document.getElementById('defaultTheme').value = settings.defaultTheme || 'dark';
    document.getElementById('sessionTimeout').value = settings.sessionTimeout || 30;
    document.getElementById('enableAuditLog').checked = settings.enableAuditLog;
    document.getElementById('autoBackup').checked = settings.autoBackup;
    document.getElementById('backupInterval').value = settings.backupInterval || 24;
    document.getElementById('backupRetention').value = settings.backupRetention || 30;
    document.getElementById('discordWebhook').value = settings.discordWebhook || '';
    document.getElementById('discordNotifyNewProject').checked = settings.discordNotifyNewProject;
    document.getElementById('discordNotifyUpdate').checked = settings.discordNotifyUpdate;
    document.getElementById('githubToken').value = settings.githubToken || '';
    document.getElementById('discordChannelId').value = settings.discordChannelId || '';
    document.getElementById('discordToken').value = settings.discordToken || '';
}

// ========================================
// MULTI-PLATFORM SUPPORT
// ========================================

function addPlatformLink() {
    const container = document.getElementById('additionalPlatformsContainer');
    const row = document.createElement('div');
    row.className = 'platform-link-row';
    row.innerHTML = createPlatformRowHtml();
    container.appendChild(row);
}

function removePlatformLink(btn) {
    btn.closest('.platform-link-row').remove();
}

function addEditPlatformLink() {
    const container = document.getElementById('editAdditionalPlatformsContainer');
    const row = document.createElement('div');
    row.className = 'platform-link-row';
    row.innerHTML = createPlatformRowHtml();
    container.appendChild(row);
}

function getAdditionalPlatforms() {
    const container = document.getElementById('additionalPlatformsContainer');
    const platforms = [];
    
    container.querySelectorAll('.platform-link-row').forEach(row => {
        const select = row.querySelector('.additional-platform-select');
        const url = row.querySelector('.additional-platform-url');
        const customName = row.querySelector('.additional-platform-name');
        const platformData = getPlatformData(select, url, customName);

        if (platformData) {
            platforms.push(platformData);
        }
    });
    
    return platforms;
}

function getEditAdditionalPlatforms() {
    const container = document.getElementById('editAdditionalPlatformsContainer');
    const platforms = [];
    
    container.querySelectorAll('.platform-link-row').forEach(row => {
        const select = row.querySelector('.additional-platform-select');
        const url = row.querySelector('.additional-platform-url');
        const customName = row.querySelector('.additional-platform-name');
        const platformData = getPlatformData(select, url, customName);

        if (platformData) {
            platforms.push(platformData);
        }
    });
    
    return platforms;
}

function loadAdditionalPlatforms(project) {
    const container = document.getElementById('editAdditionalPlatformsContainer');
    container.innerHTML = '';
    
    // Load only additional platforms (skip the first/primary one)
    if (project.platforms && project.platforms.length > 1) {
        project.platforms.slice(1).forEach(p => {
            const row = document.createElement('div');
            row.className = 'platform-link-row';
            row.innerHTML = createPlatformRowHtml({
                selectedValue: p.label ? 'custom' : (p.platform || ''),
                url: p.url || '',
                label: p.label || ''
            });
            container.appendChild(row);
        });
    }
}

function handleAddProject(e) {
    e.preventDefault();

    if (!requireAdminTabAccess('projects', 'Du darfst keine Projekte bearbeiten')) {
        return;
    }
    
    const name = document.getElementById('projectName').value.trim();
    const ownerId = document.getElementById('projectMember').value;
    const description = document.getElementById('projectDescription').value.trim();
    const type = document.getElementById('projectType').value;
    const primaryPlatform = document.getElementById('projectPlatform').value;
    const primaryPlatformCustomName = document.getElementById('projectPlatformCustomName').value.trim();
    const primaryUrl = document.getElementById('projectUrl').value.trim();
    const image = document.getElementById('projectImage').value.trim();
    const downloads = parseInt(document.getElementById('projectDownloads').value) || 0;
    const tags = document.getElementById('projectTags').value.split(',').map(t => t.trim()).filter(t => t);
    const featured = document.getElementById('projectFeatured').checked;
    
    // Get additional platforms
    const additionalPlatforms = getAdditionalPlatforms();
    const primaryPlatformData = getPlatformData(
        document.getElementById('projectPlatform'),
        document.getElementById('projectUrl'),
        document.getElementById('projectPlatformCustomName')
    );
    const platforms = primaryPlatformData ? [primaryPlatformData].concat(additionalPlatforms) : additionalPlatforms;
    
    // Validation
    if (!name || !description || !type || !primaryPlatform || !primaryUrl) {
        showToast('Bitte füllen Sie alle Pflichtfelder aus', 'error');
        return;
    }
    
    if (primaryPlatform === 'custom' && !primaryPlatformCustomName) {
        showToast('Bitte gib einen eigenen Plattformnamen ein', 'error');
        return;
    }

    if (!primaryPlatformData) {
        showToast('Bitte geben Sie eine gültige Plattform und URL ein', 'error');
        return;
    }
    
    const newProject = {
        id: Date.now(),
        ownerId,
        name,
        description,
        type,
        platforms,
        image,
        downloads,
        tags,
        featured,
        views: 0,
        createdAt: new Date().toISOString()
    };
    
    if (featured) {
        stats.featured = (stats.featured || 0) + 1;
    }
    
    projects.push(newProject);
    saveData();
    loadAdminProjects();
    loadProjects();
    loadAdminStats();
    
    // Reset form
    e.target.reset();
    document.getElementById('projectFeatured').checked = false;
    syncPlatformNameField(document.getElementById('projectPlatform'));
    document.getElementById('additionalPlatformsContainer').innerHTML = `
        <div class="platform-link-row">
            ${createPlatformRowHtml()}
        </div>
    `;
    
    showToast('Projekt erfolgreich hinzugefügt!', 'success');
    logActivity('project_add', `Added project: ${name}`);
}

function deleteProject(id) {
    if (!requireAdminTabAccess('projects', 'Du darfst keine Projekte bearbeiten')) {
        return;
    }

    const project = projects.find(p => p.id === id);
    if (confirm(`Möchtest du das Projekt "${project.name}" wirklich löschen?`)) {
        projects = projects.filter(p => p.id !== id);
        if (project.featured) {
            stats.featured = Math.max(0, (stats.featured || 0) - 1);
        }
        saveData();
        loadAdminProjects();
        loadProjects();
        loadAdminStats();
        showToast('Projekt gelöscht', 'success');
        logActivity('project_delete', `Deleted project: ${project.name}`);
    }
}

function editProject(id) {
    if (!requireAdminTabAccess('projects', 'Du darfst keine Projekte bearbeiten')) {
        return;
    }

    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    document.getElementById('editProjectId').value = project.id;
    document.getElementById('editProjectName').value = project.name;
    document.getElementById('editProjectMember').value = project.ownerId || 'cringekarl';
    document.getElementById('editProjectDescription').value = project.description;
    document.getElementById('editProjectType').value = project.type || 'other';
    document.getElementById('editProjectCategory').value = project.category || '';
    document.getElementById('editProjectTags').value = project.tags ? project.tags.join(', ') : '';
    
    // Get primary platform (first in array)
    const primaryPlatform = project.platforms && project.platforms[0];
    if (primaryPlatform) {
        document.getElementById('editProjectPlatform').value = primaryPlatform.label ? 'custom' : primaryPlatform.platform;
        document.getElementById('editProjectPlatformCustomName').value = primaryPlatform.label || '';
        document.getElementById('editProjectUrl').value = primaryPlatform.url;
        syncPlatformNameField(document.getElementById('editProjectPlatform'));
    }
    document.getElementById('editProjectImage').value = project.image || '';
    document.getElementById('editProjectDownloads').value = project.downloads || 0;
    
    // Load additional platforms
    loadAdditionalPlatforms(project);
    
    document.getElementById('editProjectModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editProjectModal').style.display = 'none';
    document.getElementById('editProjectForm').reset();
    syncPlatformNameField(document.getElementById('editProjectPlatform'));
}

function handleEditProject(e) {
    e.preventDefault();

    if (!requireAdminTabAccess('projects', 'Du darfst keine Projekte bearbeiten')) {
        return;
    }
    
    const id = parseInt(document.getElementById('editProjectId').value);
    const projectIndex = projects.findIndex(p => p.id === id);
    
    if (projectIndex === -1) {
        showToast('Projekt nicht gefunden', 'error');
        return;
    }
    
    const name = document.getElementById('editProjectName').value.trim();
    const ownerId = document.getElementById('editProjectMember').value;
    const description = document.getElementById('editProjectDescription').value.trim();
    const type = document.getElementById('editProjectType').value;
    const primaryPlatform = document.getElementById('editProjectPlatform').value;
    const primaryPlatformCustomName = document.getElementById('editProjectPlatformCustomName').value.trim();
    const primaryUrl = document.getElementById('editProjectUrl').value.trim();
    const image = document.getElementById('editProjectImage').value.trim();
    const downloads = parseInt(document.getElementById('editProjectDownloads').value) || 0;
    const category = document.getElementById('editProjectCategory').value.trim();
    const tags = document.getElementById('editProjectTags').value.split(',').map(t => t.trim()).filter(t => t);
    
    // Get additional platforms
    const additionalPlatforms = getEditAdditionalPlatforms();
    const primaryPlatformData = getPlatformData(
        document.getElementById('editProjectPlatform'),
        document.getElementById('editProjectUrl'),
        document.getElementById('editProjectPlatformCustomName')
    );
    const platforms = primaryPlatformData ? [primaryPlatformData].concat(additionalPlatforms) : additionalPlatforms;
    
    // Validation
    if (!name || !description || !type || !primaryPlatform || !primaryUrl) {
        showToast('Bitte füllen Sie alle Pflichtfelder aus', 'error');
        return;
    }
    
    if (primaryPlatform === 'custom' && !primaryPlatformCustomName) {
        showToast('Bitte gib einen eigenen Plattformnamen ein', 'error');
        return;
    }

    if (!primaryPlatformData) {
        showToast('Bitte geben Sie eine gültige Plattform und URL ein', 'error');
        return;
    }
    
    const wasFeatured = projects[projectIndex].featured;
    
    projects[projectIndex] = {
        ...projects[projectIndex],
        name,
        ownerId,
        description,
        type,
        category,
        platforms,
        image,
        downloads,
        tags,
        updatedAt: new Date().toISOString()
    };
    
    // Update featured count if changed
    if (wasFeatured && !projects[projectIndex].featured) {
        stats.featured = Math.max(0, (stats.featured || 0) - 1);
    } else if (!wasFeatured && projects[projectIndex].featured) {
        stats.featured = (stats.featured || 0) + 1;
    }
    
    saveData();
    loadAdminProjects();
    loadProjects();
    loadAdminStats();
    closeEditModal();
    
    showToast('Projekt erfolgreich aktualisiert!', 'success');
    logActivity('project_edit', `Edited project: ${name}`);
}

function editEvent(eventId) {
    if (!requireAdminTabAccess('events', 'Du darfst keine Ereignisse bearbeiten')) {
        return;
    }

    const event = events.find(entry => String(entry.id) === String(eventId));
    if (!event) {
        return;
    }

    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector('.admin-tab[data-tab="events"]')?.classList.add('active');
    document.getElementById('eventsTab')?.classList.add('active');

    document.getElementById('eventId').value = event.id;
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventType').value = event.type;
    document.getElementById('eventDate').value = formatDateTimeLocalValue(event.date);
    document.getElementById('eventHost').value = event.hostId || 'cringekarl';
    document.getElementById('eventLocation').value = event.location || '';
    document.getElementById('eventLink').value = event.link || '';
    document.getElementById('eventDescription').value = event.description || '';
    document.getElementById('eventFormTitle').textContent = 'Ereignis bearbeiten';
    document.getElementById('eventSubmitText').textContent = 'Änderungen speichern';
}

function deleteEvent(eventId) {
    if (!requireAdminTabAccess('events', 'Du darfst keine Ereignisse bearbeiten')) {
        return;
    }

    const event = events.find(entry => String(entry.id) === String(eventId));
    if (!event) {
        return;
    }

    if (!confirm(`Möchtest du das Ereignis "${event.title}" wirklich löschen?`)) {
        return;
    }

    events = events.filter(entry => String(entry.id) !== String(eventId));
    saveData();
    loadAdminEvents();
    renderEventsOverview();
    resetEventForm();
    showToast('Ereignis gelöscht', 'success');
    logActivity('event_delete', `Deleted event: ${event.title}`);
}

function handleEventSave(e) {
    e.preventDefault();

    if (!requireAdminTabAccess('events', 'Du darfst keine Ereignisse bearbeiten')) {
        return;
    }

    const eventId = document.getElementById('eventId').value.trim();
    const title = document.getElementById('eventTitle').value.trim();
    const type = document.getElementById('eventType').value.trim();
    const dateInput = document.getElementById('eventDate').value;
    const hostId = document.getElementById('eventHost').value;
    const location = document.getElementById('eventLocation').value.trim();
    const link = document.getElementById('eventLink').value.trim() || 'https://discord.gg/pmZWDGFz';
    const description = document.getElementById('eventDescription').value.trim();

    if (!title || !type || !dateInput || !hostId || !location || !description) {
        showToast('Bitte fülle alle Pflichtfelder für das Ereignis aus', 'error');
        return;
    }

    const normalizedEvent = normalizeEvent({
        id: eventId || `event-${Date.now()}`,
        title,
        type,
        date: new Date(dateInput).toISOString(),
        description,
        location,
        hostId,
        link
    });

    const existingIndex = events.findIndex(entry => String(entry.id) === String(normalizedEvent.id));
    if (existingIndex >= 0) {
        events[existingIndex] = normalizedEvent;
    } else {
        events.push(normalizedEvent);
    }

    saveData();
    loadAdminEvents();
    renderEventsOverview();
    resetEventForm();
    showToast(eventId ? 'Ereignis aktualisiert' : 'Ereignis gespeichert', 'success');
    logActivity(eventId ? 'event_edit' : 'event_add', `${eventId ? 'Updated' : 'Added'} event: ${title}`);
}

function handleStatsUpdate(e) {
    e.preventDefault();

    if (!requireAdminTabAccess('stats', 'Du darfst Statistiken nicht bearbeiten')) {
        return;
    }
    
    stats.downloads = parseInt(document.getElementById('editDownloads').value) || 0;
    stats.community = parseInt(document.getElementById('editCommunity').value) || 0;
    stats.views = parseInt(document.getElementById('editViews').value) || 0;
    stats.featured = parseInt(document.getElementById('editFeatured').value) || 0;
    
    saveData();
    loadAdminStats();
    updateStatsDisplay();
    
    showToast('Statistiken erfolgreich aktualisiert!', 'success');
    logActivity('stats_update', 'Updated statistics');
}

function handleSettingsUpdate(e) {
    e.preventDefault();

    if (!requireAdminTabAccess('settings', 'Du darfst Einstellungen nicht bearbeiten')) {
        return;
    }
    
    const siteTitle = document.getElementById('siteTitle').value.trim();
    const siteDescription = document.getElementById('siteDescription').value.trim();
    const defaultTheme = document.getElementById('defaultTheme').value;
    const sessionTimeout = parseInt(document.getElementById('sessionTimeout').value) || 30;
    const enableAuditLog = document.getElementById('enableAuditLog').checked;
    
    if (siteTitle) {
        settings.siteTitle = siteTitle;
        document.title = siteTitle;
        document.querySelector('.nav-logo').textContent = siteTitle.split(' - ')[0];
    }
    
    if (siteDescription) {
        settings.siteDescription = siteDescription;
    }
    
    settings.defaultTheme = defaultTheme;
    settings.sessionTimeout = sessionTimeout;
    settings.enableAuditLog = enableAuditLog;
    
    saveData();
    showToast('Einstellungen gespeichert!', 'success');
    logActivity('settings_change', 'Updated settings');
}

function handleInternalContentSave(e) {
    e.preventDefault();

    if (!requireAdminTabAccess('internal', 'Du darfst den internen Bereich nicht bearbeiten')) {
        return;
    }

    settings.memberAreaText = document.getElementById('memberAreaEditor').value.trim();
    saveData();
    renderInternalContent();
    showToast('Interner Text gespeichert!', 'success');
    logActivity('member_area_update', 'Updated internal member tab content');
}

function handleSecurityUpdate(e) {
    e.preventDefault();

    if (!requireAdminTabAccess('settings', 'Du darfst Sicherheitseinstellungen nicht bearbeiten')) {
        return;
    }
    
    const sessionTimeout = parseInt(document.getElementById('sessionTimeout').value) || 30;
    const enableAuditLog = document.getElementById('enableAuditLog').checked;
    
    settings.sessionTimeout = sessionTimeout;
    settings.enableAuditLog = enableAuditLog;
    
    saveData();
    logActivity('security_update', 'Updated security settings');
    showToast('Sicherheitseinstellungen gespeichert', 'success');
}

function handleBackupSettings(e) {
    e.preventDefault();

    if (!requireAdminTabAccess('settings', 'Du darfst Backup-Einstellungen nicht bearbeiten')) {
        return;
    }
    
    settings.autoBackup = document.getElementById('autoBackup').checked;
    settings.backupInterval = parseInt(document.getElementById('backupInterval').value) || 24;
    settings.backupRetention = parseInt(document.getElementById('backupRetention').value) || 30;
    
    saveData();
    
    if (settings.autoBackup) {
        scheduleBackup();
    }
    
    showToast('Backup-Einstellungen gespeichert!', 'success');
    logActivity('backup_settings', 'Updated backup settings');
}

function handleAPIIntegration(e) {
    e.preventDefault();

    if (!requireAdminTabAccess('settings', 'Du darfst Integrationen nicht bearbeiten')) {
        return;
    }
    
    settings.discordWebhook = document.getElementById('discordWebhook').value.trim();
    settings.discordNotifyNewProject = document.getElementById('discordNotifyNewProject').checked;
    settings.discordNotifyUpdate = document.getElementById('discordNotifyUpdate').checked;
    settings.discordChannelId = document.getElementById('discordChannelId').value.trim();
    settings.discordToken = document.getElementById('discordToken').value.trim();
    settings.githubToken = document.getElementById('githubToken').value.trim();
    
    saveData();
    showToast('Integrationen gespeichert!', 'success');
    logActivity('api_integration', 'Updated API integrations');
}

// ========================================
// BACKUP FUNCTIONS
// ========================================

function createBackup() {
    const data = {
        projects,
        stats,
        settings,
        activityLog,
        newsletterSubscribers,
        backups: backups.slice(-10), // Keep only last 10 backups in backup
        exportedAt: new Date().toISOString(),
        version: '2.0.0'
    };
    
    const backupData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        size: JSON.stringify(data).length,
        description: `Manual backup - ${new Date().toLocaleString('de-DE')}`
    };
    
    backups.push(backupData);
    
    // Keep only required number of backups
    if (backups.length > (settings.backupRetention || 30)) {
        backups = backups.slice(-settings.backupRetention);
    }
    
    saveData();
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `karlali-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    showToast('Backup erfolgreich erstellt!', 'success');
    logActivity('backup_created', 'Manual backup created');
}

function scheduleBackup() {
    if (!settings.autoBackup) return;
    
    const interval = (settings.backupInterval || 24) * 60 * 60 * 1000;
    
    setInterval(() => {
        const backupData = {
            projects,
            stats,
            settings,
            activityLog,
            timestamp: new Date().toISOString()
        };
        
        backups.push({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            size: JSON.stringify(backupData).length,
            description: `Auto backup - ${new Date().toLocaleString('de-DE')}`
        });
        
        // Clean old backups
        if (backups.length > (settings.backupRetention || 30)) {
            backups = backups.slice(-settings.backupRetention);
        }
        
        saveData();
        logActivity('auto_backup', 'Automatic backup created');
    }, interval);
}

function showBackupHistory() {
    let message = 'Backup-Historie:\n\n';
    backups.slice(-10).reverse().forEach(backup => {
        const date = new Date(backup.timestamp).toLocaleString('de-DE');
        const size = (backup.size / 1024).toFixed(2) + ' KB';
        message += `${date} - ${size} - ${backup.description}\n`;
    });
    
    if (backups.length === 0) {
        message = 'Keine Backups vorhanden.';
    }
    
    alert(message);
}

// ========================================
// DISCORD WEBHOOK
// ========================================

async function sendDiscordNotification(logEntry) {
    if (!settings.discordWebhook) return;
    
    const embed = {
        title: 'Cringeclan Page Activity',
        description: logEntry.details,
        color: 0x6366f1,
        timestamp: logEntry.timestamp,
        fields: [
            {
                name: 'Action',
                value: logEntry.action,
                inline: true
            },
            {
                name: 'Time',
                value: new Date(logEntry.timestamp).toLocaleString('de-DE'),
                inline: true
            }
        ]
    };
    
    try {
        await fetch(settings.discordWebhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ embeds: [embed] })
        });
    } catch (error) {
        console.error('Discord webhook error:', error);
    }
}

function setDiscordStatus(message, type = 'info', meta = '') {
    const statusPill = document.getElementById('discordFeedStatus');
    const statusMeta = document.getElementById('discordFeedMeta');
    
    if (statusPill) {
        statusPill.textContent = message;
        statusPill.className = `status-pill ${type}`;
    }
    
    if (statusMeta) {
        statusMeta.textContent = meta;
    }
}

async function testDiscordConnection() {
    const webhook = document.getElementById('discordWebhook').value.trim();
    const channelId = document.getElementById('discordChannelId').value.trim();
    const token = document.getElementById('discordToken').value.trim();
    
    if (webhook) {
        await testDiscordWebhook();
        return;
    }
    
    if (!channelId || !token) {
        setDiscordStatus(
            'Discord noch nicht verbunden',
            'warning',
            'Fuer einen Test braucht es entweder einen Webhook oder Channel-ID plus Bot-Token.'
        );
        showToast('Bitte Webhook oder Channel-ID plus Bot-Token eingeben', 'warning');
        return;
    }
    
    setDiscordStatus('Discord-Verbindung wird geprueft', 'info', 'Die API wird gerade getestet.');
    
    try {
        const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages?limit=1`, {
            headers: {
                'Authorization': `Bot ${token}`
            }
        });
        
        if (response.ok) {
            setDiscordStatus('Discord verbunden', 'success', 'Der Bot kann auf den Channel zugreifen.');
            showToast('Discord Verbindung erfolgreich getestet!', 'success');
            await loadDiscordUpdates();
            return;
        }
        
        if (response.status === 401) {
            setDiscordStatus('Discord-Zugriff abgelehnt', 'error', 'Das Bot-Token ist ungueltig.');
            showToast('Discord Token ist ungueltig', 'error');
            return;
        }
        
        if (response.status === 403) {
            setDiscordStatus('Keine Berechtigung', 'error', 'Der Bot sieht den Channel nicht oder hat keine Leserechte.');
            showToast('Bot hat keine Berechtigung fuer diesen Channel', 'error');
            return;
        }
        
        setDiscordStatus('Discord-Test fehlgeschlagen', 'error', `HTTP ${response.status} beim Zugriff auf den Channel.`);
        showToast(`Discord Test fehlgeschlagen (HTTP ${response.status})`, 'error');
    } catch (error) {
        console.error('Discord connection test error:', error);
        setDiscordStatus(
            'Browser blockiert direkten Discord-Zugriff',
            'warning',
            'Live-Reads mit Bot-Token brauchen bei statischen Seiten oft einen Server oder Proxy.'
        );
        showToast('Direkter Discord-Zugriff wurde im Browser blockiert', 'warning', 5000);
    }
}

async function testDiscordWebhook() {
    const webhook = document.getElementById('discordWebhook').value.trim();
    
    if (!webhook) {
        showToast('Bitte Discord Webhook URL eingeben', 'warning');
        return;
    }
    
    const embed = {
        title: 'Cringeclan Test-Benachrichtigung',
        description: 'Dies ist eine Test-Benachrichtigung von der Cringeclan Page.',
        color: 0x10b981,
        timestamp: new Date().toISOString()
    };
    
    try {
        const response = await fetch(webhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ embeds: [embed] })
        });
        
        if (response.ok) {
            setDiscordStatus('Webhook erreichbar', 'success', 'Test-Benachrichtigung wurde erfolgreich gesendet.');
            showToast('Test-Benachrichtigung gesendet!', 'success');
        } else {
            setDiscordStatus('Webhook-Test fehlgeschlagen', 'error', `Discord hat mit HTTP ${response.status} geantwortet.`);
            showToast('Fehler beim Senden der Benachrichtigung', 'error');
        }
    } catch (error) {
        console.error('Discord webhook error:', error);
        setDiscordStatus('Webhook nicht erreichbar', 'error', 'Die Anfrage konnte nicht an Discord gesendet werden.');
        showToast('Fehler beim Senden der Benachrichtigung', 'error');
    }
}

// ========================================
// SOCIAL SHARE & QR CODE
// ========================================

function shareProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    currentShareProject = project;
    document.getElementById('shareModal').style.display = 'block';
}

function closeShareModal() {
    document.getElementById('shareModal').style.display = 'none';
}

// Get primary project URL from platforms array
function getPrimaryProjectUrl(project) {
    return (project.platforms && project.platforms[0]) ? project.platforms[0].url : '';
}

function shareOnTwitter() {
    if (!currentShareProject) return;
    const url = getPrimaryProjectUrl(currentShareProject);
    const text = encodeURIComponent(`Check out this awesome project: ${currentShareProject.name} - ${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
}

function shareOnFacebook() {
    if (!currentShareProject) return;
    const url = getPrimaryProjectUrl(currentShareProject);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareOnLinkedIn() {
    if (!currentShareProject) return;
    const url = getPrimaryProjectUrl(currentShareProject);
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}`, '_blank');
}

function shareOnWhatsApp() {
    if (!currentShareProject) return;
    const url = getPrimaryProjectUrl(currentShareProject);
    const text = encodeURIComponent(`Check out this awesome project: ${currentShareProject.name} - ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function shareOnReddit() {
    if (!currentShareProject) return;
    const url = getPrimaryProjectUrl(currentShareProject);
    window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(currentShareProject.name)}`, '_blank');
}

function copyLink() {
    if (!currentShareProject) return;
    const url = getPrimaryProjectUrl(currentShareProject);
    navigator.clipboard.writeText(url).then(() => {
        showToast('Link kopiert!', 'success');
    });
}

function showQRCode(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    currentQRProject = project;
    const container = document.getElementById('qrCodeContainer');
    const primaryUrl = getPrimaryProjectUrl(project);

    if (!container) {
        return;
    }

    if (!primaryUrl) {
        showToast('Dieses Projekt hat keine gueltige URL fuer einen QR-Code', 'error');
        return;
    }

    container.innerHTML = '';

    if (typeof QRCode === 'undefined') {
        showToast('QR-Code-Bibliothek konnte nicht geladen werden', 'error');
        return;
    }

    new QRCode(container, {
        text: primaryUrl,
        width: 220,
        height: 220,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });

    document.getElementById('qrModal').style.display = 'block';
}

function closeQRModal() {
    document.getElementById('qrModal').style.display = 'none';
}

function downloadQRCode() {
    const canvas = document.querySelector('#qrCodeContainer canvas');
    const image = document.querySelector('#qrCodeContainer img');

    if (canvas) {
        const link = document.createElement('a');
        link.download = `qr-${currentQRProject?.name || 'project'}.png`;
        link.href = canvas.toDataURL();
        link.click();
        return;
    }

    if (image?.src) {
        const link = document.createElement('a');
        link.download = `qr-${currentQRProject?.name || 'project'}.png`;
        link.href = image.src;
        link.click();
        return;
    }

    showToast('Es ist aktuell kein QR-Code zum Herunterladen vorhanden', 'warning');
}

// ========================================
// KEYBOARD SHORTCUTS
// ========================================

function openShortcutsModal() {
    document.getElementById('shortcutsModal').style.display = 'block';
}

function closeShortcutsModal() {
    document.getElementById('shortcutsModal').style.display = 'none';
}

function handleKeyboardShortcuts(e) {
    // Ctrl + K: Focus search
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        document.getElementById('projectSearch')?.focus();
    }
    
    // Ctrl + N: New project (if admin panel open)
    if (e.ctrlKey && e.key === 'n' && document.getElementById('adminPanel').style.display === 'block') {
        e.preventDefault();
        document.getElementById('projectName')?.focus();
    }
    
    // Ctrl + S: Save
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveData();
        showToast('Daten gespeichert', 'success');
    }
    
    // Ctrl + E: Export
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportData();
    }
    
    // Ctrl + D: Toggle theme
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
    }
    
    // Ctrl + /: Show shortcuts
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        openShortcutsModal();
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
        closeAdminModal();
        closeEditModal();
        closeLegalModal();
        closeShareModal();
        closeQRModal();
        closeShortcutsModal();
        if (document.getElementById('adminPanel').style.display === 'block') {
            closeAdminPanel();
        }
    }
}

// ========================================
// FAQ ACCORDION
// ========================================

function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close all
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            
            // Open clicked if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ========================================
// NEWSLETTER
// ========================================

function handleNewsletterForm(e) {
    e.preventDefault();
    
    const email = document.getElementById('newsletterEmail').value.trim();
    
    if (!validateEmail(email)) {
        showToast('Bitte eine gültige E-Mail-Adresse eingeben', 'error');
        return;
    }
    
    if (newsletterSubscribers.includes(email)) {
        showToast('Diese E-Mail ist bereits angemeldet', 'warning');
        return;
    }
    
    newsletterSubscribers.push({
        email,
        subscribedAt: new Date().toISOString()
    });
    
    saveData();
    
    showToast('Erfolgreich für Newsletter angemeldet!', 'success');
    e.target.reset();
    
    logActivity('newsletter_signup', `New newsletter subscriber: ${email}`);
}

// ========================================
// EXPORT/IMPORT FUNCTIONS
// ========================================

function exportData() {
    const data = {
        projects,
        events,
        clanMembers,
        socialDefinitions,
        stats,
        settings,
        activityLog,
        newsletterSubscribers,
        backups,
        exportedAt: new Date().toISOString(),
        version: '2.0.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `karlali-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Daten erfolgreich exportiert!', 'success');
    logActivity('data_export', 'Exported all data');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate data structure
            if (data.projects && Array.isArray(data.projects)) {
                projects = data.projects.map((project, index) => normalizeProject(project, index));
            }
            if (data.events && Array.isArray(data.events)) {
                events = data.events.map((event, index) => normalizeEvent(event, index));
            }
            if (data.clanMembers && Array.isArray(data.clanMembers)) {
                clanMembers = data.clanMembers.map((member, index) => normalizeMember(member, index));
            }
            if (data.socialDefinitions && Array.isArray(data.socialDefinitions)) {
                socialDefinitions = data.socialDefinitions.map((social, index) => normalizeSocialDefinition(social, index));
            }
            if (data.stats) {
                stats = { ...stats, ...data.stats };
            }
            if (data.settings) {
                settings = { ...settings, ...data.settings };
                applyTheme(settings.theme);
            }
            if (data.activityLog && Array.isArray(data.activityLog)) {
                activityLog = data.activityLog;
            }
            if (data.newsletterSubscribers && Array.isArray(data.newsletterSubscribers)) {
                newsletterSubscribers = data.newsletterSubscribers;
            }
            if (data.backups && Array.isArray(data.backups)) {
                backups = data.backups;
            }
            
            saveData();
            loadAdminProjects();
            loadAdminEvents();
            loadAdminStats();
            loadAdminMembers();
            loadAdminSocials();
            loadProjects();
            renderEventsOverview();
            loadActivityLog();
            loadSettings();
            populateMemberSelects();
            resetMemberForm();
            resetSocialForm();
            
            showToast('Daten erfolgreich importiert!', 'success');
            logActivity('data_import', 'Imported data from backup');
        } catch (error) {
            console.error('Import error:', error);
            showToast('Fehler beim Importieren der Daten', 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

async function clearAllData() {
    if (confirm('WARNUNG: Dies werden ALLE Daten löschen. Diese Aktion kann nicht rückgängig gemacht werden. Möchten Sie wirklich fortfahren?')) {
        if (confirm('Sind Sie ABSOLUT sicher? Alle Projekte, Einstellungen und Aktivitäten werden gelöscht.')) {
            if (firebaseDb && canManageAllContent()) {
                try {
                    await firebaseDb.collection(FIRESTORE_CONTENT_COLLECTION).doc(FIRESTORE_CONTENT_DOC).delete();

                    const membersSnapshot = await firebaseDb.collection(FIRESTORE_MEMBERS_COLLECTION).get();
                    const batch = firebaseDb.batch();
                    membersSnapshot.forEach(doc => batch.delete(doc.ref));
                    await batch.commit();
                } catch (error) {
                    console.error('Error clearing Firestore data:', error);
                    showToast('Firestore-Daten konnten nicht komplett geloescht werden', 'error');
                    return;
                }
            }

            localStorage.clear();
            location.reload();
        }
    }
}

// ========================================
// TAB NAVIGATION
// ========================================

function switchClanTab(tabId) {
    if (tabId === 'intern' && !hasClanAccess()) {
        tabId = 'startseite';
    }

    document.querySelectorAll('.tab-btn').forEach(button => {
        button.classList.toggle('active', button.dataset.tab === tabId);
    });

    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.toggle('active', section.id === tabId);
    });

    document.querySelectorAll('[data-tab-target]').forEach(link => {
        link.classList.toggle('active', link.dataset.tabTarget === tabId);
    });
}

function handleClanTabClick(event) {
    const target = event.target.closest('[data-tab], [data-tab-target]');
    if (!target) return;

    const tabId = target.dataset.tab || target.dataset.tabTarget;
    if (!tabId) return;

    event.preventDefault();
    switchClanTab(tabId);
}

function handleAdminTabs(e) {
    if (e.target.classList.contains('admin-tab')) {
        if (!canAccessAdminTab(e.target.dataset.tab)) {
            return;
        }

        const tabId = e.target.dataset.tab;
        activateAdminTab(tabId);
        
        resetSessionTimeout();
    }
}

// ========================================
// STATS DISPLAY
// ========================================

function updateStatsDisplay() {
    // Stats are now displayed in hero section only
    // This function is kept for compatibility but no longer updates about section
}

// ========================================
// CONTACT FORM
// ========================================

function handleContactForm(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    
    if (!name || !email || !message) {
        showToast('Bitte füllen Sie alle Felder aus', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('Bitte geben Sie eine gültige E-Mail-Adresse ein', 'error');
        return;
    }
    
    console.log('Contact form submitted:', { name, email, message });
    
    showToast('Vielen Dank für deine Nachricht! Ich werde mich schnellstmöglich bei dir melden.', 'success');
    e.target.reset();
    
    logActivity('contact_form', `Contact form submitted by ${name}`);
}

// ========================================
// LEGAL MODALS
// ========================================

function showImpressum() {
    const content = `
        <h2>Impressum</h2>
        <p>Angaben gemäß § 5 TMG</p>
        <p><strong>Karlali</strong><br>
        [Adresse]<br>
        [Kontakt]</p>
        <p><strong>Kontakt:</strong><br>
        E-Mail: [E-Mail-Adresse]</p>
        <p><strong>Haftung für Inhalte:</strong><br>
        Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>
    `;
    
    document.getElementById('legalModalContent').innerHTML = content;
    document.getElementById('legalModal').style.display = 'block';
}

function showDatenschutz() {
    const content = `
        <h2>Datenschutzerklärung</h2>
        <p><strong>1. Datenschutz auf einen Blick</strong></p>
        <p>Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre persönlichen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften.</p>
        <p><strong>2. Datenerfassung auf unserer Website</strong></p>
        <p>Wir verwenden Cookies, um unsere Website nutzerfreundlicher zu gestalten. Cookies sind kleine Textdateien, die auf Ihrem Computer gespeichert werden.</p>
        <p><strong>3. Kontaktformular</strong></p>
        <p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.</p>
        <p><strong>4. Newsletter</strong></p>
        <p>Wenn Sie unseren Newsletter abonnieren, werden Ihre E-Mail-Adresse und ggf. weitere personenbezogene Daten gespeichert, um Ihnen den Newsletter zusenden zu können.</p>
    `;
    
    document.getElementById('legalModalContent').innerHTML = content;
    document.getElementById('legalModal').style.display = 'block';
}

function closeLegalModal() {
    document.getElementById('legalModal').style.display = 'none';
}

// ========================================
// PARTICLE ANIMATION
// ========================================

function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedX: Math.random() * 1 - 0.5,
            speedY: Math.random() * 1 - 0.5,
            opacity: Math.random() * 0.5 + 0.2
        };
    }
    
    function init() {
        particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push(createParticle());
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
            ctx.fill();
        });
        
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 150)})`;
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animate);
    }
    
    resizeCanvas();
    init();
    animate();
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        init();
    });
}

// ========================================
// INITIALIZATION
// ========================================

let currentShareProject = null;
let currentQRProject = null;

async function init() {
    const loadingOverlay = document.getElementById('loadingOverlay');

    try {
        applyAuthState(null);
        initFirebaseAuth();
        await loadData();
        refreshAppUI();
        initParticles();
        initFAQ();
        syncPlatformNameField(document.getElementById('projectPlatform'));
        syncPlatformNameField(document.getElementById('editProjectPlatform'));
        switchClanTab('startseite');

        // Apply saved theme
        applyTheme(settings.theme);

        // Start backup scheduler if enabled
        if (settings.autoBackup) {
            scheduleBackup();
        }
    } catch (error) {
        console.error('Initialization error:', error);
    }

    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }, 500);
}

// ========================================
// DISCORD UPDATES
// ========================================

async function loadDiscordUpdates() {
    if (!settings.discordChannelId || !settings.discordToken) {
        console.log('Discord nicht konfiguriert - verwende lokale Updates');
        setDiscordStatus('Clan-News aktiv', 'info', 'Es werden aktuell lokale News und gespeicherte Updates angezeigt.');
        loadUpdatesUI();
        return;
    }
    
    try {
        setDiscordStatus('Discord-Feed wird synchronisiert', 'info', 'Neue Nachrichten werden geladen.');
        const response = await fetch(`https://discord.com/api/v10/channels/${settings.discordChannelId}/messages?limit=10`, {
            headers: {
                'Authorization': `Bot ${settings.discordToken}`
            }
        });
        
        if (response.ok) {
            const messages = await response.json();
            updates = messages.map(msg => ({
                id: msg.id,
                title: msg.embeds?.[0]?.title || msg.content?.split('\n')[0]?.slice(0, 100) || 'Update',
                content: msg.embeds?.[0]?.description || msg.content || '',
                author: msg.author?.username || 'System',
                avatar: msg.author?.avatar ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png` : '',
                timestamp: new Date(msg.timestamp),
                image: msg.embeds?.[0]?.image?.url || msg.embeds?.[0]?.thumbnail?.url || ''
            })).sort((a, b) => b.timestamp - a.timestamp);
            
            saveData();
            loadUpdatesUI();
            setDiscordStatus('Live aus Discord geladen', 'success', `Zuletzt synchronisiert: ${new Date().toLocaleString('de-DE')}`);
            showToast('Updates von Discord geladen', 'success');
        } else if (response.status === 401) {
            console.error('Discord Token ungültig');
            setDiscordStatus('Discord-Token ungueltig', 'error', 'Bitte Token im Admin-Bereich pruefen.');
            showToast('Discord Token ist ungültig', 'error');
            loadUpdatesUI();
        } else if (response.status === 403) {
            setDiscordStatus('Discord-Zugriff verweigert', 'error', 'Dem Bot fehlen Leserechte fuer den Channel.');
            showToast('Bot hat keine Berechtigung fuer diesen Channel', 'error');
            loadUpdatesUI();
        } else {
            setDiscordStatus('Discord-Feed nicht erreichbar', 'error', `Discord antwortete mit HTTP ${response.status}.`);
            loadUpdatesUI();
        }
    } catch (error) {
        console.error('Fehler beim Laden von Discord Updates:', error);
        setDiscordStatus(
            'News werden lokal angezeigt',
            'warning',
            'Der direkte Discord-Live-Feed ist in dieser Browser-Umgebung nicht verfuegbar. Es werden stattdessen lokale Updates angezeigt.'
        );
        loadUpdatesUI(); // Fallback auf lokale Updates
    }
}

function loadUpdatesUI() {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (updates.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">Keine Updates verfügbar</div>';
        return;
    }
    
    updates.slice(0, 9).forEach(update => {
        const article = document.createElement('article');
        article.className = 'blog-card';
        
        const date = new Date(update.timestamp || Date.now());
        const formattedDate = date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const shortContent = update.content.split('\n')[0].slice(0, 150);
        const imageHtml = update.image ? 
            `<img src="${update.image}" alt="${sanitizeInput(update.title)}" class="blog-image-img" loading="lazy">` :
            `<div class="blog-placeholder"><i class="fas fa-newspaper"></i></div>`;
        
        article.innerHTML = `
            <div class="blog-image">
                ${imageHtml}
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span class="blog-date">${formattedDate}</span>
                    ${update.author ? `<span class="blog-author">${sanitizeInput(update.author)}</span>` : ''}
                </div>
                <h3>${sanitizeInput(update.title)}</h3>
                <p>${sanitizeInput(shortContent)}${update.content.length > 150 ? '...' : ''}</p>
                <a href="#" class="blog-link" onclick="openUpdateDetail(event, ${updates.indexOf(update)})">Weiterlesen <i class="fas fa-arrow-right"></i></a>
            </div>
        `;
        grid.appendChild(article);
    });
}

function openUpdateDetail(e, index) {
    e.preventDefault();
    const update = updates[index];
    if (!update) return;
    
    const date = new Date(update.timestamp || Date.now());
    const formattedDate = date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('updateTitle').textContent = sanitizeInput(update.title);
    document.getElementById('updateDate').textContent = formattedDate;
    document.getElementById('updateAuthor').textContent = update.author ? `von ${sanitizeInput(update.author)}` : '';
    document.getElementById('updateBody').innerHTML = update.content
        .split('\n')
        .map(line => line.trim() ? `<p>${sanitizeInput(line)}</p>` : '')
        .join('');
    
    if (update.image) {
        const img = document.createElement('img');
        img.src = update.image;
        img.style.width = '100%';
        img.style.marginTop = '1rem';
        img.style.borderRadius = 'var(--border-radius-sm)';
        document.getElementById('updateBody').appendChild(img);
    }
    
    const metaHtml = update.avatar ? 
        `<img src="${update.avatar}" alt="" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 0.5rem; vertical-align: middle;"> ${sanitizeInput(update.author)}` :
        sanitizeInput(update.author);
    
    document.getElementById('updateMeta').innerHTML = metaHtml;
    document.getElementById('updateModal').style.display = 'block';
}

function closeUpdateModal() {
    document.getElementById('updateModal').style.display = 'none';
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', init);

// Theme toggle
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

// Mobile menu
document.getElementById('mobileMenuToggle').addEventListener('click', toggleMobileMenu);
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', toggleMobileMenu);
});

// Scroll events
window.addEventListener('scroll', () => {
    updateScrollProgress();
    handleBackToTop();
    resetSessionTimeout();
});

// Back to top
document.getElementById('backToTop').addEventListener('click', scrollToTop);

// Search and filter
document.getElementById('projectSearch').addEventListener('input', handleSearch);
document.querySelector('.filter-buttons').addEventListener('click', handleFilter);
document.getElementById('sortOrder')?.addEventListener('change', handleSort);
document.getElementById('viewToggle')?.addEventListener('click', toggleViewMode);
document.querySelector('.tab-navigation')?.addEventListener('click', handleClanTabClick);
document.getElementById('mobileMenu')?.addEventListener('click', handleClanTabClick);
document.querySelector('.content-area')?.addEventListener('click', handleClanTabClick);
document.querySelector('.footer')?.addEventListener('click', handleClanTabClick);

// Admin login
document.getElementById('googleLoginButton')?.addEventListener('click', signInWithGoogle);
document.getElementById('authSignOutButton')?.addEventListener('click', signOutGoogle);

// Admin forms
document.getElementById('addProjectForm').addEventListener('submit', handleAddProject);
document.getElementById('editProjectForm').addEventListener('submit', handleEditProject);
document.getElementById('statsForm').addEventListener('submit', handleStatsUpdate);
document.getElementById('settingsForm').addEventListener('submit', handleSettingsUpdate);
document.getElementById('securityForm')?.addEventListener('submit', handleSecurityUpdate);
document.getElementById('backupForm')?.addEventListener('submit', handleBackupSettings);
document.getElementById('apiForm')?.addEventListener('submit', handleAPIIntegration);
document.getElementById('memberForm')?.addEventListener('submit', handleMemberSave);
document.getElementById('socialDefinitionForm')?.addEventListener('submit', handleSocialDefinitionSave);
document.getElementById('internalContentForm')?.addEventListener('submit', handleInternalContentSave);
document.getElementById('eventForm')?.addEventListener('submit', handleEventSave);

document.addEventListener('change', (e) => {
    if (e.target.matches('#projectPlatform, #editProjectPlatform, .additional-platform-select')) {
        syncPlatformNameField(e.target);
    }

    if (e.target.matches('.member-social-enabled')) {
        const socialId = e.target.dataset.socialId;
        const row = document.querySelector(`.member-social-assignment[data-social-id="${socialId}"]`);
        const urlInput = row?.querySelector('.member-social-url');
        if (row && urlInput) {
            row.classList.toggle('active', e.target.checked);
            urlInput.classList.toggle('hidden', !e.target.checked);
            urlInput.required = e.target.checked;
            if (!e.target.checked) {
                urlInput.value = '';
            }
            updateMemberSocialAssignmentPreview(socialId);
        }
    }
});

document.addEventListener('input', (e) => {
    if (e.target.matches('#memberImage')) {
        updateMemberImagePreview();
    }

    if (e.target.matches('#socialDefinitionName, #socialDefinitionIcon')) {
        updateSocialDefinitionPreview();
    }

    if (e.target.matches('.member-social-url')) {
        updateMemberSocialAssignmentPreview(e.target.dataset.socialId);
    }
});

// Admin tabs
document.querySelector('.admin-tabs').addEventListener('click', handleAdminTabs);

// Contact form
document.getElementById('contactForm')?.addEventListener('submit', handleContactForm);
document.getElementById('membersGrid')?.addEventListener('click', (e) => {
    const button = e.target.closest('.member-project-link');
    if (!button) {
        return;
    }

    focusProjectFromMember(button.dataset.projectId);
});

// Newsletter form
document.getElementById('newsletterForm')?.addEventListener('submit', handleNewsletterForm);

// Legal links
document.getElementById('impressumLink').addEventListener('click', (e) => {
    e.preventDefault();
    showImpressum();
});

document.getElementById('datenschutzLink').addEventListener('click', (e) => {
    e.preventDefault();
    showDatenschutz();
});

// Modal close on outside click
window.addEventListener('click', (e) => {
    const modals = ['adminModal', 'editProjectModal', 'legalModal', 'shareModal', 'qrModal', 'shortcutsModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', handleKeyboardShortcuts);

// Activity logging for user interactions
document.addEventListener('click', (e) => {
    if (e.target.closest('.project-link')) {
        logActivity('project_click', 'User clicked on project link');
    }
});

// Visibility change - log when user leaves/returns
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        logActivity('page_hidden', 'User left the page');
    } else {
        logActivity('page_visible', 'User returned to the page');
    }
});

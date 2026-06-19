// Multi-Language Support (i18n) for Karlali Landing Page
// To add more languages, simply add new language objects

const translations = {
    de: {
        // Navigation
        nav_home: "Home",
        nav_projects: "Projekte",
        nav_about: "Über mich",
        nav_contact: "Kontakt",
        nav_admin: "Admin",
        
        // Hero
        hero_title: "Karlali",
        hero_subtitle: "Creator • Developer • Visionary",
        hero_description: "Ich kreative digitale Erlebnisse und bringe Ideen zum Leben",
        hero_projects: "Meine Projekte",
        hero_contact: "Kontakt",
        
        // Projects
        projects_title: "Meine Projekte",
        projects_subtitle: "Entdecke meine kreativen Werke",
        projects_search: "Projekte durchsuchen...",
        projects_filter_all: "Alle",
        projects_filter_github: "GitHub",
        projects_filter_modrinth: "Modrinth",
        projects_filter_curseforge: "CurseForge",
        projects_filter_other: "Andere",
        projects_sort_newest: "Neueste zuerst",
        projects_sort_oldest: "Älteste zuerst",
        projects_sort_downloads: "Meiste Downloads",
        projects_sort_name: "Alphabetisch",
        projects_empty: "Keine Projekte gefunden",
        project_view: "Projekt ansehen",
        project_share: "Teilen",
        project_qr: "QR Code",
        project_featured: "⭐ Featured",
        
        // About
        about_title: "Über mich",
        about_text1: "Hi! Ich bin Karlali, ein passionierter Creator, der digitale Ideen in Wirklichkeit verwandelt. Meine Projekte spannen von Mods über Tools bis hin zu kreativen Anwendungen.",
        about_text2: "Ich glaube daran, dass Technologie Menschen verbinden und bereichern kann. Jedes Projekt ist eine neue Möglichkeit, etwas Besonderes zu schaffen.",
        stat_projects: "Projekte",
        stat_downloads: "Downloads",
        stat_community: "Community",
        stat_views: "Seitenaufrufe",
        
        // Contact
        contact_title: "Kontakt",
        contact_heading: "Lass uns connecten!",
        contact_text: "Folge mir auf meinen Plattformen oder schreib mir eine Nachricht.",
        contact_name: "Dein Name",
        contact_email: "Deine E-Mail",
        contact_message: "Deine Nachricht",
        contact_send: "Nachricht senden",
        contact_success: "Vielen Dank für deine Nachricht! Ich werde mich schnellstmöglich bei dir melden.",
        
        // Newsletter
        newsletter_title: "Newsletter abonnieren",
        newsletter_text: "Bleib auf dem Laufenden über neue Projekte, Updates und exklusive Inhalte!",
        newsletter_placeholder: "Deine E-Mail-Adresse",
        newsletter_subscribe: "Abonnieren",
        newsletter_success: "Erfolgreich für Newsletter angemeldet!",
        newsletter_already: "Diese E-Mail ist bereits angemeldet",
        
        // FAQ
        faq_title: "Häufig gestellte Fragen",
        
        // Testimonials
        testimonials_title: "Was andere sagen",
        
        // Blog
        blog_title: "Neueste Updates",
        blog_read_more: "Weiterlesen",
        blog_date: "Datum",
        blog_category: "Kategorie",
        
        // Footer
        footer_rights: "Alle Rechte vorbehalten.",
        footer_impressum: "Impressum",
        footer_privacy: "Datenschutz",
        
        // Admin
        admin_login_title: "Admin Login",
        admin_password: "Passwort eingeben",
        admin_login: "Einloggen",
        admin_wrong_password: "Falsches Passwort!",
        admin_panel_title: "Admin Panel",
        admin_close: "Schließen",
        admin_export: "Export",
        admin_import: "Import",
        
        admin_projects_tab: "Projekte",
        admin_stats_tab: "Statistiken",
        admin_settings_tab: "Einstellungen",
        admin_activity_tab: "Aktivität",
        
        admin_add_project: "Projekt hinzufügen",
        admin_manage_projects: "Projekte verwalten",
        admin_project_name: "Projekt Name",
        admin_project_description: "Beschreibung",
        admin_project_platform: "Plattform",
        admin_project_url: "Projekt URL",
        admin_project_image: "Bild URL",
        admin_project_downloads: "Downloads",
        admin_project_category: "Kategorie",
        admin_project_tags: "Tags (komma-getrennt)",
        admin_project_featured: "Als Featured markieren",
        admin_add_btn: "Projekt hinzufügen",
        
        admin_select_template: "Vorlage auswählen",
        admin_template_empty: "Leeres Projekt",
        admin_template_github: "GitHub Projekt",
        admin_template_modrinth: "Modrinth Mod",
        admin_template_curseforge: "CurseForge Projekt",
        admin_template_tool: "Tool/Utility",
        
        admin_bulk_select_all: "Alle auswählen",
        admin_bulk_deselect: "Auswahl aufheben",
        admin_bulk_delete: "Ausgewählte löschen",
        admin_bulk_duplicate: "Ausgewählte duplizieren",
        
        admin_edit: "Bearbeiten",
        admin_delete: "Löschen",
        admin_duplicate: "Duplizieren",
        
        admin_stats_dashboard: "Statistiken Dashboard",
        admin_platform_breakdown: "Plattform-Verteilung",
        admin_edit_stats: "Statistiken bearbeiten",
        admin_total_downloads: "Gesamt Downloads",
        admin_community_size: "Community Größe",
        admin_page_views: "Seitenaufrufe",
        admin_featured_projects: "Featured Projects",
        admin_update_stats: "Statistiken aktualisieren",
        
        admin_general_settings: "Allgemeine Einstellungen",
        admin_site_title: "Seitentitel",
        admin_site_description: "Seitenbeschreibung",
        admin_default_theme: "Standard-Theme",
        admin_save_settings: "Einstellungen speichern",
        
        admin_security_settings: "Sicherheit",
        admin_change_password: "Admin Passwort ändern",
        admin_new_password: "Neues Passwort",
        admin_confirm_password: "Passwort bestätigen",
        admin_session_timeout: "Session Timeout (Minuten)",
        admin_enable_audit_log: "Audit-Log aktivieren",
        admin_save_security: "Sicherheitseinstellungen speichern",
        
        admin_backup_settings: "Backup & Automatisierung",
        admin_auto_backup: "Automatisches Backup aktivieren",
        admin_backup_interval: "Backup-Intervall (Stunden)",
        admin_backup_retention: "Backup-Aufbewahrung (Tage)",
        admin_create_backup: "Jetzt Backup erstellen",
        admin_backup_history: "Backup-Historie",
        
        admin_api_integrations: "API Integrationen",
        admin_discord_webhook: "Discord Webhook URL",
        admin_discord_notify_new: "Benachrichtigung bei neuem Projekt",
        admin_discord_notify_update: "Benachrichtigung bei Updates",
        admin_github_token: "GitHub Personal Access Token",
        admin_test_webhook: "Webhook testen",
        admin_save_integrations: "Integrationen speichern",
        
        admin_data_management: "Daten",
        admin_clear_all: "Alle Daten löschen",
        
        admin_activity_log: "Aktivitätsprotokoll",
        admin_no_activity: "Keine Aktivitäten bisher.",
        
        // Toast Messages
        toast_success: "Erfolg",
        toast_error: "Fehler",
        toast_warning: "Warnung",
        toast_info: "Info",
        toast_saved: "Gespeichert!",
        toast_copied: "Kopiert!",
        toast_deleted: "Gelöscht!",
        toast_added: "Hinzugefügt!",
        toast_updated: "Aktualisiert!",
        
        // Modals
        modal_close: "Schließen",
        share_title: "Teilen",
        share_twitter: "Twitter",
        share_facebook: "Facebook",
        share_linkedin: "LinkedIn",
        share_whatsapp: "WhatsApp",
        share_reddit: "Reddit",
        share_copy: "Link kopieren",
        
        qr_title: "QR Code",
        qr_download: "QR Code herunterladen",
        
        shortcuts_title: "Tastaturkürzel",
        shortcuts_search: "Fokus Suchfeld",
        shortcuts_new_project: "Neues Projekt (Admin)",
        shortcuts_save: "Speichern",
        shortcuts_export: "Exportieren",
        shortcuts_import: "Importieren",
        shortcuts_help: "Dieses Menü",
        shortcuts_escape: "Modals schließen",
        shortcuts_theme: "Dark/Light Mode",
        
        // Validation
        validation_required: "Bitte füllen Sie alle Pflichtfelder aus",
        validation_email: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
        validation_url: "Bitte geben Sie eine gültige URL ein",
        validation_password_match: "Passwörter stimmen nicht überein",
        validation_password_weak: "Passwort zu schwach",
        validation_no_selection: "Keine Projekte ausgewählt",
        
        // Confirmations
        confirm_delete_project: "Möchtest du dieses Projekt wirklich löschen?",
        confirm_bulk_delete: "Möchtest du {count} Projekte wirklich löschen?",
        confirm_clear_data: "WARNUNG: Dies werden ALLE Daten löschen. Diese Aktion kann nicht rückgängig gemacht werden. Möchten Sie wirklich fortfahren?",
        confirm_absolutely_sure: "Sind Sie ABSOLUT sicher? Alle Projekte, Einstellungen und Aktivitäten werden gelöscht."
    },
    
    en: {
        // Navigation
        nav_home: "Home",
        nav_projects: "Projects",
        nav_about: "About",
        nav_contact: "Contact",
        nav_admin: "Admin",
        
        // Hero
        hero_title: "Karlali",
        hero_subtitle: "Creator • Developer • Visionary",
        hero_description: "I create digital experiences and bring ideas to life",
        hero_projects: "My Projects",
        hero_contact: "Contact",
        
        // Projects
        projects_title: "My Projects",
        projects_subtitle: "Discover my creative works",
        projects_search: "Search projects...",
        projects_filter_all: "All",
        projects_filter_github: "GitHub",
        projects_filter_modrinth: "Modrinth",
        projects_filter_curseforge: "CurseForge",
        projects_filter_other: "Other",
        projects_sort_newest: "Newest first",
        projects_sort_oldest: "Oldest first",
        projects_sort_downloads: "Most downloads",
        projects_sort_name: "Alphabetical",
        projects_empty: "No projects found",
        project_view: "View Project",
        project_share: "Share",
        project_qr: "QR Code",
        project_featured: "⭐ Featured",
        
        // About
        about_title: "About Me",
        about_text1: "Hi! I'm Karlali, a passionate creator who transforms digital ideas into reality. My projects span from mods to tools to creative applications.",
        about_text2: "I believe that technology can connect and enrich people. Each project is a new opportunity to create something special.",
        stat_projects: "Projects",
        stat_downloads: "Downloads",
        stat_community: "Community",
        stat_views: "Page Views",
        
        // Contact
        contact_title: "Contact",
        contact_heading: "Let's connect!",
        contact_text: "Follow me on my platforms or send me a message.",
        contact_name: "Your Name",
        contact_email: "Your Email",
        contact_message: "Your Message",
        contact_send: "Send Message",
        contact_success: "Thank you for your message! I'll get back to you as soon as possible.",
        
        // Newsletter
        newsletter_title: "Subscribe to Newsletter",
        newsletter_text: "Stay up to date with new projects, updates and exclusive content!",
        newsletter_placeholder: "Your email address",
        newsletter_subscribe: "Subscribe",
        newsletter_success: "Successfully subscribed to newsletter!",
        newsletter_already: "This email is already subscribed",
        
        // FAQ
        faq_title: "Frequently Asked Questions",
        
        // Testimonials
        testimonials_title: "What others say",
        
        // Blog
        blog_title: "Latest Updates",
        blog_read_more: "Read more",
        blog_date: "Date",
        blog_category: "Category",
        
        // Footer
        footer_rights: "All rights reserved.",
        footer_impressum: "Imprint",
        footer_privacy: "Privacy Policy",
        
        // Admin
        admin_login_title: "Admin Login",
        admin_password: "Enter password",
        admin_login: "Login",
        admin_wrong_password: "Wrong password!",
        admin_panel_title: "Admin Panel",
        admin_close: "Close",
        admin_export: "Export",
        admin_import: "Import",
        
        admin_projects_tab: "Projects",
        admin_stats_tab: "Statistics",
        admin_settings_tab: "Settings",
        admin_activity_tab: "Activity",
        
        admin_add_project: "Add Project",
        admin_manage_projects: "Manage Projects",
        admin_project_name: "Project Name",
        admin_project_description: "Description",
        admin_project_platform: "Platform",
        admin_project_url: "Project URL",
        admin_project_image: "Image URL",
        admin_project_downloads: "Downloads",
        admin_project_category: "Category",
        admin_project_tags: "Tags (comma-separated)",
        admin_project_featured: "Mark as Featured",
        admin_add_btn: "Add Project",
        
        admin_select_template: "Select template",
        admin_template_empty: "Empty Project",
        admin_template_github: "GitHub Project",
        admin_template_modrinth: "Modrinth Mod",
        admin_template_curseforge: "CurseForge Project",
        admin_template_tool: "Tool/Utility",
        
        admin_bulk_select_all: "Select All",
        admin_bulk_deselect: "Deselect",
        admin_bulk_delete: "Delete Selected",
        admin_bulk_duplicate: "Duplicate Selected",
        
        admin_edit: "Edit",
        admin_delete: "Delete",
        admin_duplicate: "Duplicate",
        
        admin_stats_dashboard: "Statistics Dashboard",
        admin_platform_breakdown: "Platform Breakdown",
        admin_edit_stats: "Edit Statistics",
        admin_total_downloads: "Total Downloads",
        admin_community_size: "Community Size",
        admin_page_views: "Page Views",
        admin_featured_projects: "Featured Projects",
        admin_update_stats: "Update Statistics",
        
        admin_general_settings: "General Settings",
        admin_site_title: "Site Title",
        admin_site_description: "Site Description",
        admin_default_theme: "Default Theme",
        admin_save_settings: "Save Settings",
        
        admin_security_settings: "Security",
        admin_change_password: "Change Admin Password",
        admin_new_password: "New Password",
        admin_confirm_password: "Confirm Password",
        admin_session_timeout: "Session Timeout (Minutes)",
        admin_enable_audit_log: "Enable Audit Log",
        admin_save_security: "Save Security Settings",
        
        admin_backup_settings: "Backup & Automation",
        admin_auto_backup: "Enable Automatic Backup",
        admin_backup_interval: "Backup Interval (Hours)",
        admin_backup_retention: "Backup Retention (Days)",
        admin_create_backup: "Create Backup Now",
        admin_backup_history: "Backup History",
        
        admin_api_integrations: "API Integrations",
        admin_discord_webhook: "Discord Webhook URL",
        admin_discord_notify_new: "Notify on New Project",
        admin_discord_notify_update: "Notify on Updates",
        admin_github_token: "GitHub Personal Access Token",
        admin_test_webhook: "Test Webhook",
        admin_save_integrations: "Save Integrations",
        
        admin_data_management: "Data",
        admin_clear_all: "Clear All Data",
        
        admin_activity_log: "Activity Log",
        admin_no_activity: "No activity yet.",
        
        // Toast Messages
        toast_success: "Success",
        toast_error: "Error",
        toast_warning: "Warning",
        toast_info: "Info",
        toast_saved: "Saved!",
        toast_copied: "Copied!",
        toast_deleted: "Deleted!",
        toast_added: "Added!",
        toast_updated: "Updated!",
        
        // Modals
        modal_close: "Close",
        share_title: "Share",
        share_twitter: "Twitter",
        share_facebook: "Facebook",
        share_linkedin: "LinkedIn",
        share_whatsapp: "WhatsApp",
        share_reddit: "Reddit",
        share_copy: "Copy Link",
        
        qr_title: "QR Code",
        qr_download: "Download QR Code",
        
        shortcuts_title: "Keyboard Shortcuts",
        shortcuts_search: "Focus Search",
        shortcuts_new_project: "New Project (Admin)",
        shortcuts_save: "Save",
        shortcuts_export: "Export",
        shortcuts_import: "Import",
        shortcuts_help: "This Menu",
        shortcuts_escape: "Close Modals",
        shortcuts_theme: "Dark/Light Mode",
        
        // Validation
        validation_required: "Please fill in all required fields",
        validation_email: "Please enter a valid email address",
        validation_url: "Please enter a valid URL",
        validation_password_match: "Passwords do not match",
        validation_password_weak: "Password too weak",
        validation_no_selection: "No projects selected",
        
        // Confirmations
        confirm_delete_project: "Do you really want to delete this project?",
        confirm_bulk_delete: "Do you really want to delete {count} projects?",
        confirm_clear_data: "WARNING: This will delete ALL data. This action cannot be undone. Do you really want to continue?",
        confirm_absolutely_sure: "Are you ABSOLUTELY sure? All projects, settings and activities will be deleted."
    }
};

// Language detection and application
function detectLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];
    
    // Check if language is supported
    if (translations[langCode]) {
        return langCode;
    }
    
    // Default to German
    return 'de';
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('karlali_language', lang);
    applyTranslations();
}

function applyTranslations() {
    const lang = currentLanguage || detectLanguage();
    const t = translations[lang] || translations.de;
    
    // Apply translations to elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (t[key]) {
            if (element.tagName === 'INPUT' && element.placeholder) {
                element.placeholder = t[key];
            } else {
                element.textContent = t[key];
            }
        }
    });
    
    // Update language selector if exists
    const langSelector = document.getElementById('languageSelector');
    if (langSelector) {
        langSelector.value = lang;
    }
}

// Initialize language
let currentLanguage = localStorage.getItem('karlali_language') || detectLanguage();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { translations, setLanguage, applyTranslations, detectLanguage };
}

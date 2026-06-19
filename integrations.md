# Plattform-Integrationen

Hier findest du Beispiele und Anleitungen für die Integration verschiedener Plattformen in deine Landing Page.

## GitHub

### Projekt-URL Format
```
https://github.com/BENUTZERNAME/PROJEKTNAME
```

### Beispiel
```json
{
  "name": "Mein Cooles Projekt",
  "description": "Ein tolles GitHub Projekt",
  "platform": "github",
  "url": "https://github.com/deinusername/deinprojekt",
  "image": "https://repository-images.githubusercontent.com/...",
  "downloads": 100
}
```

### Bild URL erhalten
1. Gehe zu deinem GitHub Repository
2. Klicke auf das Repository-Bild
3. Kopiere die Bild-URL

## Modrinth

### Projekt-URL Format
```
https://modrinth.com/mod/PROJEKT-SLUG
```

### Beispiel
```json
{
  "name": "Mein Mod",
  "description": "Ein Minecraft Mod für Modrinth",
  "platform": "modrinth",
  "url": "https://modrinth.com/mod/dein-mod-slug",
  "image": "https://cdn.modrinth.com/...",
  "downloads": 5000
}
```

### API Nutzen (optional)
Du kannst die Modrinth API nutzen um automatische Downloads zu erhalten:
```
https://api.modrinth.com/v2/project/PROJECT_SLUG
```

## CurseForge

### Projekt-URL Format
```
https://www.curseforge.com/minecraft/mc-mods/PROJEKT-SLUG
```

### Beispiel
```json
{
  "name": "Mein CurseForge Projekt",
  "description": "Ein Projekt auf CurseForge",
  "platform": "curseforge",
  "url": "https://www.curseforge.com/minecraft/mc-mods/dein-projekt",
  "image": "https://media.forgecdn.net/...",
  "downloads": 10000
}
```

### Bild URL erhalten
1. Gehe zu deinem CurseForge Projekt
2. Rechtsklick auf das Projekt-Bild
3. "Bildadresse kopieren"

## Andere Plattformen

### YouTube
```json
{
  "name": "Mein Kanal",
  "description": "Tech Tutorials und mehr",
  "platform": "other",
  "url": "https://youtube.com/@deinkanal",
  "image": "https://yt3.googleusercontent.com/...",
  "downloads": 0
}
```

### Twitch
```json
{
  "name": "Mein Stream",
  "description": "Live Gaming und Kreativität",
  "platform": "other",
  "url": "https://twitch.tv/deinusername",
  "image": "https://static-cdn.jtvnw.net/...",
  "downloads": 0
}
```

### Discord
```json
{
  "name": "Mein Discord Server",
  "description": "Community Server",
  "platform": "other",
  "url": "https://discord.gg/DEININVITE",
  "image": "https://cdn.discordapp.com/...",
  "downloads": 0
}
```

### Portfolio/Website
```json
{
  "name": "Meine Portfolio Seite",
  "description": "Weitere Projekte und Informationen",
  "platform": "other",
  "url": "https://deine-website.com",
  "image": "https://deine-website.com/og-image.jpg",
  "downloads": 0
}
```

## Automatische Integration (Optional)

Für fortgeschrittene Nutzer kannst du APIs nutzen um Daten automatisch zu laden:

### GitHub API
```javascript
fetch('https://api.github.com/repos/username/repo')
  .then(response => response.json())
  .then(data => {
    // data.stargazers_count für Sterne
    // data.forks_count für Forks
    // data.subscribers_count für Watcher
  });
```

### Modrinth API
```javascript
fetch('https://api.modrinth.com/v2/project/project-slug')
  .then(response => response.json())
  .then(data => {
    // data.downloads für Downloads
    // data.followers für Follower
  });
```

## Best Practices

### Bilder
- Verwende quadratische Bilder (1:1 Ratio) oder 16:9 für Projekt-Cards
- Mindestens 400x200 Pixel für gute Qualität
- Komprimiere Bilder für schnellere Ladezeiten

### Beschreibungen
- Halte Beschreibungen kurz und prägnant (max 150 Zeichen)
- Fokus auf den Nutzen für den Nutzer
- Verwende Keywords für bessere Auffindbarkeit

### URLs
- Stelle sicher, dass alle URLs korrekt sind
- Verwende HTTPS wo möglich
- Teste Links vor dem Veröffentlichen

## Plattform-spezifische Metriken

### GitHub
- ⭐ Stars
- 🍴 Forks
- 👀 Watchers

### Modrinth
- 📥 Downloads
- 👥 Followers
- 🏷️ Categories

### CurseForge
- 📥 Downloads
- 👍 Likes
- ⭐ Favorites

## Icons und Farben

Die Plattformen haben zugewiesene Icons und Farben:

| Plattform | Icon | Farbe |
|-----------|------|-------|
| GitHub | `fab fa-github` | `#6366f1` |
| Modrinth | `fas fa-cube` | `#10b981` |
| CurseForge | `fas fa-fire` | `#ef4444` |
| Andere | `fas fa-star` | `#f472b6` |

## Social Media Links

In der Contact Section kannst du deine Social Media Links hinzufügen:

```html
<a href="DEIN_LINK" class="social-link" title="PLATFORM">
    <i class="ICON_CLASS"></i>
</a>
```

Verfügbare Icons: `fab fa-github`, `fab fa-discord`, `fab fa-youtube`, `fab fa-twitch`, `fab fa-twitter`, `fas fa-cube`, `fas fa-fire`

---

Diese Integrationen machen deine Landing Page zum zentralen Hub für all deine kreativen Projekte!
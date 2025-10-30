# ClassFlow

A responsive, themeable static website to help students track assignments and test due dates, upload and organize notes, and manage their coursework entirely in the browser.

## Features

### ✅ Core Features
- **Dashboard**: View upcoming deadlines, recent uploads, and quick progress summary
- **Assignment Management**: Create, edit, delete assignments with due dates, priorities, and requirements
- **Course Organization**: Manage courses with custom colors and metadata
- **File Uploads**: Store PDFs, PPTX, DOCX, images, and ZIP files client-side
- **Multiple Views**: Dashboard, Calendar, Kanban board, Courses, and Analytics
- **Overdue Warnings**: Visual indicators and banners for overdue assignments
- **Browser Notifications**: Configurable reminders before due dates
- **Theme System**: Light, Dark, and seasonal themes (Halloween, Winter, Spring)
- **Export/Import**: Backup and restore all data as JSON
- **Calendar Export**: Download assignments as ICS file for external calendars
- **Search & Filter**: Find assignments by course, status, or keywords
- **Smooth Animations**: 25+ professional animations including confetti celebrations, toast notifications, and smooth transitions

### 🎨 Themes
- **Light**: Clean, professional default theme
- **Dark**: Easy on the eyes for night studying
- **Halloween 🎃**: Spooky orange and purple
- **Winter ❄️**: Cool blue winter vibes
- **Spring 🌸**: Fresh pink and floral

### 📊 Analytics
- Workload overview (doughnut chart)
- Course progress tracking (bar chart)
- Completion statistics

## Tech Stack

**100% Client-Side** - No server required!

- **HTML5** for structure
- **CSS3** with CSS Variables for theming and animations
- **Vanilla JavaScript** (ES6+)
- **IndexedDB** (via localForage) for persistent storage
- **PDF.js** for PDF preview (included via CDN)
- **Chart.js** for analytics visualization
- **Custom Animation Engine** with confetti physics and smooth transitions

## Getting Started

### Local Development

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. That's it! The app runs entirely in your browser

" ***Please note if you want more info on setting it up, you can veiw the deployment file*** "

## Usage Guide

### Adding a Course
1. Navigate to **Courses** view
2. Click **+ New Course**
3. Fill in course details (name, code, instructor, semester, color)
4. Click **Save Course**

### Creating an Assignment
1. Click **+ New Assignment** from Dashboard
2. Enter assignment details:
   - Title (required)
   - Course (required)
   - Due date and time
   - Status (To Do, In Progress, Completed)
   - Priority (Low, Medium, High)
   - Notes, requirements, tags
3. Upload files by dragging & dropping or clicking the upload area
4. Click **Save Assignment**

### Marking Complete
- Click **✓ Mark Complete** on any assignment card
- Or edit the assignment and change status to "Completed"

### Filtering & Searching
- Use the **Course** and **Status** dropdowns to filter
- Type in the **Search** box to find assignments by title, notes, or tags

### Exporting Data
1. Click ⚙️ **Settings** button
2. Click **Export All Data** to download a JSON backup
3. Click **Export ICS** (on Calendar view) to export calendar events

### Importing Data
1. Click ⚙️ **Settings** button
2. Click **Import Data**
3. Select a previously exported JSON file

### Changing Themes
1. Click 🎨 **Theme** button
2. Select a preset theme
3. Theme is saved automatically

### Browser Notifications
1. Click ⚙️ **Settings** button
2. Enable browser notifications
3. Grant permission when prompted
4. Set how many days in advance to be reminded
5. Notifications will appear for upcoming deadlines

## Data Storage

All data is stored **locally in your browser** using IndexedDB:
- ✅ Works offline
- ✅ No server costs
- ✅ Privacy-first (data never leaves your device)
- ⚠️ Data is device-specific (not synced across devices)
- ⚠️ Clearing browser data will delete assignments

**Recommendation**: Export your data regularly as a backup!

## Browser Compatibility

Requires a modern browser with support for:
- ES6+ JavaScript
- IndexedDB
- CSS Grid & Flexbox
- Notification API (for reminders)

**Tested on:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## File Size Limits

Client-side storage has limits (typically 50-100MB+, varies by browser). Large files or many uploads may hit storage quotas. The app will warn if storage is running low.

## Future Enhancements

Potential additions (contributions welcome!):
- [ ] OCR text extraction with Tesseract.js
- [ ] Recurring assignments
- [ ] Syllabus auto-scan (extract assignments from uploaded PDFs)
- [ ] Lecture notes management
- [ ] More theme customization options
- [ ] Workload heatmap calendar view
- [ ] Export assignments as PDF report
- [ ] Multi-device sync via export/import
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

## Contributing

This is a static site project - feel free to:
1. Fork the repository
2. Make improvements
3. Submit a pull request

## License

MIT License - Free to use, modify, and distribute

## Credits

Built with for students who want a simple, private and capable assignment tracker.

**Libraries Used:**
- [localForage](https://localforage.github.io/localForage/) - IndexedDB wrapper
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering
- [Chart.js](https://www.chartjs.org/) - Charts & analytics

---

**ClassFlow** - Track smarter, not harder 📚✨

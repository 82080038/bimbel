# Storage Strategy for Bahan Pelajaran

## Context
- All soal will be analyzed to crawl bahan pelajaran
- Tips for soal (tips_soal) and bahan pelajaran (tips_tricks) will be generated
- Bahan pelajaran data will be very large (text, video, PDF, images, etc.)

## Storage Options Analysis

### Option 1: Full Database Storage
**Pros:**
- Easy to query and search
- Consistent with existing architecture
- Easy to backup with database
- ACID transactions
- Easy to relate to soal via foreign keys
- Can use MySQL full-text search

**Cons:**
- Large data can slow down database performance
- Database size grows quickly (16,534 soal × multiple materials)
- Backup/restore takes longer
- May hit database size limits
- Not ideal for large binary files (PDF, video, images)
- Increased memory usage during queries

### Option 2: Full File System Storage
**Pros:**
- Better for large files (PDF, video, images)
- Database stays smaller and faster
- Can use CDN for distribution
- Easier to serve static files directly
- Can compress files
- No database size limits

**Cons:**
- Need to handle file management (creation, deletion, updates)
- Harder to search content (need to index separately)
- Need to handle file permissions
- Backup is separate from database
- Orphaned files risk if not managed properly
- Harder to implement full-text search

### Option 3: Hybrid Storage (RECOMMENDED)
**Approach:**
- Store metadata in database (title, type, url, file_path, soal_id, etc.)
- Store actual content in file system
- Use database for searching and relationships
- Use file system for serving large content

**Pros:**
- Best of both worlds
- Database stays fast and small
- File system handles large files efficiently
- Easy to search via metadata
- Can implement full-text search with external index
- Easy to backup (database + files separately)
- Can use CDN for file distribution
- Flexible for different content types

**Cons:**
- More complex architecture
- Need to manage file cleanup
- Need to ensure consistency between DB and files

## Recommended Implementation

### File System Structure
```
/opt/lampp/htdocs/ujian/
├── uploads/
│   ├── bahan_pelajaran/
│   │   ├── text/          # Markdown/HTML files
│   │   ├── pdf/           # PDF files
│   │   ├── video/         # Video files
│   │   ├── image/         # Images
│   │   └── other/         # Other file types
│   └── tips/              # Tips materials
└── assets/
```

### Database Schema (Already Exists)
```sql
-- Current bahan_pelajarantable already has:
-- id, soal_id, judul, konten, tipe, url, file_path, urutan, created_at, updated_at
-- This is perfect for hybrid storage
```

### Storage Rules
1. **Text content (< 1MB)**: Store in database (konten field)
2. **Text content (>= 1MB)**: Store as file, path in file_path
3. **PDF files**: Store in uploads/bahan_pelajaran/pdf/, path in file_path
4. **Video files**: Store in uploads/bahan_pelajaran/video/, path in file_path
5. **Images**: Store in uploads/bahan_pelajaran/image/, path in file_path
6. **External links**: Store URL in url field, no file needed
7. **Tips**: Store in database (usually small text)

### API Updates Needed
```php
// Add file upload handling
function saveBahanPelajaran() {
    // Check if file uploaded
    // Validate file type and size
    // Move to appropriate folder
    // Store path in database
}

// Add file serving endpoint
function getBahanPelajaranFile($id) {
    // Get file_path from database
    // Serve file with proper headers
}
```

### Frontend Updates Needed
- Add file upload component in admin panel
- Add file preview for PDF/video/images
- Add file download functionality
- Update bahan pelajaran display to handle both DB and file content

## Content Crawl Strategy

### Step 1: Analyze Soal
- Group soal by kategori and topik
- Identify common themes and concepts
- Determine learning objectives

### Step 2: Generate Bahan Pelajaran
- For each topik, create learning materials:
  - Concept explanations (text)
  - Examples and exercises (text)
  - Reference materials (PDF/links)
  - Video tutorials (if available)

### Step 3: Generate Tips
- tips_soal: Specific tips for individual questions
- tips_tricks: General tips for categories/topics

### Step 4: Storage Decision
- Small text (< 1MB): Store in database
- Large text (>= 1MB): Store as file
- PDF/Video/Images: Always store as file
- Links: Store URL only

## Implementation Plan

### Phase 1: File System Setup
1. Create upload directories
2. Set proper permissions
3. Configure PHP upload settings

### Phase 2: API Updates
1. Add file upload handling
2. Add file serving endpoint
3. Update saveBahanPelajaran to handle files
4. Add file cleanup on delete

### Phase 3: Frontend Updates
1. Add file upload UI
2. Add file preview components
3. Add download functionality

### Phase 4: Content Generation
1. Implement soal analysis crawler
2. Implement bahan pelajaran generator
3. Implement tips generator
4. Apply storage rules based on content size/type

## Backup Strategy
1. Database backup (mysqldump)
2. File system backup (rsync/tar)
3. Separate schedules (database daily, files weekly)
4. Version control for file structure

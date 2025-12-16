// ========================================
// Application State
// ========================================

const appState = {
    slides: Array(15).fill(null).map((_, index) => ({
        id: index + 1,
        image: null,
        imagePreview: null,
        text: '',
        status: 'standby' // 'standby' | 'ready'
    })),
    settings: {
        transition: 'slideIn',
        font: 'Prompt',
        resolution: '2K'
    }
};

// ========================================
// DOM Elements
// ========================================

const slidesList = document.getElementById('slidesList');
const exportButton = document.getElementById('exportButton');
const exportDefault = document.getElementById('exportDefault');
const exportLoading = document.getElementById('exportLoading');
const exportSuccess = document.getElementById('exportSuccess');
const createAnotherButton = document.getElementById('createAnotherButton');
const fontSelect = document.getElementById('fontSelect');
const resolutionSelect = document.getElementById('resolutionSelect');

// ========================================
// Initialize Application
// ========================================

function init() {
    renderSlides();
    attachEventListeners();
    console.log('✨ makeAclip initialized');
}

// ========================================
// Render Slides
// ========================================

function renderSlides() {
    slidesList.innerHTML = '';
    
    appState.slides.forEach((slide, index) => {
        const slideElement = createSlideElement(slide, index);
        slidesList.appendChild(slideElement);
    });
}

function createSlideElement(slide, index) {
    const slideDiv = document.createElement('div');
    slideDiv.className = 'slide-block';
    slideDiv.dataset.index = index;
    
    slideDiv.innerHTML = `
        <div class="image-slot">
            <div class="slide-number">#${slide.id}</div>
            <div class="image-preview ${slide.imagePreview ? 'has-image' : ''}" data-index="${index}">
                ${slide.imagePreview 
                    ? `<img src="${slide.imagePreview}" alt="Slide ${slide.id}" class="preview-image">` 
                    : '<span class="image-placeholder">📷</span>'}
            </div>
            <input 
                type="file" 
                id="fileInput-${index}" 
                accept="image/*" 
                style="display: none;"
                data-index="${index}">
            <button class="upload-button" data-index="${index}">
                ${slide.imagePreview ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}
            </button>
        </div>
        
        <div class="text-content">
            <textarea 
                class="slide-textarea" 
                placeholder="ใส่ข้อความสำหรับภาพนี้..."
                rows="4"
                data-index="${index}"
                maxlength="200">${slide.text}</textarea>
            
            <div class="slide-footer">
                <span class="char-count">
                    <span class="current-count">${slide.text.length}</span>/200
                </span>
                <button class="status-button ${slide.status}" data-index="${index}">
                    <span class="status-dot"></span>
                    ${slide.status === 'standby' ? 'Stand By' : 'Ready'}
                </button>
            </div>
        </div>
    `;
    
    return slideDiv;
}

// ========================================
// Event Listeners
// ========================================

function attachEventListeners() {
    // Upload button clicks
    slidesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('upload-button')) {
            const index = parseInt(e.target.dataset.index);
            const fileInput = document.getElementById(`fileInput-${index}`);
            fileInput.click();
        }
        
        // Status button toggle
        if (e.target.classList.contains('status-button') || e.target.closest('.status-button')) {
            const button = e.target.classList.contains('status-button') 
                ? e.target 
                : e.target.closest('.status-button');
            const index = parseInt(button.dataset.index);
            toggleSlideStatus(index);
        }
    });
    
    // File input changes
    slidesList.addEventListener('change', (e) => {
        if (e.target.type === 'file') {
            const index = parseInt(e.target.dataset.index);
            handleImageUpload(e.target.files[0], index);
        }
    });
    
    // Text input changes
    slidesList.addEventListener('input', (e) => {
        if (e.target.classList.contains('slide-textarea')) {
            const index = parseInt(e.target.dataset.index);
            const text = e.target.value;
            updateSlideText(index, text);
            
            // Update character count
            const slideBlock = e.target.closest('.slide-block');
            const charCount = slideBlock.querySelector('.current-count');
            charCount.textContent = text.length;
        }
    });
    
    // Transition selector
    const segmentButtons = document.querySelectorAll('.segment-button');
    segmentButtons.forEach(button => {
        button.addEventListener('click', () => {
            segmentButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-checked', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-checked', 'true');
            appState.settings.transition = button.dataset.value;
            console.log('Transition set to:', appState.settings.transition);
        });
    });
    
    // Font selector
    fontSelect.addEventListener('change', (e) => {
        appState.settings.font = e.target.value;
        console.log('Font set to:', appState.settings.font);
    });
    
    // Resolution selector
    resolutionSelect.addEventListener('change', (e) => {
        appState.settings.resolution = e.target.value;
        console.log('Resolution set to:', appState.settings.resolution);
    });
    
    // Export button
    exportButton.addEventListener('click', handleExport);
    
    // Create another button
    createAnotherButton.addEventListener('click', resetApp);
}

// ========================================
// Core Functions
// ========================================

function handleImageUpload(file, index) {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
    }
    
    // Read file and create preview
    const reader = new FileReader();
    reader.onload = (e) => {
        appState.slides[index].image = file;
        appState.slides[index].imagePreview = e.target.result;
        
        // Auto-update status if has image and text
        if (appState.slides[index].text) {
            appState.slides[index].status = 'ready';
        }
        
        // Re-render this specific slide
        renderSlides();
        console.log(`Image uploaded for slide ${index + 1}`);
    };
    
    reader.readAsDataURL(file);
}

function updateSlideText(index, text) {
    appState.slides[index].text = text;
    
    // Auto-update status if has both image and text
    if (appState.slides[index].imagePreview && text.trim()) {
        appState.slides[index].status = 'ready';
        renderSlides();
    }
}

function toggleSlideStatus(index) {
    const slide = appState.slides[index];
    
    // Only allow ready status if both image and text exist
    if (!slide.imagePreview || !slide.text.trim()) {
        alert('กรุณาเพิ่มรูปภาพและข้อความก่อน');
        return;
    }
    
    slide.status = slide.status === 'standby' ? 'ready' : 'standby';
    renderSlides();
}

function handleExport() {
    // Validate at least one slide is ready
    const readySlides = appState.slides.filter(slide => slide.status === 'ready');
    
    if (readySlides.length === 0) {
        alert('กรุณาเตรียมสไลด์อย่างน้อย 1 สไลด์ให้พร้อม (มีรูปและข้อความ)');
        return;
    }
    
    console.log('Exporting video with settings:', appState.settings);
    console.log('Ready slides:', readySlides.length);
    
    // Show loading state
    exportDefault.classList.remove('active');
    exportLoading.classList.add('active');
    
    // Simulate export process (replace with actual implementation later)
    setTimeout(() => {
        exportLoading.classList.remove('active');
        exportSuccess.classList.add('active');
        console.log('✅ Export completed!');
    }, 3000);
}

function resetApp() {
    // Reset state
    appState.slides = Array(15).fill(null).map((_, index) => ({
        id: index + 1,
        image: null,
        imagePreview: null,
        text: '',
        status: 'standby'
    }));
    
    // Reset UI
    renderSlides();
    exportSuccess.classList.remove('active');
    exportDefault.classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log('App reset');
}

// ========================================
// Start Application
// ========================================

document.addEventListener('DOMContentLoaded', init);

// ========================================
// Utility Functions
// ========================================

// Get current app state (useful for debugging)
function getState() {
    return appState;
}

// Export for console debugging
window.makeAclip = {
    getState,
    resetApp
};

console.log('💡 Debug commands available:');
console.log('  makeAclip.getState() - View current state');
console.log('  makeAclip.resetApp() - Reset application');

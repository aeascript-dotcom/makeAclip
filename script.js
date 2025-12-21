// ========================================
// Application State
// ========================================

const appState = {
    slides: Array(15).fill(null).map((_, index) => ({
        id: index + 1,
        image: null,
        imagePreview: null,
        text: ''
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
    
    const isReady = slide.imagePreview && slide.text.trim();
    const statusClass = isReady ? 'ready' : 'standby';
    const statusText = isReady ? 'Ready' : 'Stand By';

    slideDiv.innerHTML = `
        <div class="image-slot">
            <div class="slide-number">#${slide.id}</div>
            <div class="image-preview ${slide.imagePreview ? 'has-image' : ''}" id="preview-${index}">
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
            <button class="upload-button" id="uploadBtn-${index}" data-index="${index}">
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
                    <span class="current-count" id="charCount-${index}">${slide.text.length}</span>/200
                </span>
                <div class="status-badge ${statusClass}" id="status-${index}">
                    <span class="status-dot"></span>
                    <span class="status-text">${statusText}</span>
                </div>
            </div>
        </div>
    `;
    
    return slideDiv;
}

function updateSlideUI(index) {
    const slide = appState.slides[index];

    // Update Image Preview
    const previewContainer = document.getElementById(`preview-${index}`);
    const uploadBtn = document.getElementById(`uploadBtn-${index}`);

    if (slide.imagePreview) {
        previewContainer.classList.add('has-image');
        previewContainer.innerHTML = `<img src="${slide.imagePreview}" alt="Slide ${slide.id}" class="preview-image">`;
        uploadBtn.textContent = 'เปลี่ยนรูป';
    } else {
        previewContainer.classList.remove('has-image');
        previewContainer.innerHTML = '<span class="image-placeholder">📷</span>';
        uploadBtn.textContent = 'อัปโหลดรูป';
    }

    // Update Char Count
    const charCount = document.getElementById(`charCount-${index}`);
    if (charCount) {
        charCount.textContent = slide.text.length;
    }

    // Update Status Badge
    const statusBadge = document.getElementById(`status-${index}`);
    const statusTextSpan = statusBadge.querySelector('.status-text');
    const isReady = slide.imagePreview && slide.text.trim();

    if (isReady) {
        statusBadge.classList.remove('standby');
        statusBadge.classList.add('ready');
        statusTextSpan.textContent = 'Ready';
    } else {
        statusBadge.classList.remove('ready');
        statusBadge.classList.add('standby');
        statusTextSpan.textContent = 'Stand By';
    }
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
            appState.slides[index].text = text;
            updateSlideUI(index);
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
        });
    });
    
    // Font selector
    fontSelect.addEventListener('change', (e) => {
        appState.settings.font = e.target.value;
    });
    
    // Resolution selector
    resolutionSelect.addEventListener('change', (e) => {
        appState.settings.resolution = e.target.value;
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
        updateSlideUI(index);
    };
    
    reader.readAsDataURL(file);
}

function handleExport() {
    // Validate at least one slide is ready
    const readySlides = appState.slides.filter(slide => slide.imagePreview && slide.text.trim());
    
    if (readySlides.length === 0) {
        alert('กรุณาเตรียมสไลด์อย่างน้อย 1 สไลด์ให้พร้อม (มีรูปและข้อความ)');
        return;
    }
    
    console.log('Exporting video with settings:', appState.settings);
    console.log('Ready slides:', readySlides.length);
    
    // Show loading state
    exportDefault.classList.remove('active');
    exportLoading.classList.add('active');
    
    // Simulate export process
    setTimeout(() => {
        exportLoading.classList.remove('active');
        exportSuccess.classList.add('active');
    }, 3000);
}

function resetApp() {
    // Reset state
    appState.slides = Array(15).fill(null).map((_, index) => ({
        id: index + 1,
        image: null,
        imagePreview: null,
        text: ''
    }));
    
    // Reset UI
    renderSlides();
    exportSuccess.classList.remove('active');
    exportDefault.classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// Start Application
// ========================================

document.addEventListener('DOMContentLoaded', init);

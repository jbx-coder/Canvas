document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    const canvasContainer = document.getElementById('canvas-container');
    const colorButtons = document.querySelectorAll('.color-btn');
    const eraserBtn = document.getElementById('eraser');
    const clearBtn = document.getElementById('clear');
    const screenshotBtn = document.getElementById('screenshot');
    const deleteBtn = document.getElementById('delete');
    const toggleToolbarBtn = document.getElementById('toggle-toolbar');
    const toolbar = document.getElementById('toolbar');
    
    // 画板状态
    let isDrawing = false;
    let currentColor = 'black';
    let currentTool = 'pen';
    let startX, startY;
    
    // 初始化画布大小
    function initCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // 设置画布样式
    function setupCanvas() {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = currentTool === 'eraser' ? 20 : 5; // 橡皮擦尺寸较大
        ctx.strokeStyle = currentColor;
    }
    
    // 从本地存储加载画作
    function loadDrawing() {
        const savedData = localStorage.getItem('jbx-coder-canvas');
        if (savedData) {
            try {
                const drawingData = JSON.parse(savedData);
                const img = new Image();
                img.onload = function() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                };
                img.src = drawingData.imageData;
            } catch (e) {
                console.error('Failed to load drawing:', e);
            }
        }
    }
    
    // 自动保存画作到本地存储
    function saveDrawing() {
        const drawingData = {
            imageData: canvas.toDataURL('image/png'),
            timestamp: new Date().getTime()
        };
        localStorage.setItem('jbx-coder-canvas', JSON.stringify(drawingData));
    }
    
    // 清屏
    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveDrawing();
    }
    
    // 删除存档
    function deleteDrawing() {
        localStorage.removeItem('jbx-coder-canvas');
        clearCanvas();
    }
    
    // 截屏
    function takeScreenshot() {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'drawing-' + new Date().toISOString().slice(0, 10) + '.png';
        link.href = dataUrl;
        link.click();
    }
    
    // 初始化
    initCanvasSize();
    setupCanvas();
    loadDrawing();
    
    // 窗口大小改变时调整画布
    window.addEventListener('resize', function() {
        initCanvasSize();
        loadDrawing();
    });
    
    // 工具栏显示/隐藏
    toggleToolbarBtn.addEventListener('click', function() {
        toolbar.classList.toggle('hidden');
        this.textContent = toolbar.classList.contains('hidden') ? '显示工具栏' : '隐藏工具栏';
    });
    
    // 颜色选择
    colorButtons.forEach(button => {
        button.addEventListener('click', function() {
            colorButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentColor = this.id;
            currentTool = 'pen';
            eraserBtn.classList.remove('active');
            canvas.style.cursor = 'crosshair';
            setupCanvas();
        });
    });
    
    // 橡皮擦
    eraserBtn.addEventListener('click', function() {
        currentTool = 'eraser';
        this.classList.add('active');
        colorButtons.forEach(btn => btn.classList.remove('active'));
        canvas.style.cursor = 'crosshair';
        setupCanvas(); // 更新橡皮擦大小
    });
    

    
    // 截屏
    screenshotBtn.addEventListener('click', takeScreenshot);
    
    // 删档
    deleteBtn.addEventListener('click', deleteDrawing);
    
    // 鼠标/触摸事件处理
    function startDrawing(e) {
        isDrawing = true;
        
        let clientX, clientY;
        if (e.type.includes('touch')) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const rect = canvas.getBoundingClientRect();
        startX = clientX - rect.left;
        startY = clientY - rect.top;
        
        if (currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(startX, startY, ctx.lineWidth / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.strokeStyle = currentColor;
        }
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        let clientX, clientY;
        if (e.type.includes('touch')) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        if (currentTool === 'eraser') {
            ctx.beginPath();
            ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
    
    function stopDrawing() {
        isDrawing = false;
        saveDrawing();
    }
    
    // 鼠标事件
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // 触摸事件
    canvas.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            startDrawing(e);
        }
    });
    
    canvas.addEventListener('touchmove', function(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            draw(e);
        }
    });
    
    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        stopDrawing();
    });
    
    // 定期自动保存
    setInterval(saveDrawing, 5000);
});
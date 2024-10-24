document.addEventListener('DOMContentLoaded', function() {
    // Fungsi menggambar grid dan sumbu yang presisi
function drawGrid(ctx, width, height) {
    const unitSize = 25; // Ukuran satuan grid, disesuaikan agar lebih rapi
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
  
    ctx.clearRect(0, 0, width, height);
  
    // Gambar garis grid
    ctx.beginPath();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
  
    for (let x = 0; x <= width; x += unitSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
  
    for (let y = 0; y <= height; y += unitSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();
  
    // Gambar sumbu X dan Y di atas garis grid
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
  
    // Sumbu Y
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
  
    // Sumbu X
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
  
    // Gambar label koordinat
    ctx.font = '12px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
  
    // Label sumbu X
    for (let x = -Math.floor(width / (2 * unitSize)) + 1; x < Math.floor(width / (2 * unitSize)); x++) {
        const canvasX = centerX + x * unitSize;
        if (x !== 0) ctx.fillText(x, canvasX, centerY + 15); // Beri sedikit offset
    }
  
    // Label sumbu Y
    ctx.textAlign = 'right';
    for (let y = -Math.floor(height / (2 * unitSize)) + 1; y < Math.floor(height / (2 * unitSize)); y++) {
        const canvasY = centerY - y * unitSize;
        if (y !== 0) ctx.fillText(y, centerX - 5, canvasY + 5);
    }
}
  
  // Fungsi untuk menampilkan koordinat dan titik saat hover
function showCoordinates(canvas, ctx) {
    const unitSize = 25; // Ukuran yang sama dengan grid
    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor(canvas.height / 2);
  
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        
        // Scaling untuk memastikan koordinat sesuai dengan ukuran logis canvas
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
  
        const mouseX = (event.clientX - rect.left) * scaleX; // Menggunakan scaling untuk X
        const mouseY = (event.clientY - rect.top) * scaleY;  // Menggunakan scaling untuk Y
  
        const x = Math.round((mouseX - centerX) / unitSize); // Gunakan Math.round untuk akurasi lebih tinggi
        const y = -Math.round((mouseY - centerY) / unitSize);
  
        // Batasi koordinat hanya pada rentang -7 hingga 7
        if (x < -7 || x > 7 || y < -7 || y > 7) {
            drawGrid(ctx, canvas.width, canvas.height); // Gambar ulang grid tanpa koordinat di luar rentang
            return; // Jika koordinat di luar batas, tidak tampilkan apa pun
        }
  
        drawGrid(ctx, canvas.width, canvas.height); // Gambar ulang grid
  
        // Tampilkan koordinat di atas posisi kursor mouse
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText(`(${x}, ${y})`, mouseX + 15, mouseY - 15); // Koordinat sekarang lebih dekat dengan kursor
  
        // Gambar titik pada grid di posisi hover
        const hoverX = centerX + x * unitSize;
        const hoverY = centerY - y * unitSize;
  
        ctx.beginPath();
        ctx.arc(hoverX, hoverY, 3, 0, Math.PI * 2); // Gambar titik kecil
        ctx.fillStyle = 'red';
        ctx.fill();
    });
  
    // Event listener untuk menghapus koordinat dan titik ketika kursor keluar dari canvas
    canvas.addEventListener('mouseout', () => {
        drawGrid(ctx, canvas.width, canvas.height); // Gambar ulang grid tanpa titik dan koordinat
    });
}
  
// Fungsi menggambar grafik dengan slider
function drawGraph(ctx, equation, sliders) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawGrid(ctx, ctx.canvas.width, ctx.canvas.height);
  
    const [a, b, c, d] = sliders.map(slider => parseFloat(slider.value));
  
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
  
    for (let x = -10; x <= 10; x += 0.1) {
        const y = equation(x, a, b, c, d);
        const canvasX = ctx.canvas.width / 2 + x * 40;
        const canvasY = ctx.canvas.height / 2 - y * 40;
  
        if (x === -10) ctx.moveTo(canvasX, canvasY);
        else ctx.lineTo(canvasX, canvasY);
    }
    ctx.stroke();
}
  
// Fungsi untuk mengatur grafik dan slider
function setupGraph(graphId, equation) {
    const canvas = document.getElementById(`${graphId}-graph`);
    const ctx = canvas.getContext('2d');
    const sliders = Array.from(document.querySelectorAll(`#${graphId} input[type="range"]`));
  
    // Event listener untuk slider input
    sliders.forEach(slider => {
        slider.addEventListener('input', () => {
            drawGraph(ctx, equation, sliders);
            updateEquationDisplay(graphId, sliders, graphId); // Meneruskan jenis grafik
        });
    });
  
    // Event listener untuk dropdown comparator
    const comparatorDropdown = document.querySelector(`#${graphId} .comparator`);
    comparatorDropdown.addEventListener('change', () => {
        updateEquationDisplay(graphId, sliders, graphId); // Meneruskan jenis grafik
    });
  
    // Gambar grafik awal dan update tampilan persamaan
    drawGraph(ctx, equation, sliders);
    updateEquationDisplay(graphId, sliders, graphId); // Meneruskan jenis grafik
    showCoordinates(canvas, ctx);
}
  
// Fungsi memperbarui persamaan sesuai slider dan jenis grafik
function updateEquationDisplay(graphId, sliders, graphType) {
    const equationDisplay = document.getElementById(`${graphId}-equation-display`);
    const comparator = document.querySelector(`#${graphId} .comparator`).value;
    const [a, b, c, d] = sliders.map(slider => slider.value);
  
    // Pilih persamaan berdasarkan jenis grafik
    let equation = "";
  
    switch(graphType) {
      case "cubic":
        // Persamaan kubik: y = ax³ + bx² + cx + d
        equation = `y ${comparator} ${a}x³ + ${b}x² + ${c}x + ${d}`;
        break;
  
      case "sinus":
        // Persamaan sinus: y = a sin(x)³ + b sin(x)² + c sin(x) + d
        equation = `y ${comparator} ${a}sin(x)³ + ${b}sin(x)² + ${c}sin(x) + ${d}`;
        break;
  
      case "cosinus":
        // Persamaan cosinus: y = a cos(x)³ + b cos(x)² + c cos(x) + d
        equation = `y ${comparator} ${a}cos(x)³ + ${b}cos(x)² + ${c}cos(x) + ${d}`;
        break;
  
      case "tangen":
        // Persamaan tangen: y = a tan(x)³ + b tan(x)² + c tan(x) + d
        equation = `y ${comparator} ${a}tan(x)³ + ${b}tan(x)² + ${c}tan(x) + ${d}`;
        break;
  
      default:
        equation = "Invalid graph type";
    }
  
    // Update tampilan persamaan
    equationDisplay.textContent = equation;
  
    // Update nilai slider yang tampil di atas slider
    document.getElementById(`${graphId}-a-value`).textContent = a;
    document.getElementById(`${graphId}-b-value`).textContent = b;
    document.getElementById(`${graphId}-c-value`).textContent = c;
    document.getElementById(`${graphId}-d-value`).textContent = d;
    document.getElementById(`${graphId}-comparator-value`).textContent = comparator;
  }
  
  // Persamaan untuk grafik
  const cubicEquation = (x, a, b, c, d) => a * x ** 3 + b * x ** 2 + c * x + d;
  const sinusEquation = (x, a, b, c, d) => a * Math.sin(x) ** 3 + b * Math.sin(x) ** 2 + c * Math.sin(x) + d;
  const cosinusEquation = (x, a, b, c, d) => a * Math.cos(x) ** 3 + b * Math.cos(x) ** 2 + c * Math.cos(x) + d;
  const tangenEquation = (x, a, b, c, d) => {
    const val = a * Math.tan(x) ** 3 + b * Math.tan(x) ** 2 + c * Math.tan(x) + d;
    return Math.abs(val) > 10 ? NaN : val; // Hindari nilai tak terhingga
};
  
// Setup semua grafik
setupGraph('cubic', cubicEquation);
setupGraph('sinus', sinusEquation);
setupGraph('cosinus', cosinusEquation);
setupGraph('tangen', tangenEquation);
  
// Toggle menu di mobile
function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('active');
}
  
  // Smooth scroll ke section tertentu
  function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
    const navLinks = document.getElementById('nav-links');
    if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
  }
  
// Fungsi untuk menampilkan halaman tertentu
function showPage(page) {
    const homeSection = document.getElementById('home');
    const simulationSection = document.getElementById('simulation');
  
    if (page === 'home') {
        homeSection.style.display = 'block';
        simulationSection.style.display = 'none';
    } else {
        homeSection.style.display = 'none';
        simulationSection.style.display = 'block';
    }
  
    toggleMenu();
}
});
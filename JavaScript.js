function convertirSaltosDeLinea(texto) {
    if (!texto) return "";
    return texto
        .split('\n')
        .map(linea => `<p>${linea.trim()}</p>`)
        .join('');
}

document.getElementById('conexion').addEventListener('change', function (e) {
    mostrarImagenesEnDiv(e.target.files, 'previewconexion');
});

document.getElementById('vista').addEventListener('change', function (e) {
    mostrarImagenesEnDiv(e.target.files, 'previewvista');
});

document.getElementById('captura').addEventListener('change', function (e) {
    mostrarImagenesEnDiv(e.target.files, 'previewcaptura');
});

document.getElementById('revisar').addEventListener('change', function (e) {
    mostrarImagenesEnDiv(e.target.files, 'previewrevisar');
});

document.getElementById('revision').addEventListener('change', function (e) {
    mostrarImagenesEnDiv(e.target.files, 'previewrevision');
});


function mostrarImagenesEnDiv(files, divId) {
    const contenedor = document.getElementById(divId);
    contenedor.innerHTML = ''; // Limpia el contenedor antes de mostrar nuevas imágenes

    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return; // Solo imágenes

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '300px';
            img.style.display = 'block';
            img.style.margin = '10px 0';
            contenedor.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

function reemplazarTextareasPorTexto() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach((textarea) => {
        const div = document.createElement('div');
        div.innerHTML = convertirSaltosDeLinea(textarea.value);
        div.style.border = "none";
        div.style.whiteSpace = "pre-wrap";
        div.className = textarea.className;
        div.style.fontFamily = "inherit";
        textarea.parentNode.replaceChild(div, textarea);
    });

    // Aplica sangría a los <p> que empiezan en mayúscula
    document.querySelectorAll('.contenidoPDF p').forEach(p => {
        const texto = p.textContent.trim();
        if (texto && texto[0] === texto[0].toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(texto[0])) {
            p.classList.add('sangria');
        }
    });

    // Asegura que los inputs no tengan borde ni fondo
    document.querySelectorAll('input[type="text"], input[type="date"]').forEach(input => {
        input.style.border = 'none';
        input.style.background = 'none';
    });
}

function descargarPDF() {
    try {
        const boton = document.querySelector('#descargarPDF');
        boton.style.display = 'none';

        // Oculta los botones de subir imagen
        const uploadButtons = document.querySelectorAll('.file-upload-btn');
        uploadButtons.forEach(btn => btn.style.display = 'none');

        reemplazarTextareasPorTexto();

        const resumen = document.querySelector('.contenidoPDF');
        const fechaTexto = document.getElementById('fecha').value.trim() || '';

        const opciones = {
            margin: [20, 10, 10, 10],
            filename: 'Revisión Remota Davantis.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, scrollY: 0 },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            },
            pagebreak: { mode: ['css', 'legacy'], avoid: ['.portada', '.informacion', '.info'] }
        };

        html2pdf()
            .set(opciones)
            .from(resumen)
            .toPdf()
            .get('pdf')
            .then(function (pdf) {
                const totalPages = pdf.internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);
                    pdf.setFontSize(10);
                    pdf.setTextColor(100);

                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();

                    if (fechaTexto) {
                        pdf.text(fechaTexto, pageWidth - 10, 10, { align: 'right' });
                    }
                    pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                }
            })
            .save()
            .then(() => {
                // Restaura la visibilidad de los botones
                boton.style.display = 'inline-block';
                uploadButtons.forEach(btn => btn.style.display = 'inline-block');
            });
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        alert('Ocurrió un error al generar el PDF. Revisa la consola para más detalles.');
        const boton = document.querySelector('#descargarPDF');
        boton.style.display = 'inline-block';
        // Restaura los botones en caso de error
        document.querySelectorAll('.file-upload-btn').forEach(btn => btn.style.display = 'inline-block');
    }
}
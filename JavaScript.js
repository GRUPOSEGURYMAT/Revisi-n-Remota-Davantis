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

document.getElementById('info').addEventListener('change', function (e) {
    mostrarImagenesEnDiv(e.target.files, 'previewinfo');
});

// Aquí reemplazamos el listener para "revisar" para que muestre imagen + botón borrar
document.getElementById('revisar').addEventListener('change', function (e) {
    mostrarImagenesConBorrar(e.target.files, 'previewrevisar');
});

document.getElementById('revision').addEventListener('change', function (e) {
    mostrarImagenesEnDiv(e.target.files, 'previewrevision');
});

document.getElementById('observaciones').addEventListener('change', function (e) {
    mostrarImagenesEnDiv(e.target.files, 'previewobservaciones');
});

// Función que usas para mostrar imágenes normales (sin botón borrar)
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

// NUEVA función para mostrar imágenes con botón "X" para borrar
function mostrarImagenesConBorrar(files, divId) {
    const contenedor = document.getElementById(divId);
    contenedor.innerHTML = ''; // Limpiar antes

    Array.from(files).forEach((file, index) => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.display = 'inline-block';
            wrapper.style.margin = '5px';

            const img = document.createElement('img');
            img.src = event.target.result;
            img.style.maxWidth = '150px';
            img.style.maxHeight = '150px';
            img.style.display = 'block';
            img.style.border = '1px solid #ccc';
            img.style.borderRadius = '4px';

            const btnBorrar = document.createElement('button');
            btnBorrar.textContent = '×';
            btnBorrar.style.position = 'absolute';
            btnBorrar.style.top = '2px';
            btnBorrar.style.right = '2px';
            btnBorrar.style.background = 'rgba(0,0,0,0.6)';
            btnBorrar.style.color = 'white';
            btnBorrar.style.border = 'none';
            btnBorrar.style.borderRadius = '50%';
            btnBorrar.style.width = '20px';
            btnBorrar.style.height = '20px';
            btnBorrar.style.cursor = 'pointer';
            btnBorrar.title = "Eliminar imagen";

            // ¡Aquí añades la clase!
            btnBorrar.classList.add('btn-borrar-imagen');

            btnBorrar.addEventListener('click', () => {
                wrapper.remove();
                // Nota: Esto borra solo la imagen del preview, no del input file
            });

            wrapper.appendChild(img);
            wrapper.appendChild(btnBorrar);
            contenedor.appendChild(wrapper);
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

    document.querySelectorAll('.contenidoPDF p').forEach(p => {
        const texto = p.textContent.trim();
        if (texto && texto[0] === texto[0].toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(texto[0])) {
            p.classList.add('sangria');
        }
    });

    document.querySelectorAll('input[type="text"], input[type="date"]').forEach(input => {
        input.style.border = 'none';
        input.style.background = 'none';
    });
}

function descargarPDF() {
    try {
        const boton = document.querySelector('#descargarPDF');
        boton.style.display = 'none';


        document.querySelectorAll('.btn-borrar-imagen').forEach(btn => {
    btn.style.display = 'none';
});

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
                boton.style.display = 'inline-block';
                uploadButtons.forEach(btn => btn.style.display = 'inline-block');
                document.querySelectorAll('.btn-borrar-imagen').forEach(btn => {
        btn.style.display = 'inline-block';
    });
            });
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        alert('Ocurrió un error al generar el PDF. Revisa la consola para más detalles.');
        const boton = document.querySelector('#descargarPDF');
        boton.style.display = 'inline-block';
        document.querySelectorAll('.file-upload-btn').forEach(btn => btn.style.display = 'inline-block');
    }
}

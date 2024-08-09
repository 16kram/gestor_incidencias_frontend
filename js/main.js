const ID = 0;//Columna 'id' de la tabla
const ESTADO = 9;//Columna 'estado' de la tabla
var usuario, clave, jwt;

//Iniciar aplicación
function iniciar() {

    //Insignía 'en línea'
    var en_linea = document.getElementById("en_linea");

    //Login
    var boton = document.getElementById("boton_login");
    boton.addEventListener("click", boton_login);
    usuario = document.getElementById("usuario");
    clave = document.getElementById("clave");

    /*//Admin
    var boton_administrador = document.getElementById("boton_admin");
    boton_administrador.addEventListener("click", boton_admin);*/

    //Tabla de incidencias
    var tabla_incidencias = document.getElementById("tabla_incidencias");
    tabla_incidencias.addEventListener("click", seleccion_incidencia);

    //Añadir incidencias
    var solicitante = document.getElementById("solicitante");
    var oficina = document.getElementById("oficina");
    var servicio = document.getElementById("servicio");
    var descripcion = document.getElementById("descripcion");
    var comentarios = document.getElementById("comentarios");
    var ubicacion = document.getElementById("ubicacion");
    var planta = document.getElementById("planta");
    var departamento = document.getElementById("departamento");
    var nueva_incidencia = document.getElementById("nueva_incidencia");
    nueva_incidencia.addEventListener("click", crear_incidencia);

}

//Autenticarse
function boton_login() {
    console.log("botón pulsado");
    console.log("usuario=" + usuario.value);
    console.log("contraseña=" + clave.value);
    var login = {
        username: usuario.value,
        password: clave.value
    };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(login),
    };
    fetch('http://localhost:8080/usuario/login', options)
        .then(data => {
            if (!data.ok) {
                en_linea.style.display = 'none';//Se oculta 'en línea'
                throw Error(data.status);
            }
            return data.json();
        }).then(token => {
            jwt = token;
            console.log(jwt.token);
            en_linea.style.display = 'inline';//Se muestra 'en línea'
            listar_incidencias();
        }).catch(e => {
            console.log(e);
        });
}

// Listar incidencias
async function listar_incidencias() {
    console.log("botón listar incidencias");
    var datos = [];
    const mi_token = "Bearer " + jwt.token;
    try {
        let response = await fetch('http://localhost:8080/incidencias/listar', {
            method: 'GET',
            headers: {
                "Authorization": mi_token // token
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        let data = await response.json();
        datos = data;
    } catch (error) {
        console.error('Fetch error:', error);
    }
    datos.reverse();//Se ponen las incidencias más recientes al principio de la tabla
    //Se crea la tabla de incidencias
    var tbody = document.querySelector("tbody");
    tbody.innerHTML = ""//Se borran los datos de la tabla
    for (var n = 0; n < datos.length; n++) {

        var newline_tabla = document.querySelector("tbody");
        var fila = document.createElement("tr");

        var celda = document.createElement("td");
        celda.innerText = datos[n].id;
        fila.appendChild(celda);

        var celda = document.createElement("td");
        celda.innerText = datos[n].solicitante;
        fila.appendChild(celda);

        var celda = document.createElement("td");
        celda.innerText = datos[n].servicio;
        fila.appendChild(celda);

        var celda = document.createElement("td");
        celda.innerText = datos[n].descripcion;
        fila.appendChild(celda);

        var celda = document.createElement("td");
        celda.innerText = datos[n].departamento;
        fila.appendChild(celda);

        var celda = document.createElement("td");
        celda.innerText = datos[n].planta;
        fila.appendChild(celda);

        var celda = document.createElement("td");
        celda.innerText = datos[n].ubicacion;
        fila.appendChild(celda);


        var celda = document.createElement("td");
        celda.innerText = datos[n].fechaInicio;
        fila.appendChild(celda);

        var celda = document.createElement("td");
        celda.innerText = datos[n].fechaFin;
        fila.appendChild(celda);

        var celda = document.createElement("td");
        celda.innerText = datos[n].estado;
        fila.appendChild(celda);
        switch (datos[n].estado) {//Pone color en el texto de 'ESTADO'
            case "FINALIZADA":
                celda.style.color = "green";
                break;
            case "EN_CURSO":
                celda.style.color = "yellow";
                break;
            case "PENDIENTE":
                celda.style.color = "red";
                break;
        }

        newline_tabla.appendChild(fila);
    }
    listado.style.display = 'block';//Muestra el listado de incidencias
}


//botón Admin
async function boton_admin() {
    console.log("Botón admin pulsado");
    var datos = [];
    const mi_token = "Bearer " + jwt.token;
    try {
        let response = await fetch('http://localhost:8080/usuario/admin', {
            method: 'GET',
            headers: {
                "Authorization": mi_token, // token
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        let data = await response.text();
        datos = data;
    } catch (error) {
        console.error('Fetch error:', error);
        console.error(error.stack); // Para más detalles del error
    }
    console.log(datos);
}


//Selección de las incidencias de la tabla para cambiar el estado o ver la descripción
async function seleccion_incidencia(event) {
    var celda = event.target;
    if (celda.tagName === 'TD') {
        var row = celda.parentNode;//Obtener la fila que contiene la celda
        var primeraCelda = row.cells[ID];//Obtener la primera celda de la fila
        var contenidoPrimeraCelda = primeraCelda.textContent;//Obtener el contenido de la primera celda
        console.log('Id de la incidencia:', contenidoPrimeraCelda);
        if (celda.cellIndex == ESTADO) {//Sólo cambia la celda de estado cuando se hace click en una columna de 'Estado'
            //Se hace la peticion cambiar estado
            var datos = [];
            const mi_token = "Bearer " + jwt.token;
            try {
                let response = await fetch('http://localhost:8080/incidencias/modificarestado/' + contenidoPrimeraCelda, {
                    method: 'PUT',
                    headers: {
                        "Authorization": mi_token, // token
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                let data = await response.text();
                datos = data;
            } catch (error) {
                console.error('Fetch error:', error);
                console.error(error.stack); // Para más detalles del error
            }
            console.log("Estado=" + datos);
            //Se hace la petición obtenerEstado
            var datos = [];
            try {
                let response = await fetch('http://localhost:8080/incidencias/obtenerestado/' + contenidoPrimeraCelda, {
                    method: 'GET',
                    headers: {
                        "Authorization": mi_token, // token
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                let data = await response.text();
                datos = data;
            } catch (error) {
                console.error('Fetch error:', error);
                console.error(error.stack); // Para más detalles del error
            }
            console.log("Estado=" + datos);
            listar_incidencias();
        } else {
            //Se abre el detalle de la descripción de la incidencia
            console.log("Se abre el detalle de la incidencia con id=" + contenidoPrimeraCelda);
        }
    }
}

//Crear incidencia
function crear_incidencia() {
    console.log("Nueva incidencia");
    console.log("Solicitante=" + solicitante.value);
    console.log("Oficina=" + oficina.value);
    var incidencia = {
        solicitante: solicitante.value,
        oficina: oficina.value,
        servicio: servicio.value,
        descripcion: descripcion.value,
        comentarios: comentarios.value,
        ubicacion: ubicacion.value,
        planta: planta.value,
        departamento: departamento.value
    };
    const mi_token = "Bearer " + jwt.token;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": mi_token, // token,
        },
        body: JSON.stringify(incidencia),
    };
    fetch('http://localhost:8080/incidencias/alta', options)
        .then(data => {
            if (!data.ok) {
                throw Error(data.status);
            }
            solicitante.value = "";//Se borran los campos de nueva incidencia
            descripcion.value = "";
            comentarios.value = "";
            departamento.value = "";
            ubicacion.value = "";
            listar_incidencias();//Se listan las incidencias
        }).then(response => {
        }).catch(e => {
            console.log(e);
        });
}


window.addEventListener("load", iniciar);
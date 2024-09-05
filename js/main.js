const ID = 0;//Columna 'id' de la tabla incidencias y usuarios
const ESTADO = 9;//Columna 'estado' de la tabla incidencias
const BORRAR_USUARIO = 6;//Columna 'borrar usuario' de la tabla usuarios
const DOMINIO = "https://estebanpa.ddns.net:8443";//Nombre de dominio del servidor
var usuario, clave, jwt;
var solicitante_rellenar;
var nombre_de_usuario;//Nombre del usuario para mostrar en la barra de navegación
var id_nombre_usuario;//Nombre de usuario para el listado de incidencias
var rol_usuario;

//Iniciar aplicación
function iniciar() {

    //Insignía 'en línea'
    var en_linea = document.getElementById("en_linea");

    //Login
    var boton = document.getElementById("boton_login");
    boton.addEventListener("click", boton_login);
    usuario = document.getElementById("usuario");
    clave = document.getElementById("clave");

    //Tabla de incidencias
    var tabla_incidencias = document.getElementById("tabla_incidencias");
    tabla_incidencias.addEventListener("click", seleccion_incidencia);

    //Tabla de usuarios
    var tabla_usuarios = document.getElementById("tabla_usuarios");
    tabla_usuarios.addEventListener("click", desea_eliminar_usuario);

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
    var validar_incidencia = document.getElementById("crear_incidencia_visible");
    validar_incidencia.addEventListener("input", validacion_incidencia);

    //Añadir usuarios
    var nuevo_usuario = document.getElementById("nuevo_usuario");
    nuevo_usuario.addEventListener("click", crear_usuario);
    var validar_usuario = document.getElementById("crear_usuario_visible");
    validar_usuario.addEventListener("input", validacion_usuario);

    //Iconos de la barra de navegación
    var icono_administrador = document.getElementById("icono_administrador");
    icono_administrador.addEventListener("click", listar_usuarios);
    var icono_listado_incidencias = document.getElementById("icono_incidencias");
    icono_listado_incidencias.addEventListener("click", listar_incidencias);

    //Mensaje de advertencia por campos del formulario no rellenados
    var cerrar_advertencia = document.getElementById("boton_cerrar_advertencia");
    cerrar_advertencia.addEventListener("click", cerrar_mensaje_advertencia);
    var x_cerrar_advertencia = document.getElementById("x_cerrar_advertencia");
    x_cerrar_advertencia.addEventListener("click", cerrar_mensaje_advertencia);

    //Mensaje de advertencia de fallo de autenticación
    var cerrar_advertencia_autenticacion = document.getElementById("boton_cerrar_advertencia_autenticacion");
    cerrar_advertencia_autenticacion.addEventListener("click", cerrar_mensaje_advertencia);
    var x_cerrar_advertencia_autenticacion = document.getElementById("x_cerrar_advertencia_autenticacion");
    x_cerrar_advertencia_autenticacion.addEventListener("click", cerrar_mensaje_advertencia);

    //Mensaje de advertencia de que el usuario ya existe
    var cerrar_advertencia_usuario_existe = document.getElementById("boton_cerrar_advertencia_usuario_existe");
    cerrar_advertencia_usuario_existe.addEventListener("click", cerrar_mensaje_advertencia);
    var x_cerrar_advertencia_usuario_existe = document.getElementById("x_cerrar_advertencia_usuario_existe");
    x_cerrar_advertencia_usuario_existe.addEventListener("click", cerrar_mensaje_advertencia);

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
    fetch(DOMINIO + '/usuario/login', options)
        .then(data => {
            if (!data.ok) {
                en_linea.style.display = 'none';//Se oculta 'en línea'
                document.getElementById("advertencia_autenticacion").style.display = "block";
                var sonido_advertencia = new Audio("audio/aviso.mp3");
                sonido_advertencia.play();
                usuario.value = "";
                clave.value = "";
                throw Error(data.status);
            }
            return data.json();
        }).then(token => {
            jwt = token;
            console.log(jwt.token);
            en_linea.style.display = 'inline';//Se muestra 'en línea'
            icono_incidencias.style.display = 'block';//Se muestra el icono de listado de incidencias
            nombre_de_usuario = usuario.value;
            id_nombre_usuario = usuario.value;//Nombre de usuario que se utiliza como id para listar las incidencias
            listar_incidencias();
            inserta_solicitante();//Inserta en el campo de crear incidencias el solicitante
            usuario.value = "";
            clave.value = "";
        }).catch(e => {
            console.log(e);
        });
}

// Listar incidencias
async function listar_incidencias() {
    console.log("Listar incidencias-->id_usuario=" + id_nombre_usuario);
    usuarios.style.display = 'none';//Oculta el listado de usuarios 
    listado.style.display = 'block';//Muestra el listado de incidencias
    var datos = [];
    const mi_token = "Bearer " + jwt.token;
    try {
        let response = await fetch(DOMINIO + '/incidencias/listar/' + id_nombre_usuario, {
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
    var tbody = document.querySelector("#tabla_incidencias tbody");
    tbody.innerHTML = ""//Se borran los datos de la tabla
    for (var n = 0; n < datos.length; n++) {

        var newline_tabla = document.querySelector("#tabla_incidencias tbody");
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
    nombre_de_usuario.innerHTML = solicitante_rellenar;//Muestra el nombre del usuario en la barra de navegación
    rol_usuario = await obtiene_rol_usuario(nombre_de_usuario);
    console.log("ROL=" + rol_usuario);
    if (rol_usuario == "ROLE_ADMIN") {
        icono_administrador.style.display = 'block';//Se muestra el icono de administrador
    } else {
        icono_administrador.style.display = 'none';//Se oculta el icono de administrador
    }
}


//botón Admin
async function boton_admin() {
    console.log("Botón admin pulsado");
    var datos = [];
    const mi_token = "Bearer " + jwt.token;
    try {
        let response = await fetch(DOMINIO + '/usuario/admin', {
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
                let response = await fetch(DOMINIO + '/incidencias/modificarestado/' + contenidoPrimeraCelda, {
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
                let response = await fetch(DOMINIO + '/incidencias/obtenerestado/' + contenidoPrimeraCelda, {
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
    if (!validacion_incidencia()) {
        document.getElementById("advertencia").style.display = "block";
        var sonido_advertencia = new Audio("audio/aviso.mp3");
        sonido_advertencia.play();
        return;
    }
    console.log("id_usuario=" + id_nombre_usuario);
    console.log("Nueva incidencia");
    console.log("Solicitante=" + solicitante.value);
    console.log("Oficina=" + oficina.value);
    var incidencia = {
        solicitante: solicitante_rellenar,
        oficina: oficina.value,
        servicio: servicio.value,
        descripcion: descripcion.value,
        comentarios: comentarios.value,
        ubicacion: ubicacion.value,
        planta: planta.value,
        departamento: departamento.value,
        idUsuario: id_nombre_usuario
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
    fetch(DOMINIO + '/incidencias/alta', options)
        .then(data => {
            if (!data.ok) {
                throw Error(data.status);
            }
            descripcion.value = "";//Se borran los campos de nueva incidencia
            comentarios.value = "";
            departamento.value = "";
            ubicacion.value = "";
            listar_incidencias();//Se listan las incidencias
        }).then(response => {
        }).catch(e => {
            console.log(e);
        });
}

//Añadimos el solicitante para crear una incidencia
async function inserta_solicitante() {
    const mi_token = "Bearer " + jwt.token;
    try {
        let response = await fetch(DOMINIO + '/usuario/nombreapellidos/' + nombre_de_usuario, {
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
        solicitante_rellenar = data;
    } catch (error) {
        console.error('Fetch error:', error);
        console.error(error.stack); // Para más detalles del error
    }
    console.log(solicitante_rellenar);
    solicitante.innerText = solicitante_rellenar;
    nombre_usuario.innerHTML = solicitante_rellenar;//Muestra el nombre del usuario en la barra de navegación
}

async function listar_usuarios() {
    console.log("Ha pulsado el icono ADMIN");
    // Listar incidencias
    listado.style.display = 'none';//Oculta el listado de incidencias
    usuarios.style.display = 'block';//Muestra el listado de usuarios
    var datos = [];
    const mi_token = "Bearer " + jwt.token;
    try {
        let response = await fetch(DOMINIO + '/usuario/listar', {
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
        console.log(datos);
    } catch (error) {
        console.error('Fetch error:', error);
    }
    datos.reverse();//Se ponen los usuarios más recientes al principio de la tabla
    //Se crea la tabla de usuarios
    var tbody = document.querySelector("#tabla_usuarios tbody");
    tbody.innerHTML = ""//Se borran los datos de la tabla
    for (var n = 0; n < datos.length; n++) {

        var newline_tabla = document.querySelector("#tabla_usuarios tbody");
        var fila = document.createElement("tr");

        var celda = document.createElement("td");
        celda.innerText = datos[n].id;
        fila.appendChild(celda);

        var celda = document.createElement("td");
        celda.innerText = datos[n].country;
        fila.appendChild(celda);

        var celda = document.createElement("td");
        celda.innerText = datos[n].firstname;
        fila.appendChild(celda);

        var celda = document.createElement("td");
        celda.innerText = datos[n].lastname;
        fila.appendChild(celda);

        var celda = document.createElement("td");
        celda.innerText = datos[n].username;
        fila.appendChild(celda);

        var celda = document.createElement("td");
        celda.innerText = datos[n].role;
        fila.appendChild(celda);

        var celda = document.createElement("td");
        var imagen = document.createElement("img");
        imagen.src = "img/icono_borrar_usuario.png";
        imagen.alt = "Imagen eliminar usuario";
        imagen.width = 30;
        imagen.height = 30;
        imagen.id = "imagen_" + n;//Asignamos un id único a cada imagen de 'eliminar usuario'
        imagen.dataset.userId = n; // Se añade el atributo data-user-id para almacenar el ID del usuario
        imagen.title = "Borra el usuario";
        celda.appendChild(imagen);
        fila.appendChild(celda);

        newline_tabla.appendChild(fila);
    }
    usuarios.style.display = 'block';//Muestra el listado de usuarios
}

//Crear usuario
function crear_usuario() {
    if (!validacion_usuario()) {
        document.getElementById("advertencia").style.display = "block";
        var sonido_advertencia = new Audio("audio/aviso.mp3");
        sonido_advertencia.play();
        return;
    }
    console.log("Nuevo usuario");
    console.log("Oficina=" + oficina.value);
    console.log("Nombre=" + firstname.value);
    console.log("Apellidos=" + lastname.value);
    console.log("Nombre de usuario=" + username.value);
    console.log("Contraseña=" + password.value);
    console.log("rol=" + role.value);
    var usuario = {
        country: country.value,
        firstname: firstname.value,
        lastname: lastname.value,
        role: role.value,
        username: username.value,
        password: password.value
    };
    const mi_token = "Bearer " + jwt.token;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": mi_token, // token,
        },
        body: JSON.stringify(usuario),
    };
    fetch(DOMINIO + '/usuario/alta', options)
        .then(data => {
            if (!data.ok) {
                throw Error(data.status);
            }
            firstname.value = "";//Se borran los campos del nuevo usuario
            lastname.value = "";
            username.value = "";
            password.value = "";
            listar_usuarios();//Se listan los usuarios
        }).then(response => {
        }).catch(e => {
            document.getElementById("advertencia_usuario_existe").style.display = "block";
            var sonido_advertencia = new Audio("audio/aviso.mp3");
            sonido_advertencia.play();
            console.log(e);
        });
}

//Validacion campos del formulario crear usuarios
function validacion_usuario() {
    console.log("validación");
    var ok = true;
    if (firstname.value == "") {
        firstname.style.background = "#FFDDDD";
        ok = false;
    } else {
        firstname.style.background = "#FFFFFF";
    }
    if (lastname.value == "") {
        lastname.style.background = "#FFDDDD";
        ok = false;
    } else {
        lastname.style.background = "#FFFFFF";
    }
    if (username.value == "") {
        username.style.background = "#FFDDDD";
        ok = false;
    } else {
        username.style.background = "#FFFFFF";
    }
    if (password.value == "") {
        password.style.background = "#FFDDDD";
        ok = false;
    } else {
        password.style.background = "#FFFFFF";
    }
    return ok;
}


//Validacion de campos del formulario crear usuarios
function validacion_usuario() {
    console.log("validación");
    var ok = true;
    if (firstname.value == "") {
        firstname.style.background = "#FFDDDD";
        ok = false;
    } else {
        firstname.style.background = "#FFFFFF";
    }
    if (lastname.value == "") {
        lastname.style.background = "#FFDDDD";
        ok = false;
    } else {
        lastname.style.background = "#FFFFFF";
    }
    if (username.value == "") {
        username.style.background = "#FFDDDD";
        ok = false;
    } else {
        username.style.background = "#FFFFFF";
    }
    if (password.value == "") {
        password.style.background = "#FFDDDD";
        ok = false;
    } else {
        password.style.background = "#FFFFFF";
    }
    return ok;
}

//Validacion de campos del formulario crear incidencia
function validacion_incidencia() {
    console.log("validación");
    var ok = true;
    if (descripcion.value == "") {
        descripcion.style.background = "#FFDDDD";
        ok = false;
    } else {
        descripcion.style.background = "#FFFFFF";
    }
    return ok;
}

function cerrar_mensaje_advertencia() {
    console.log("Cerrar advertencia");
    document.getElementById("advertencia").style.display = "none";
    document.getElementById("advertencia_autenticacion").style.display = "none";
    document.getElementById("advertencia_usuario_existe").style.display = "none";
}


//Preguntar si desea eliminar el usuario
function desea_eliminar_usuario(event) {
    var target = event.target;
    if (target.tagName === "IMG") {
        // Encontramos la fila que contiene la imagen clicada
        var fila = target.closest("tr"); // Subimos hasta la fila
        if (fila) {
            var id_eliminar = fila.children[0].innerText; // Obtenemos el ID de la primera columna
            console.log("id del usuario a eliminar=" + id_eliminar);
            //Mostramos mensaje de advertencia
            document.getElementById("advertencia_eliminar_usuario").style.display = "block";
            var sonido_advertencia = new Audio("audio/aviso.mp3");
            sonido_advertencia.play();
            document.getElementById("boton_advertencia_eliminar_usuario_si").addEventListener("click", function () {
                eliminar_usuario(id_eliminar);
            }, { once: true });

            document.getElementById("x_cerrar_advertencia_eliminar_usuario").addEventListener("click", function () {
                document.getElementById("advertencia_eliminar_usuario").style.display = "none";//Ocultamos mensaje advertencia
                return;
            }, { once: true });
            document.getElementById("boton_advertencia_eliminar_usuario_no").addEventListener("click", function () {
                document.getElementById("advertencia_eliminar_usuario").style.display = "none";//Ocultamos mensaje advertencia
                return;
            }, { once: true });
        }
    }
}

//Eliminar usuario
async function eliminar_usuario(id_eliminar) {
    console.log("eliminamos el usuario");
    var datos = [];
    const mi_token = "Bearer " + jwt.token;
    try {
        console.log("ID dentro de=" + id_eliminar);
        let response = await fetch(DOMINIO + '/usuario/bajaporid/' + id_eliminar, {
            method: 'DELETE',
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
    document.getElementById("advertencia_eliminar_usuario").style.display = "none";//Ocultamos mensaje advertencia
    listar_usuarios();
}

//Obtiene el rol de un usuario
async function obtiene_rol_usuario(nombre_de_usuario) {
    const mi_token = "Bearer " + jwt.token;
    try {
        let response = await fetch(DOMINIO + '/usuario/rolusuario/' + nombre_de_usuario, {
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
        rol_usuario = data;
    } catch (error) {
        console.error('Fetch error:', error);
        console.error(error.stack); // Para más detalles del error
    }
    console.log(rol_usuario);
    return rol_usuario
}

window.addEventListener("load", iniciar);
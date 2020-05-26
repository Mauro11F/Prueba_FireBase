// #######################################################
// CHEQUEO DEL LOGIN(mostrar o no partes de la navegacion)
// #######################################################
const noLogeado = document.querySelectorAll('.noLogeado');
const siLogeado = document.querySelectorAll('.siLogeado');

const loginCheck = user => {
    if (user) {
        siLogeado.forEach(link => link.style.display = 'block');//si el usuario esta logeado que muestre lo correspondiente (cerrar session)
        noLogeado.forEach(link => link.style.display = 'none');//si el usuario no esta logeado que muestre lo correspondiente (iniciar sesion y registrarse)
    }else {
        siLogeado.forEach(link => link.style.display = 'none');
        noLogeado.forEach(link => link.style.display = 'block');
    }
}


// ##########################################################################################
// CHEQUEO DEL EMAIL EXISTENTE(mostrar el mensaje de que ya existe el email y/o usuario)
// ##########################################################################################
const emailExist = document.querySelectorAll('.emailExist');

const emailCheck = error => {
    if (error) {
        console.log("entro en error funcion");
        emailExist.forEach(code => code.style.display = 'block');
        // ingreso a todas las funciones(close) para afectar a al estilo(style) de las alertas y ocultarlas
        $('.close').click(function(){
            $('.emailExist').css('display', 'none');
            // al darle a las X de salida(tanto form como alert) se borra el contenido de los input del form para rellenarlos de nuevo con info correcta
            registroForm.reset();
            ingresoform.reset();
        });

    }else {
        emailExist.forEach(code => code.style.display = 'none');
    }
}


// ###################
// REGRISRO DE USUARIO
// ###################
const registroForm = document.querySelector('#registrarce-form');

registroForm.addEventListener('submit', (e) => {
    // desactivo la funcion pot defecto del submit o formulario para que no redirija la pagina
    e.preventDefault();

    const email = document.querySelector('#registrarce-email').value;
    const password = document.querySelector('#registrarce-password').value;


    // createUserWitchEmailAndPassword metodo para poder mandar
    // los datos(crea un usuario vasados en el usuario y contraseña que le mandemos)
    auth
        .createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            //limpiando formulario
            registroForm.reset();

            //cerrar modal (metodo sacado de la bootstrap) aun que es jquery
            $('#registrarceModal').modal("hide");

            console.log("Registrado");
        })
        .catch(error => {
            // console.log(error);
            // ver info.txt  -CAPTURA DE ERROR 400-
            if (error.code === "auth/email-already-in-use") {
                emailCheck(error);
                console.log("El correo ya existe");
            }else{
                console.log("otro error");
            }
        });
});
// ###################
// INGRESO DE USUARIO
// ###################
const ingresoform = document.querySelector('#ingresar-form');

ingresoform.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.querySelector('#ingresar-email').value;
    const password = document.querySelector('#ingresar-password').value;

    //signInWithEmailAndPassword comprueba si el usuario ingresado(correo) ya exciste
    auth
        .signInWithEmailAndPassword(email, password)
        .then(userCredential => {

            //limpiando formulario
            ingresoform.reset();

            //cerrar modal (metodo sacado de la bootstrap) aun que es jquery
            $('#ingresarModal').modal("hide");

            // console.log("Ingresado");
        })
        .catch(error => {
            // console.log(error);
            // ver info.txt  -CAPTURA DE ERROR 400-
            if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
                emailCheck(error);
                // console.log("Usuario no existente");
            }else{
                console.log("otro error");
                console.log(error);
            }
        });


})
// ###################
// CERRAR LA SESION
// ###################
const salirSesion = document.querySelector('#salir');
salirSesion.addEventListener('click', (e) => {
    e.preventDefault();
    // le digo que cierre la sesion que esta abierta
    auth.signOut().then(() => {
        console.log('Sesion Cerrada');
    });
});

// #########################
// GOOGLE INICIO DE SESSION
// #########################
const googleBoton = document.querySelector('#googleIni');
googleBoton.addEventListener('click', e => {
    // firebase provee un objeto Provider para saber con que queremos autenticar (google, facebook, twiter, etc)...
    const provider = new firebase.auth.GoogleAuthProvider();
    // "signWithPopup" intentara mostrar una ventana adicianal para poder autenticar con google(en este ejemplo)
    auth.signInWithPopup(provider)
        .then(resultado => {

            //cerrar modal (metodo sacado de la bootstrap) aun que es jquery
            $('#ingresarModal').modal("hide");

            // console.log("Ingresado");


        console.log("google inicio de sesion");
    })
    .catch(error => {
        console.log(error);
    })
});
// ##########################
// FACEBOOK INICIO DE SESSION
// ##########################
// para que mi app pueda autenticar con facebook tengo que registrar mi app en facebook(resgistrarla en facebook developers)
const facebookBoton = document.querySelector('#facebookIni');
facebookBoton.addEventListener('click', (e) => {
    e.preventDefault();
    const provider = new firebase.auth.FacebookAuthProvider();
    auth.signInWithPopup(provider)
        .then(resultado => {

            $('#ingresarModal').modal("hide");

        console.log("facebook inicio de sesion");
    })
    .catch(error => {
        console.log(error);
    })
});


// #########################
//PUBLICACIONES (rellenada)
// #########################
const listaPubli = document.querySelector('.publicaciones');
//tenemos que recorrer la collection para poder pintarlas en la web (Pues claro)
const confPubli = data => {
    if (data.length) { //si la lista tiene datos: recorremos
        let html= ''; //variable para almacenar la "lista"
        data.forEach(doc => { //recorremos la lista para despues concatenarlas en la variable "html"
            const publi = doc.data();//obtenemos los datos dentro de esa lista
            const li = `
                <li class="list-group-item list-group-item-action">
                    <h5>${publi.titulos}</h5>
                    <p>${publi.publicacion}</p>
                </li>
            `;
            html += li;
        });
        listaPubli.innerHTML = html;//rellenamos en el html con lo optenido de firebase o firestore
    } else {
        //solo es un mensaje en un parrafo "<p>"
        listaPubli.innerHTML = '<h2 class="text-center"> Logueate para ver las publicaciones </h2>';
    }
}

//eventos
//listar datos para los usuarios que estan autorizados
//si no estan logeados no mostrar datos de la pagina
//onAuthStateChanged() el metodo se dispara cada ves que cambia la autentificacion (ejemplo: un usuario se logea se dispara el metodo, un usuario sale de la sesion se dispara el metodo)
auth.onAuthStateChanged(user => {
    if (user) { // si existe el usuario se le da permiso de ver web
        fs.collection('publicaciones') // consulta a la collection publicaciones de firestore
            .get() //metodo traer los datos
            .then((snapshot) => { //muestrame los estados de los datos (snapshot)
                confPubli(snapshot.docs);
                loginCheck(user);// llamo a la funcion de chekeo (script "CHEQUEO DEL LOGIN")
            })
    }else { //si no... bueno mensaje y/o hacer dasaparecer publicaciones
        console.log('No hay usuario Registrado');
        loginCheck(user);
        //como no estoy logeado le muestro un arreglo vacio
        confPubli([]);
    }
});
